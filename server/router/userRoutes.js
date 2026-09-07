import express from "express"
import { login, signUp , checkAuth , updateProfile } from "../controllers/userContoller.js";
import { protectRoute } from "../middleware/auth.js";


const userRouter = express.Router()

userRouter.post("/signup" , signUp);
userRouter.post("/login" , login);
userRouter.put("/update-profile" , protectRoute , updateProfile);
userRouter.post("/check" , protectRoute , checkAuth);

export default userRouter;