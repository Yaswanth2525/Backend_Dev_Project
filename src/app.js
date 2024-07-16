import express from 'express';
import cors from 'cors'
//cookie-parser :CRUD operations on user's browser cookies like mic,managingData
//secure cookies can be added/deleted to user by server only
import cookieParser from 'cookie-parser'


const app = express()
//which sites/users should allow,allow if logined only
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
//input data as JSON limit
app.use(express.json({limit:"16kb"}))
//input data as URL
//extended:give objects under a objects 
app.use(express.urlencoded({extended:true,limit:"16kb"}))
//storing imported files or image in a folder in our server 
app.use(express.static("public"))
app.use(cookieParser())


export { app }




