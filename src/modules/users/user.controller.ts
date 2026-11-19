
import { NextFunction, Request, Response} from "express";   
import httpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";



const registerUser = catchAsync (async (req: Request, res: Response, next:NextFunction)=>{

    const payload = req.body;

    const user = await userService.registerUserIntoDB(payload);
    sendResponse(res,{
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully",
        data:{user}
    })

});


const getMyProfile = catchAsync (async (req: Request, res: Response, next:NextFunction)=>{

   

    const profile = await userService.getMyProfileFromDB(req.user?.id as string)

   

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Profile fetched succeefully",
        data: {
            profile
        }
    })

})

const getAllUsers = catchAsync (async (req: Request, res: Response, next:NextFunction)=>{

   

    const user = await userService.getAllUser()

   

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Users Profile fetched succeefully",
        data: {
            user
        }
    })

})


const updateMyProfile = catchAsync (async (req: Request, res: Response, next:NextFunction)=>{

   const userId = req.user?.id as string;
   const payload = req.body;
   const updatedProfile = await userService.updateMyProfileInDB(userId, payload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Profile update succeefully",
        data: {
            updatedProfile
        }
    })

});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.updateUserStatusIntoDB(id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `User has been successfully ${result.isBanned ? "banned" : "unbanned"}`,
    data: result,
  });
});

export const userController ={
    registerUser ,
    getMyProfile,
    updateMyProfile,
    getAllUsers,
    updateUserStatus
}
   


   

   