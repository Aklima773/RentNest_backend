import { prisma } from "../../lib/prisma";
import config from "../../config";
import bcrypt from "bcryptjs";
import { RegisterUserPayload, UpdateStatusPayload } from "./user.interface";



const registerUserIntoDB = async (payload: RegisterUserPayload) =>{


      const {name, email, password, profilePhoto} = payload;
    
    const isUserExist = await prisma.user.findUnique({
        where: {email}
    })

    if(isUserExist){
        throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password,Number(config.bcrypt_salt_rounds))

    const createdUser = await prisma.user.create({
        data:{
            name,
            email,
            password : hashedPassword,
            profile:{
                create:{
                    profilePhoto
                }
            }
        }
    })



    const user = await prisma.user.findUnique({
        where : {
            id : createdUser.id,
            email : createdUser.email || email
        },
        omit : {
            password : true
        },
        include : {
            profile : true
        }
    })

    return user;
}



const getAllUser = async()=>{

    const user = await prisma.user.findMany({

         include :{
            profile : true
        },
         omit :{
            password : true
        },
    })

    return user;
}

const updateUserStatusIntoDB = async (userId: string, payload: UpdateStatusPayload) => {

  // 1. Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("User not found.");
  }

  // 2. Update user's ban status
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isBanned: payload.isBanned,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

const getMyProfileFromDB = async (userId : string) =>{

    const user = await prisma.user.findUniqueOrThrow({
        where : {id : userId},
        omit :{
            password : true
        },
        include :{
            profile : true
        }
    })

    return user;
}

const updateMyProfileInDB = async(userId: string, payload:any)=>{

    const{name,email,profilePhoto, bio} = payload;

    const updatedUser = await prisma.user.update({

        where:{id : userId},

        data:{
            name,
            email,
            profile:{
                update:{
                    profilePhoto,
                    bio
                }
            }
        },

        omit:{
            password:true
        },
        include:{
            profile:true
        }
    })

    return updatedUser;

}


export const userService ={
    registerUserIntoDB,
    getMyProfileFromDB,
    updateMyProfileInDB,
    getAllUser,
    updateUserStatusIntoDB
  
}