import mongoose from 'mongoose'
import pkg from "mongoose";
import {Video} from "../models/video.models.js";
import {User} from "../models/user.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import cloudinaryUtils from "../utils/cloudinary.js";
const { uploadOncloudinary } = cloudinaryUtils;

const {Aggregate,isValidObjectId}=pkg;


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = await req.query
    //TODO: get all videos based on query, sort, pagination
    const objectId = mongoose.Types.objectId(userId);
    
    if(!isValidObjectId(objectId)){
        throw new ApiError(401,"invalid userId!!!")
    }

    const user = await User.findById(objectId);


    const options = {
        page : page,
        limit : limit,
        sortBy : sortBy
    }

    const updatedQuery = query.sort([sortBy,sortType])

    const users = Video.Aggregate([
        {
            $match : {
                onwer : user
            }
        }
    ])

    if(!users){
        throw new ApiError(401,"Invalid user details")
    }

    const allVideos = Video.aggregatePaginate(users,options,function(err,result){
        if(err){
            throw new ApiError(err)
        }else{
            return result;
        }
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            allVideos,
            "all Videos of this page successfully gathered"
        )
    )
    

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = await req.body
    // TODO: get video, upload to cloudinary, create video
    //get owner
    const userId = await req.body.user?._id;

    const userDetails = await User.findById(userId).select("-password -refreshToken")

    if(!userDetails){
        throw new ApiError(401,'uauthorized user credentials : login to upload videos')
    }

    //video
    const files = await req.files;
    const localVideoFilePath = files?.videoFile[0]?.path;
    const localThumbnailPath = files?.thumbnail[0]?.path;

    if(!localVideoFilePath || !localThumbnailPath){
        throw new ApiError(404,"video or thumbnail file doesn't exist")
    }

    const video = await uploadOnCloudinary(localVideoFilePath);
    const thumbnail = await uploadOnCloudinary(localThumbnailPath);

    if(!video || !thumbnail){
        throw new ApiError(400,"video or thumbnail file is required")
    }

    
    const  vid = await Video.create({
        videoFile : video?.url,
        thumbnail : thumbnail?.url,
        title,
        description,
        isPublished : 1,
        onwer : userDetails
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            vid,
            "Video upload successfully"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const vid = await Video.findById(videoId);
    
    const requestedUser = await User.findById(req.user._id);

    if(!requestedUser){
        throw new ApiError(401,"unauthorized user credentails : login to access")
    }

    return res
    .status(200)
    .json (
        new ApiResponse(
            200,
            vid,
            "user request completed successfully"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = await req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description} = await req.body
    const {thumbnailPath} = await req.files?.thumbnail[0].path;

    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    if(!thumbnail)
        throw new ApiError(404,"thumbnail not found")

    const requestedUserId = await req.user._id;

    if(!vid){
        throw new ApiError(404,"video not found")
    }

    if(vid.onwer._id != requestedUserId){
        throw new ApiError(401,"unauthorized user credentials : only owner can update video")
    }

    //thumbnail is a string so ..
    

    const videoUpdate = await Video.findByIdAndUpdate(
        videoId,
        {
            $set : {
                title : title,
                description : description,
                thumbnail : thumbnail?.url,
            }
        },
        {
            new : true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videoUpdate,
            "thumbnail update successfully"
        )
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!isValidObjectId(videoId)){
        throw new ApiError(404,"video not found")
    }

    const objectId = mongoose.Types.objectId(videoId);

    const videodelete = await Video.deleteOne({
        _id:objectId
    })
    if(!videodelete){
        throw new ApiError(404,"video not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videoId,
            "video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(404,"invalid videoId")
    }

    const objectId = mongoose.Types.objectId(videoId);

    const togglePublish = await Video.findByIdAndUpdate(
        objectId,
        {
            $set : {
                isPublished : !isPublished
            }
        },{
            new:true
        }
    )
    console.log(togglePublish)
    if(!togglePublish){
        throw new ApiError(500,"some server error")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            togglePublish,
            "toggled isPublished status successfully"
        )
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
