import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async(req,_,next)=>{

    try{
        const authHeader = await req.header("Authorization")
        // console.log("cookies : ",req.cookies?.accessToken) - undefined cannot get until they are loggined
        // console.log("authorization : ",authHeader) - check printings/authHeader.txt
        const token = (req.cookies?.accessToken || (authHeader && 
                            (typeof authHeader === 'string' && authHeader.startsWith('Bearer '))?authHeader.replace("Bearer ", ""):null));

        if(!token){
            throw new ApiError(401,"Unauthorized request Please kindly register to login");
        }

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            
            throw new ApiError(401,"Invalid Access Token")
        }

        req.user = user ;
        next()
    }catch(err){
        throw new ApiError(401,err?.message || "Invalid access token")
    }
    

})




