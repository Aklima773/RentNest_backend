import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";


import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../generated/prisma";



const router = Router();


router.get("/",
    auth(UserRole.admin),
    userController.getAllUser
)

router.post("/register",userController.registerUser)





router.get("/me", auth(UserRole.tenant, UserRole.landlord, UserRole.admin),
userController.getMyProfile

)

router.put("/my-profile", auth(UserRole.tenant, UserRole.landlord, UserRole.admin),
userController.updateMyProfile

)
router.put("/:id/status", auth(UserRole.admin),
userController.updateUserStatus

)
    
    


export const userRoutes = router;