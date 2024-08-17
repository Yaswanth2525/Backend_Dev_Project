import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    const user = await req.user

    if(!user){
        throw new ApiError(401,"Unauthorized user")
    }
    const playlist = await Playlist.create({
        name : name,
        description : description,
        owner : user
    })

    if(!playlist){
        throw new ApiError(500,"Internal server error")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "playlist created successfully"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const user = await User.findById(mongoose.Types.ObjectId(userId));

    if (!user) {
      throw new ApiError(401, "Unauthorized user");
    }

    const playlist = await Playlist.findOne({
      owner: user,
    });

    if (!playlist) {
      throw new ApiError(404,"No videos available in this playlist");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "fetched all playlist successfully"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const userId = await req.user

    if (!user) {
      throw new ApiError(401, "Unauthorized user");
    }
    const playlist = await Playlist.findById({
      id : playlistId
    });

    if (!playlist) {
      throw new ApiError(500, "No playlist available");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "fetched given playlist successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const user = await req.user;

    if (!user) {
      throw new ApiError(401, "Unauthorized user");
    }

    const video = await Video.findById(videoId)

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push : {
                videos : video
            }
        },{
          new : true,
          useFindAndModify:false
        }
    );

    if (!playlist) {
      throw new ApiError(500, "video not added properly");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "added video to given playlist successfully"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const user = await req.user;

    if (!user) {
      throw new ApiError(401, "Unauthorized user");
    }

    const video = await Video.findById(videoId);

    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $pull: {
          videos: video,
        },
      },
      {
        new: true,
        useFindAndModify: false,
      }
    );

    if (!playlist) {
      throw new ApiError(500, "video not removed properly");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          playlist,
          "removed video from given playlist successfully"
        )
      );

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const playlist = await Playlist.deleteOne({
        id : playlistId
    })

    if(!playlist){
        throw new ApiError(404,"Not deleted successfully")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set : {
                name : name,
                description : description
            }
        }
    )

    if (!playlist) {
      throw new ApiError(404, "Not updated successfully");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "updated successfully"
        )
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
