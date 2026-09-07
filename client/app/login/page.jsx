"use client";
import { useState } from "react";
import assets from "../assets/assets";
import bgImage from "../assets/bgImage.svg";
import {useRouter} from "next/navigation"
import { useContext } from "react";
import {AuthContext} from "../../context/AuthContext"
import { useEffect } from "react";

export default function login() {
  const {authuser , authLoading ,login} = useContext(AuthContext);
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [bio, setBio] = useState("");

  const router = useRouter();
  
  const onSubmitHandler = async(e)=>{
    e.preventDefault();

    if(currState == "Sign up" && !isDataSubmitted){
      setIsDataSubmitted(true);
      return;
    }
    const credentials = 
      currState === "Sign up"
      ?{fullName , email , password , bio}
      :{email , password};
      
    await login(
      currState === "Sign up"? "signup":"login",
      credentials
    )


  }

  useEffect(()=>{
    if(!authLoading && authuser){
      router.replace("/");
    }
  },[authLoading , authuser , router]);

  if(authLoading || authuser){
    return(
       <div className="bg-black text-white text-3xl flex justify-center items-center w-full h-screen">Loading...</div>
      )
  }

  return (
    <div
      style={{ backgroundImage: `url(${bgImage.src})` }}
      className="min-h-screen bg-[length:100%_auto] bg-center bg-no-repeat"
    >
      <div>
        <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
          {/*-------left-----*/}
          <img
            src={assets.logo_big.src}
            alt="logo"
            className="w-[min(30vw,250px)]"
          />
          {/*-------right-----*/}
          <form onSubmit={onSubmitHandler} className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg">
            <h2 className="font-medium text-2xl flex justify-between items-center">
              {currState}
              {isDataSubmitted && <img onClick={()=>setIsDataSubmitted(false)}
                src={assets.arrow_icon.src}
                alt="arrow_icon"
                className="w-5 cursor-pointer"
              /> }
              
            </h2>

            {currState === "Sign up" && !isDataSubmitted && <input onChange={(e)=>setFullName(e.target.value)} value={fullName} type="text" className="p-2 border border-gray-500 rounded-md focus:outline-none" placeholder="Full name" required/> }

            {!isDataSubmitted && (
                <>
                <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder="Email Address" required className="p-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder="Enter Password" required className="p-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </>
            )}

            { currState == "Sign up" && isDataSubmitted && (
                <textarea onChange={(e)=>setBio(e.target.value)} value={bio} rows={4} className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="provide a short bio..." required></textarea>
            )}

            <button type="submit" className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer" >
                {currState === "Sign up"?"Create Account":"Login Now"}
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
                <input type="checkbox" />
                <p>Agree to the terms of use & privacy policy.</p>
            </div>
            
            <div className="flex flex-col gap-2">
                {currState === "Sign up"?(
                    <p className="text-sm text-gray-600">Already heave an account? <span className="font-medium text-violet-500 cursor-pointer" onClick={()=>{setCurrState("Login"); setIsDataSubmitted(false)} } >Login here</span></p>
                ):(
                    <p className="text-sm text-gray-600">Create an account. <span className="font-medium text-violet-500 cursor-pointer" onClick={()=>setCurrState("Sign up")}>Click here</span></p>
                )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
