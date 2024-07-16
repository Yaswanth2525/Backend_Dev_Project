// require('dotenv').config({path:"./env"})
import dotenv from 'dotenv'
import connectDB from "./db/index.js";
//in mongoDB,don't allow anywhere while working deployment tools like digitalocean..etc.
//git status

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("ERRR: ",error);
        throw error
    })
    app.listen(process.env.PORT || 8000,() => {
        //callback
        console.log(` Server is running at port : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGODB db connection failed !! ",err)
})




















/*
import express from "express";
const app = express()

// IIFE(Immediately Invoked Function Expressions) function js 
// this local variables,executed immediately after they are defined
//; add semicolon before starting iife if import module's ; is missed means
// async if db is another continent takes time to connect ,use async to run asap created it
// andalso await is like a promise fullfilled only at the top module of async function
// evey db connection should in try catch because many errors via online

;( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        //app internal errors
        app.on("error",(error)=>{
            console.log("ERRR: ",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    }catch(error){
        console.error("ERROR: ",error);
        throw error;
    }
})()

*/

