import mongoose from "mongoose";

const ConnectDB = async()=>{
    try {
        mongoose.connection.on("connected" , ()=>console.log("Db Connected"))
         await mongoose.connect(`${process.env.MONGO_URI}/chat-app`)
    } catch (error) {
        console.log(error);
    }   
}

export default ConnectDB;