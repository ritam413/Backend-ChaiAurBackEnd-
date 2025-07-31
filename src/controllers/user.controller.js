import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import { upload } from "../middlewares/multer.middleware.js";
import { uploadResultonCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { url } from "inspector";

const generateAccessAndRefreshTokens = async(userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
    
        return {accessToken,refreshToken}
    }catch(error){
        throw new apiError(500,"Something went wrong while generating refersh and access tokens")
    }
}


const registerUser = asyncHandler(async (req,res)=>{
    // console.log("BODY:", req.body);
    // console.log("FILES:", req.files);
    // get user Details from frontend:
    // fulll name , 
    // username /-> Validation 
    // username or fullname should be unique depending on services 
    // while returning remove the part encrypted string 
    // file upload :-
    // check if file present then/->
    // upload via multer /-> use in cloudinary
    // -----> avatar image , coverimage 
    // validate /-> if any field empty
    // craete a user object - for entyr in mongodb
    // password /-> send it to mongodb 
    // reomve refresh token also 
    // check for user creation in db
    // return res
    const {fullname,username, email, password}=req.body
    console.log('email:',email)
    console.log(`username: `,username);
    console.log(`fullname: `,fullname);
    
    // if(fullname === ""){
    //     throw new apiError(400,"fullName is required")
    // }
//Validation 
    if(
        [fullname,email,username,password].some((field)=> field?.trim()==="")
    ){
        throw new apiError(409,"All fields are Required")
    }
//User Exist 
    console.log(`Checking if User existss.....`);
    console.log(`Username : `,username);
    const existedUser = await User.findOne({
        $or: [{ username:username.toLowerCase() } , { email }]
    })
    if(existedUser){
    console.log("User Exist",existedUser);
    throw new apiError(409,'User with email or username already Exist')
    }
    console.log("User existence check complete");
   
// image Validation
    //formy knoledge
        console.log("Req FILES :- ",JSON.stringify(req.files,null,2));
        
    const avatarLocalPath = req.files?.avatar?.[0]
    const coverImageLocalPath = req.files?.coverImage?.[0]

    // let coverImageLocalPath 
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0  ) {
    //     coverImageLocalPath= req.files.coverImage[0].path
    // }

    console.log(`Uploading file to Cloudinary`);

    if(!avatarLocalPath){
        throw new apiError(400,'Avatar is Required')
    }

//Uploading image to cloudinary and validating avatar

    let avatar
    try{
        // console.log("Uploading avatar from path:", avatarLocalPath.path);

        avatar = await uploadResultonCloudinary(avatarLocalPath?.path)
        // console.log("Avatar Local Path:", avatarLocalPath);
        // console.log("Uploaded Avatar",avatar);
    }catch(error){
        console.log("Errow Uploading avatr ",error);
        throw new apiError(500,'Failed to upload Avatar')
    }

    let coverImage
    try{
        // console.log(`Uploading coverImage from Path :`, coverImageLocalPath);
        
        coverImage = coverImageLocalPath ?await uploadResultonCloudinary(coverImageLocalPath.path):null;
        // console.log("Cover Image Uploaded ",coverImage);
    } catch(error){
        console.log('Failed uploading CoverImage',error)
         throw new apiError(500,"failed to Upload Avatar")
    }

    if(!avatar){
        throw new apiError(400, "Avatar file is required")
    }

// create a New User 
try{    
        const newUser = await User.create({
            fullname,
            email,
            password,
            username: username.toLowerCase(),
            avatar: avatar.url,
            coverImage:coverImage?.url||""
        })

    // Validation of User amd removing refresh token and Passowrd
        // removing the password,refreshToken from the User
        const createdUser = await User.findById(newUser._id).select(
            "-password -refreshToken"// for the select()method we write the things we dont want with -not_Desired to unselect them , By defualt everything is selected

        )
        console.log(createdUser);
        
        // checking if the user is created
        if(!createdUser){
            throw new apiError(500,"Something Went Wrong while Registrering the User")
        }
      

    // Returning Responst for the api call made when register router is hit
        return res.status(201).json(
            new apiResponse(200,createdUser,"User Registred Succesfuuly")
        )
    }catch(error){
        console.log('User Creation Failed')
        console.log(`Errors: ${error}`)
        throw new apiError(500,"Something Wentt Wrong")
    }
})

const loginUser = asyncHandler(async(req,res)=>{
    // req body -> data 
    // username or email 
    // then check in data base if exist, serach for password  
    // if password match too , give accesstoken and refresh token (it is automatically generated in model , via our code )
    // send token using Cookies

    const {email,username,password} = req.body

    if(!email && !username){
        throw new apiError(400,"username or Email is required ")
    }

    if(!password || password.trim() === ""){
        throw new apiError(400,"password is required")
    }

    const  user =await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new apiError(404,"User does not Exist")
    }

    const isPasswordValid = await user.isPasswordCorrect (password)

    if(!isPasswordValid) {
        throw new apiError(401,"Invalid user Credentials")
    }

    const { accessToken,refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const  loggedinUser = await User.findById(user._id).select("-password -refreshToken")

    const options ={
        httpOnly: true,
        secure:false,
        sameSite: 'lax'
    }

    return res 
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedinUser, 
                accessToken , 
                refreshToken ,
            },
            "User Logged in SUCCESSFULLY !!"
        )
    )

})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined,
            }
        },
        {
            new: true
        }
    )

    const options ={
        httpOnly: true,
        secure:false,
        sameSite:'lax'
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"User Looged Out"))
})

export { registerUser , loginUser ,logoutUser}