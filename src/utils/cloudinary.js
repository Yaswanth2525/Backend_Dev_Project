import { v2 as cloudinary } from "cloudinary";
import exp from "constants";
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY 
});

const uploadOncloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath)
            return null
        //upload file in cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })
        //file ahs been uploaded successfull
        console.log("file is uploaded on cloudinary",response.url)
        return response
    }catch(error){
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export { uploadOncloudinary }



