import {v2 as cloudinary } from "cloudinary" 
import fs from 'fs'

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY , 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadResultonCloudinary = async (localFilePath)=>{
    try{
        if(! localFilePath) return null

        //uplaod the file on cloudinary 
        const response =  await cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto'
        })
        //fille succesfully uloaded
        console.log(`File is Uploaded on cloudinary`,response.url);
        return response
    }catch(error){
        console.log("Cloudinary Upload Error :",error)

        fs.unlinkSync(localFilePath)//remove the locally saved temporary file as the uplod opoeartion failed
        return null
    }
}

export {uploadResultonCloudinary}

