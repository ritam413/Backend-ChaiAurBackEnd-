import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'




const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    redentials:true
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static('public'))
app.use(cookieParser())

//Routes
import userRouter from './routes/user.routes.js'
//Routes Decalartion(if router is not imported , then we can use app.get , as we have seperated , we need to use middleware to use routes)
app.use('/api/v1/user',userRouter)



export {app} 