import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";



const registerUser = asyncHandler( async (req,res) => {
    //1.get user details from frontend 
    //2.validation of user details using userSchema - not empty
    //3.check if user already exists : username,email
    //4.check for images,check for avatar
    //5.upload them to cloudinary,avatar
    //6.create user object - create entry in db
    //7.remove password and refresh token field from response
    //8.check for user creation
    //9.return proper response
    //1
    const {fullname,email,username,password} = req.body
    console.log(email,fullname,username);
    console.log("req.body : ",req.body,"\n")
    //2
    if(
        [fullname,email.username,password].some((field)=>field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }
    //3
    const existedUser = User.findOne({
        $or : [{ username },{ email }]
    })
    console.log("User.findOne : ",existedUser,"\n")
    if(existedUser){
        throw new ApiError(409,"email or username already exists ")
    }
    //4 - multer will give access req.files like req.body by express
    console.log("req.files : ",req.files,"\n")
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const converImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    //5
    const avatar = await uploadOncloudinary(avatarLocalPath)
    const coverImage = await uploadOncloudinary(converImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    //6
    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })
    //7
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    //8
    if(createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )


})

export { registerUser }

