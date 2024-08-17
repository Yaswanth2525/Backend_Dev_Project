import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    var msg;
    const healthCheck = {
      uptime: process.uptime(),
      message: "Ok",
      timestamp: Date.now(),
    }
    if(!healthCheck.uptime){
        throw new ApiError(500,"internal server error")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            healthCheck,
            "healthCheck done successfully"
        )
    )
})

export {
    healthcheck
}
