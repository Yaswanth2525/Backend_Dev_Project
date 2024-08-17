import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import { User } from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = await req.user._id;

    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(401,'Unauthorised user credentials')
    }

    const stats = await User.aggregate([
      {
        //current user
        $match: {
          _id: user._id,
        },
      },
      {
        //join videos for subscribers
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "owner",
          as: "videoJoin",
          pipeline: [
            {
              $lookup: {
                from: "likes",
                localField: "id",
                foreignField: "video",
                as: "videoLikes",
              },
            },
            {
              $group : {
                _id : null,
                totalViews : {$sum : "$views"}
              }
            },
            {
              $addFields: {
                totalLikes: {
                  $size: "$videoLIkes",
                },
                totalVideos: {
                  $size: "$videoJoin",
                },
                subscribersCount: {
                  $size: "$subscribers",
                },
              },
            },{
              $project : {
                totalViews : 1,
                subscribersCount : 1,
                totalVideos : 1,
                totalLikes : 1,
              }
            }
          ],
        },
      }
    ]);

    

    return res
    .status(200)
    .json (
      new ApiResponse(
        200,
        stats,
        "stats of dashboard has found successfully"
      )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id;
    
    const objectId = mongoose.Types.objectId(userid)

    const mychannel = await User.findById(objectId)

    if(!mychannel){
      throw new ApiError(401,"invalid user");
    }

    const allVideos = await User.aggregate([
      {
        $match : {
          id : mychannel.id
        }
      },{
        $lookup : {
          from : "videos",
          localField : "id",
          foreignField : "owner",
          as : "channelVideos"
        }
      }
    ])

    if(!allVideos){
      throw new ApiError(404,"No videos Found")
    }

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allVideos,
        "your videos successfully gathered"
      )
    )
})

export {
    getChannelStats, 
    getChannelVideos
}