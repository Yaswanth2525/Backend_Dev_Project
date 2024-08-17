import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"
import { Tweet } from "../models/tweet.models.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const currentVideo = await Video.findById(videoId)

    if (!currentVideo) 
        throw new ApiError(404, "No video available");

    const userId = req.user._id
    const objectId = mongoose.Types.objectId(userId)

    const currentUser = await User.findById(objectId)

    if(!currentUser)
        throw new ApiError(401,"invalid user credentials")


    const like = await Like.findone({
        video : currentVideo,
        user :  currentUser
    })
    
    if(like){
        await Like.deleteOne({
            _id : like._id
        })

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "unliked the video"
            )
        )
    }else{
        const addlike = await Like.create({
            video : currentVideo,
            user : currentUser
        })

        if(!addlike){
            throw new ApiError(500,"Internal server error")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "liked the video",
                addlike
            )
        )
    }


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    const objectId = mongoose.Types.objectId(commentId)

    const comment = await Comment.findById(objectId)

    if(!comment)
        throw new ApiError(404,"no comment present")

    const likeStatus = await Like.findone({
        comment : comment
    })

    if(likeStatus){
        await Like.deleteOne({
            comment : comment
        })

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "unliked the given comment"
            )
        )
    }else{
        const likeOnComment = await Comment.create({
            comment : comment ,
            video : comment.video,
            likedBy : comment.owner
        })

        if(!likeOnComment){
            throw new ApiError(500,"Internal server error")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "liked the given comment",
                likeOnComment
            )
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const objectId = mongoose.Types.objectId(tweetId)

    const tweet = Tweet.findById(objectId)

    if(!tweet){
        throw new ApiError(404,"No tweet found")
    }

    const likeOnTweet = await Like.findone({
        tweet : tweet
    })


    if(likeOnTweet){
        await Like.deleteOne({
            tweet : tweet
        })

        return res.status(200).json(
            new ApiResponse(
                200,
                "unliked the tweet"
            )
        )
    }else{
        const tweet = await Like.create({
            tweeet : tweet,
            likedBy : tweet.owner
        })

        if(!tweet){
            throw new ApiError(500,"internal server error")
        }

        const likeTweet = await Like.create({
            tweet : tweet,
            likedBy : tweet.owner
        })

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likeTweet,
                "liked on tweet"
            )
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = await req.user._id;

    const objectId = mongoose.Types.objectId(userId)

    if(!objectId){
        throw new ApiError(404,"No user found")
    }

    const likedVideos = await User.aggregate([
        {
            $match : {
                id : objectId
            }
        },{
            $lookup : {
                from : "likes",
                localField : "id",
                foreignField : "likedBy",
                as : "likeVideos"
            }
        },{
            $project : {
                video : 1
            }
        }
    ])

    if(!likedVideos){
        throw new ApiError(404,"No liked Videos found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "fetched all liked videos successfully",
            likedVideos
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}