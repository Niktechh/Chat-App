"use client"
import bgImage from "./assets/bgImage.svg";
import Sidebar from "./components/Sidebar"
import RightSidebar from "./components/RightSidebar"
import ChatContainer from "./components/ChatContainer"
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "@/context/ChatContext";



export default function Page() {
  const {authuser , authLoading} = useContext(AuthContext);
  const router = useRouter();
  const {selectedUser} = useContext(ChatContext);
  useEffect(()=>{
    if(!authuser && !authLoading){
      router.replace("/login");
    }
  },[authLoading, authuser,router]);

  if(authLoading || !authuser){
    return(
       <div className="bg-black text-white text-3xl flex justify-center items-center w-full h-screen">Loading...</div>
      )
  }


  return (
    <div style={{ backgroundImage: `url(${bgImage.src})` }} className="min-h-screen bg-[length:100%_auto] bg-center bg-no-repeat">
      <div>
        <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
          <div className={`h-full backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden grid grid-cols-1 relative ${selectedUser?'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]':'md:grid-cols-2'}`}>
            <Sidebar/>
            <ChatContainer/>
            <RightSidebar/>
          </div>

        </div>
      </div>

    </div>
  )
}