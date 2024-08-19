import { v2 as cloudinary } from "cloudinary";
import fs, { unlinkSync } from "fs";
import { ApiError } from "./ApiError.js";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOncloudinary = async (localFilePath) =>{
    try {
        // console.log("localfilepath : ",localFilePath);
        if(!localFilePath) 
            throw new ApiError(404,"file path not present")
        //upload file in cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })
        //file ahs been uploaded successfull
        console.log("file is uploaded on cloudinary",response.url)
        if (typeof localFilePath !== "string") {
          throw new ApiError("Expected a string for localFilePath");
        }
        fs.unlinkSync(localFilePath);
        return response
    }catch(error){
        if (typeof localFilePath !== "string") {
          throw new ApiError("Expected a string for localFilePath");
        }
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export default { uploadOncloudinary };



