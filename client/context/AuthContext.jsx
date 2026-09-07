"use client";

import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

axios.defaults.baseURL = backend_url;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(null);
    const [authuser, setAuthuser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");

        if (savedToken) {
            setToken(savedToken);
        }else{
            setAuthLoading(false);
        }
    }, []);
//check if user is authenticated and if so, set the user data and connect the socket
const checkAuth = async()=>{
    try {
        const {data} = await axios.post("/api/auth/check");
        if(data.success){
            setAuthuser(data.user);
        }
    } catch (error) {
        toast.error(error.message)
    }finally{
        setAuthLoading(false);
    }
    
}


//login fucntion to handle user Authentication and socket connection
const login = async(state , credentials)=>{
    try {
    const {data} = await axios.post(`/api/auth/${state}`, credentials);
    if(data.success){
        setAuthuser(data.userData);
        axios.defaults.headers.common['token'] = data.token;
        setToken(data.token);
        localStorage.setItem('token',data.token);
        toast.success(data.message)
    }else{
        toast.error(data.message)
    }
    } catch (error) {
        toast.error(error.message)
    }
}
//logout fucntion to handle user logout and socket disconnection
const logout = async()=>{
    localStorage.removeItem('token');
    if(socket){
        socket.disconnect();
    }
    setToken(null);
    setAuthuser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["token"];
    toast.success("logged out successfully");
}

// update profile function to handle user profile updates
const updateProfile = async(body)=>{
    try {
        const {data} = await axios.put("/api/auth/update-profile" , body);
        if(data.success){
            setAuthuser(data.user);
            toast.success("Profile updated Successfully");
        }
    } catch (error) {
        toast.error(error.message);
    }
}


//connect socket function to handle socket connection and online user update
const connectSocket = (userData)=>{
    if(!userData || socket?.connected)return;
    const newSocket = io(backend_url , {
        query:{
            userId: userData._id,
        }
    })
    // newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers" , (userIds)=>{
        setOnlineUsers(userIds);
    })
}

useEffect(()=>{
    if(token){
        axios.defaults.headers.common['token'] = token
        checkAuth()
    }
},[token])

useEffect(() => {
    if (authuser) {
        connectSocket(authuser);
    }
}, [authuser]);

    

    const value = {
        axios,
        token,
        setToken,
        authuser,
        setAuthuser,
        onlineUsers,
        setOnlineUsers,
        socket,
        setSocket,
        login,
        logout,
        updateProfile,
        authLoading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};