// require('dotenv').config({path:'./env'})
import connectDB from './db/dbIndex.js'
import  dotenv  from 'dotenv';
import {app} from './app.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'


//making env available everywhere
dotenv.config({
    path:'./.env'
})

//connecting DataBase
connectDB()
.then(()=>{
    const server = app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is Running at PORT : ${process.env.PORT} `)
    })
    server.on("error",(error)=>{
        console.log("ERRR",error)
        throw error 
    });

})
.catch((err)=>{
    console.log("MONGODB connection failed !!!",err)
})







































// import express from 'express';
// const app = express()

// ;(async ()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/ ${DB_NAME}`)
//         app.on('error',(error)=>{
//             console.log('ERROR',error)
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`ApP is listening on port ${process.env.PORT}`)
//         })

//     }catch(error){
//         console.log('ERROR',error)
//         throw err
//     }
// })()