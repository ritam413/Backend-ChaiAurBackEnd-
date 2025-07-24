import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import { upload } from "../middlewares/multer.middleware.js";
import { uploadResultonCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req,res)=>{
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
    const existedUser = await User.findOne({
        $or: [{ username } , { email }]
    })
    if(existedUser){
        throw new apiError(409,'User with email or username already Exist')
    }
// image Validation
    const avatarLocalPath = req.files?.avatar?.[0]
    const coverImageLocalPath = req.files?.coverImage?.[0]

    if(!avatarLocalPath){
        throw new apiError(400,'Avatar is Required')
    }
//Uploading image to cloudinary and validating avatar
    const avatar = await uploadResultonCloudinary(avatarLocalPath.path)

    const coverImage = coverImageLocalPath ?await uploadResultonCloudinary(coverImageLocalPath.path):null;

    if(!avatar){
        throw new apiError(400, "Avatar file is required")
    }
// create Objectt 
    const newUser = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage:coverImage?.url|| "",
        email,
        password,
        username: username.toLowerCase(),
    })

// Validation of User amd removing refresh token and Passowrd
    // removing the password,refreshToken from the User
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"// for the select()method we write the things we dont want with -not_Desired to unselect them , By defualt everything is selected

    )
    // checking if the user is created
    if(!createdUser){
        throw new apiError(500,"Something Went Wrong while Registrering the User")
    }

// Returning Responst for the api call made when register router is hit
    return res.status(201).json(
        new apiResponse(200,createdUser,"User Registred Succesfuuly")
    )
})

export { registerUser }