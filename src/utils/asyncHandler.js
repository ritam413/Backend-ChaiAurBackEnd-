const asyncHandler = (requestHandler) =>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((error)=>next(error))
    }
}

export {asyncHandler}


























// const asyncHandler = () =>{}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (fn) => async(err,req,res,next) => {
//     try{
//         await fn(req,res,next)
//     }catch(error){
//         console.log(error.code || 500).json({
//             success:false,
//             message: err.message
//         })
//     }
// }