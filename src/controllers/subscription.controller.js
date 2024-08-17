import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId = req.user._id;

    // Check if the channel exists
    const currentChannel = await Channel.findById(channelId);
    if (!currentChannel) {
      throw new ApiError(404, "Channel not found");
    }

    // Check if the user exists
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new ApiError(404, "User not found");
    }

    // Check if the user is already subscribed to the channel
    const existingSubscription = await Subscription.findOne({
      channel: channelId,
      user: userId,
    });

    if (existingSubscription) {
      // User is already subscribed, so remove the subscription
      await Subscription.deleteOne({ _id: existingSubscription._id });

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Unsubscribed from channel"));
    } else {
      // User is not subscribed, so add a new subscription
      const newSubscription = await Subscription.create({
        channel: channelId,
        user: userId,
      });

      if (!newSubscription) {
        throw new ApiError(500, "Internal server error");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, newSubscription, "Subscribed to channel"));
    }
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // Check if the channel exists
  const currentChannel = await Channel.findById(channelId);
  if (!currentChannel) {
    throw new ApiError(404, "Channel not found");
  }

  // Retrieve the subscribers
  const subscribers = await Subscription.find({ channel: channelId })
    .populate("user", "username email") // Populate the user fields, adjust as needed
    .exec();

  if (!subscribers || subscribers.length === 0) {
    return res
      .status(404)
      .json(
        new ApiResponse(404, null, "No subscribers found for this channel")
      );
  }

  // Extract user details from the subscriptions
  const subscriberList = subscribers.map((sub) => sub.user);

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriberList, "Subscribers retrieved successfully")
    );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const currentUser = await User.findById(subscriberId);
    if (!currentUser) {
      throw new ApiError(404, "User not found");
    }

    // Retrieve the subscriptions of the user
    const subscriptions = await Subscription.find({ user: subscriberId })
      .populate("channel", "name description") // Populate channel fields, adjust as needed
      .exec();

    if (!subscriptions || subscriptions.length === 0) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            "No subscribed channels found for this user"
          )
        );
    }

    // Extract channel details from the subscriptions
    const channelList = subscriptions.map((sub) => sub.channel);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          channelList,
          "Subscribed channels retrieved successfully"
        )
      );
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}