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

    export { registerUser }

