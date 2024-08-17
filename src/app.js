import express from 'express';
import cors from 'cors';
//cookie-parser :CRUD operations on user's browser cookies like mic,managingData
//secure cookies can be added/deleted to user by server only
import cookieParser from 'cookie-parser';


const app = express()
//which sites/users should allow,allow if logined only
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

//input data as URL
//extended:give objects under a objects 
app.use(express.urlencoded({extended:true,limit:"1000kb"}));
//input data as JSON limit
app.use(express.json({limit:"1000kb"}));
//storing imported files or image in a folder in our server 
app.use(express.static("public"));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.send("API IS RUNNING PLEASE FIX ISSUE");
})


//routers import 
import userRouter from './routers/user.routes.js'
import videoRouter from './routers/video.routes.js'
import commentRouter from './routers/comment.routes.js'
import dashboardRouter from './routers/dashboard.routes.js'
import healthcheckRouter from './routers/healthcheck.routes.js'
import likeRouter from './routers/like.routes.js'
import playlistRouter from './routers/playlist.routes.js'
import subscriptionRouter from './routers/subscription.routes.js'
import tweetRouter from './routers/tweet.routes.js'

//routers declaration
app.use("/api/v1/users",userRouter)
app.use("api/v1/videos",videoRouter)
app.use("api/v1/comments",commentRouter)
app.use("api/v1/dashboard",dashboardRouter)
app.use("api/v1/healthcheck",healthcheckRouter)
app.use("api/v1/likes",likeRouter)
app.use("api/v1/playlists",playlistRouter)
app.use("api/v1/subscriptions",subscriptionRouter)
app.use("api/v1/tweets",tweetRouter)



// http://localhost:8000/api/v1/users/register
export { app }




