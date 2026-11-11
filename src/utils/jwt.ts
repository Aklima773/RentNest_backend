import  jwt,  {JwtPayload, SignOptions } from "jsonwebtoken"

const createToken = (payload: JwtPayload, secret: string, expiresIn: SignOptions) =>{

    const token = jwt.sign(payload, secret, {expiresIn} as SignOptions);
    return token

}


// function creat for verificaton

const verifyToken =(token: string, secret:string)=>{

    try{

    const verifiedToken = jwt.verify(token,secret);
    return {
        success: true,
        data: verifiedToken
    }

    }catch (error: any){
        console.log("Token verification failed:", error);
        // throw new Error(error.message);

        return{
            success: false,
            error: error.message
        }
    }



}
export const jwtUtils ={
    createToken,
    verifyToken
}