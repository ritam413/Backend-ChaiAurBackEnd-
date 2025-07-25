import mongoose , {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import brcrypt from 'bcrypt'    

// definting the User Model
const UserSchema=new Schema(
    {
        username: {
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index: true,//to enavle optimized searching
        },
        email: {
            type:String,
            required:true,
            unique:true,
            lowecase:true,
            trim:true
        },
        fullname: {
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar: {
            type:String,//use Cloudinary url
            required:true,
        },
        coverImage: {
            type:String,
            required:true,
        },
        watchHistory: [
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required : [true,'Password is required'],
        },
        refreshToken:{
            type:String
        }
    },
    {
        timestamps:true
    }
)
//Encrypting password before saving 
    UserSchema.pre("save", async function(next){
        if(!this.isModified('password')) return 

        this.password = await brcrypt.hash(this.password,10)
        next()
    })
// Validating if the Password is correct
    UserSchema.methods.isPasswordCorrect = async function (password) {
        return await brcrypt.compare(password,this.password)
    }

//generating AccessToken
    UserSchema.methods.generateAccessToken = function(){
        return  jwt.sign(
            {
                _id: this.id,
                email: this.email,
                username : this.username,
                fullname : this.fullname
            },
            
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            } 
        )
    }
// Generating Refresh Token
    UserSchema.methods.generateRefreshToken = function(){
            return  jwt.sign(
            {
                _id: this.id,
            },
            
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            } 
        )
    }

// Exporting the User incase creating the User in the Mongose DataBase and Adding 
export const User = mongoose.model('User',UserSchema)        