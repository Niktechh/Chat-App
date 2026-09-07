"use client"

import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

const { createContext, useState, useContext, useEffect} = require("react");

export const ChatContext = createContext();

export const ChatProvider = ({children})=>{
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({})

    const {socket , axios} = useContext(AuthContext);

    //function to get all user for sidebar
    const getUsers = async()=>{
        try {
          const {data} = await axios.get("/api/messages/user");
          if(data.success){
            setUsers(data.filteredUsers);
            setUnseenMessages(data.unseenMessages)
          }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //get message for selecetd user
    const getMessages = async(userId)=>{
        try {
            const {data} = await axios.get(`/api/messages/${userId}`)
            if(data.success){
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    
    //send message to selected user
    const sendMessages = async(messageData)=>{
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}` , messageData);
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages , data.newMessage])
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to suscribe to messages for selected user
    const suscribeToMessages = async ()=>{
        if(!socket)return ;

        socket.on("newMessage" , (newMessage)=>{
            if(selectedUser && newMessage.senderId == selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=>[...prevMessages , newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`)
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages ,[newMessage.senderId]:
                    prevUnseenMessages[newMessage.senderId]?prevUnseenMessages
                    [newMessage.senderId]+1:1
                }))
            }
        })
    }

    //fucntion to unsuscribe form messages
    const unsuscribeFromMessages = ()=>{
        if(socket) socket.off("newMessage")
    }

    useEffect(()=>{
        suscribeToMessages();
        return ()=> unsuscribeFromMessages();
    },[socket , selectedUser])

    const value = {
        messages, users, selectedUser, getUsers, setMessages, sendMessages, setSelectedUser, unseenMessages, setUnseenMessages,getMessages
    }

    return(
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}
