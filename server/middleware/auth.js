import jwt from "jsonwebtoken"
import UserModel from "../models/User.js"

export const protectRoute = async(req,res,next)=>{
    try {
        const {token} = req.headers
        if(!token){
            return res.json({success:false , message:"not authourized"})
        }
        const token_decode = jwt.verify(token , process.env.JWT_SECRET)
        const user = await UserModel.findById(token_decode.id).select("-password");
        if(!user){
            return res.json({success:false , message:"User not found"})
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error)
        return res.json({success:false , message:error.message})
    }
}

//check if user is authenticated
export const checkAuth = (req,res)=>{
    return res.json({success:true , user:req.user})
}