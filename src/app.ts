import express, { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser" 
import config from "./config";
import cors from "cors";
import { authRoutes } from "./modules/auth/auth.routes";
import {reviewRoutes,} from "./modules/review/review.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { userRoutes } from "./modules/users/user.route";
import { propertyRoutes } from "./modules/property/property.route";
import { categoryRouter } from "./modules/category/category.route";
import { rentalRouter } from "./modules/rentalrequest/rentalrequest.route";
import { paymentRoutes } from "./modules/payment/payment.route";




const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials: true,
}))


const endpointSecret = config.stripe_webhook_secret

app.use("/api/subscription/webhook", express.raw({type: 'application/json'}))
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser())

app.get("/",async (req:Request, res:Response)=>{
    res.send("Welcome to RentNest Server!");

});


app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/categories", categoryRouter);
app.use("/api/properties", propertyRoutes)
app.use("/api/rentalrequest", rentalRouter)
app.use("/api/payments", paymentRoutes)

app.use("/api/reviews", reviewRoutes)



app.use(notFound)

app.use(globalErrorHandler)
export default app;