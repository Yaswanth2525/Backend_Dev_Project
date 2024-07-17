import { trusted } from "mongoose";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})

        return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(50,"Something went wrong while generating refresh and access token")
    }
}


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
    // if(!req.body)
    //     throw new ApiError(204,"input is invalid or undefined")
    const {fullName, email, username, password } = await req.body
    console.log(email,username);
    //2
    if(
        [fullName,email,username,password].some((field)=>field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }
    //3
    const existedUser = await User.findOne({
        $or : [{ username },{ email }]
    })
    console.log("User.findOne ")
    if(existedUser){
        throw new ApiError(409,"email or username already exists ")
    }
    //4 - multer will give access req.files like req.body by express
    console.log("req.files ")
    const file=req.files;
    const avatarLocalPath = file?.avatar[0]?.path;
    // const coverImageLocalPath = file?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0];
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    //5
    const avatar = await uploadOncloudinary(avatarLocalPath);
    const coverImage = await uploadOncloudinary(coverImageLocalPath);
    
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    //6
    const user = await User.create({
        fullName,
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
    //9
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )


})

const loginUser = asyncHandler ( async (req,res) => {
    //1.get user detials -> req.body
    //2.username or email
    //3.find the user
    //4.password check
    //5.generate access and refresh token
    //6.send cookies
    //1
    const {email,username,password} = await req.body
    //2
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }
    //3
    const user = await User.findOne({
        $or : [{ username },{ email }]
    })

    if(!user){
        throw new ApiError(404,"User does not exist")
    }
    //4
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }
    //5
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
    //6
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    //only accessible and modifiable by server after adding options
    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,accessToken,refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler ( async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out"))
})

const refreshAccessToken = asyncHandler ( async(req,res) =>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }  
        
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,'Refresh token is expired or used')
        }

        const options = {
            httpOnly : true,
            secure :true
        }

        const {accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id)

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newrefreshToken},
                "Access token refreshed"
            )
        )
    }catch(error){
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }

})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}

