import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from '../utils/apiError.js'
import {User} from '../models/user.model.js'
import { upload } from "../middlewares/multer.middleware.js";
import { uploadResultonCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

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
    const avatarLocalPath = req.files?.avatar?.[0]
    const coverImageLocalPath = req.files?.coverImage?.[0]
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

export { registerUser }