import cloudinary from "../lib/cloudinary.js";
import messageModel from "../models/message.js";
import UserModel from "../models/User.js";
import { io, userSocketMap } from "../server.js";


// Get all users except the logged-in user
export const getUserForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;

        const filteredUsers = await UserModel.find({
            _id: { $ne: userId }
        }).select("-password");

        // Count unseen messages for each user
        const unseenMessages = {};

        const promises = filteredUsers.map(async (user) => {

            const messages = await messageModel.find({
                senderId: user._id,
                receiverId: userId,
                seen: false
            });

            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }

        });

        await Promise.all(promises);

        res.json({
            success: true,
            filteredUsers,
            unseenMessages
        });

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// Get all messages between logged-in user and selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await messageModel.find({
            $or: [
                {
                    senderId: selectedUserId,
                    receiverId: myId
                },
                {
                    senderId: myId,
                    receiverId: selectedUserId
                }
            ]
        });

        // Mark messages received from selected user as seen
        await messageModel.updateMany(
            {
                senderId: selectedUserId,
                receiverId: myId
            },
            {
                seen: true
            }
        );

        res.json({
            success: true,
            messages
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// Mark a particular message as seen
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;

        await messageModel.findByIdAndUpdate(
            id,
            {
                seen: true
            }
        );

        res.json({
            success: true
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;

        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;

        // Upload image to Cloudinary if an image exists
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        // Save message in MongoDB
        const newMessage = await messageModel.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        // Find receiver's socket
        const receiverSocketId = userSocketMap[receiverId];

        // Send message in real-time to receiver
        if (receiverSocketId) {
            io.to(receiverSocketId).emit(
                "newMessage",
                newMessage
            );
        }

        // Send saved message back to sender
        res.json({
            success: true,
            newMessage
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};