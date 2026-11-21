import { prisma } from "../../lib/prisma";
import config from "../../config";
import bcrypt from "bcryptjs";
import { RegisterUserPayload, UpdateStatusPayload } from "./user.interface";
import { UserRole } from "../../../prisma/schema/generated/prisma";





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



const updateUserStatusIntoDB = async (
  targetUserId: string,
  payload: UpdateStatusPayload,
  requester?: { id: string; role: string }
) => {
  // 1. Defense-in-depth role check
  if (requester && requester.role !== UserRole.admin) {
    throw new Error(
      "Only admins can ban or unban users."
    );
  }

  // 2. Validate payload
  if (typeof payload?.isBanned !== "boolean") {
    throw new Error(
      "isBanned must be a boolean (true or false)."
    );
  }

  // 3. Optional: prevent an admin from banning themselves
  if (requester && requester.id === targetUserId && payload.isBanned) {
    throw new Error(
      "Admins cannot ban their own account."
    );
  }

  // 4. Check if target user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!existingUser) {
    throw new Error("User not found.");
  }

  // 5. Optional: prevent banning another admin
  if (existingUser.role === UserRole.admin && payload.isBanned) {
    throw new Error(
      "Admin accounts cannot be banned."
    );
  }

  // 6. Update user's ban status
  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
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

    if (!userId) {
    throw new Error(
      "You are not logged in. Please log in to view your profile."
    );
  }
    const user = await prisma.user.findUniqueOrThrow({
        where : {id : userId},
        omit :{
            password : true
        },
        include :{
            profile : true
        }
    })

if (!user) {
    throw new Error(
      "User account not found. Please log in again."
    );
  }
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