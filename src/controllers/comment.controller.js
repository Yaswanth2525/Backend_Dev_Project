import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from '../models/video.models.js'

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const userId = await req.user._id;

    const onwer = await User.findById(userId)

    if(!onwer)
        throw new ApiError(401,"Invalid credentials")

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"No video is available => No comments also")
    }

    const comments = await Comment.aggregate([
        {
            $match : {
                video : video,
                owner : onwer
            }
        },{
            $project : {
                content : 1,
            }
        }
    ])

    if(!comments){
        throw new ApiError(404,"No comments are available for this video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comments,
            "fetched comments successfully"
        )
    )
    
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = await req.params
    
    const userId = await req.user._id

    const {comment} = await req.body;

    const user = await User.findById(userId)

    const video = await Video.findById(videoId)

    const addComm = await Comment.create({
        content : comment,
        video : video,
        onwer : user
    })

    if(!addComm){
        throw new ApiError(500,"your comments are not updated due to internal server error")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            addComm,
            "your comment have been successfully added to videos"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const commentId = await req.params

    const commentToBeAdded = await req.body

    const updComment = await Video.findByIdAndUpdate(
        commentId,
        {
            $set : {
                content : commentToBeAdded
            }
        },{
            new : true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updComment,
            "your comment has successfully updated"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const commentId = await req.params

    const delComment = await Comment.findByIdAndDelete(commentId)

    if(!delComment){
        throw new ApiError(500,"Internal server issue")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            delComment,
            "comment deleted successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
