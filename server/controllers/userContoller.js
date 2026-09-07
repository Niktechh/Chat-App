import { genrateToken } from "../lib/utils.js";
import UserModel from "../models/User.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import cloudinary from "../lib/cloudinary.js"

// register
export const signUp = async(req,res)=>{
    const {fullName , email , password ,bio} = req.body;

    try {
        if(!fullName || !email || !password|| !bio){
            return res.json({success:false , message:"missing details"})
        }
        const user = await UserModel.findOne({email})
        if(user){
            return res.json({success:false , message:"User already exist"})
        }
        if(!validator.isEmail(email)){
            return res.json({success:false , message:"invalid email"})
        }
        if(password.length < 8){
            return res.json({success:false , message:"enter strong password"})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password , salt)

        const newUser  = await UserModel.create({
            email,
            fullName,
            password:hashedPassword,
            bio
        });

        const token = genrateToken(newUser._id);
        const userData = {
    _id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
    profilePic: newUser.profilePic,
    bio: newUser.bio
};
        return res.json({success:true ,userData,token});

    } catch (error) {
        console.log(error);
        return res.json({success:false, message:error.message})
    }
}

//login
export const login = async(req,res)=>{
    try {
        const {email , password} = req.body;

    const user = await UserModel.findOne({email});
    if(!user){
        return res.json({success:false , message:"User not found"});
    }
    const isMatch = await bcrypt.compare(password , user.password);
    if(!isMatch){
        return res.json({success:false , message:"Invalid credential"});
    }
    const token = genrateToken(user._id);
    const userData = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
    bio: user.bio
};
    return res.json({success:true, userData ,token})

    } catch (error) {
        console.log(error);
        return res.json({success:false, message:error.message})
    }
}


export const checkAuth = async(req,res)=>{
    res.json({success:true , user:req.user});
}


//controller to update profile

export const updateProfile = async(req,res)=>{
    try {
        const {profilePic , bio , fullName} = req.body;
        const userId = req.user._id;

        let updateUser;
        if(!profilePic){
            updateUser = await UserModel.findByIdAndUpdate(userId , {bio , fullName} , {new:true});
        }else{
            const upload = cloudinary.uploader.upload(profilePic);
            updateUser = await UserModel.findByIdAndUpdate(userId , {profilePic:(await upload).secure_url , bio , fullName} , {new:true});
        }
        res.json({success:true , user:updateUser})

    } catch (error) {
        console.log(error.message);
        res.json({success:false , message:error.message})
    }
}