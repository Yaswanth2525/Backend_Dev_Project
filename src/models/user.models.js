import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema(
    {
        username : {
            typeof : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            // if you want to search based on name means set index true
            index : true,
        },
        email : {
            typeof : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
        },
        fullname : {
            typeof : String,
            required : true,
            lowercase : true,
            trim : true,
            index : true,
        },
        avatar : {
            typeof : String,//cloudinary url
            required : true,
        },
        coverImage : {
            typeof : String,//cloudinary url
        },
        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video",
            }
        ],
        password : {
            typeof : String,
            required : [true , 'Password is required']
        },
        refreshToken :{
            typeof : String
        }
    },
    {
        timestamps : true
    }
)

userSchema.pre("save",async function (next) {
    if(!this.isModified("passowrd"))
        return next();
    this.password = bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(passowrd){
    return await bcrypt.compare(passowrd,this.passowrd)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullname : this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_ENPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_ENPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)


