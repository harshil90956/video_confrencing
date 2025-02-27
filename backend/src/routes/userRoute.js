import express from 'express';
import {registerUser,loginUser,getUserHistory,addToHistory} from '../controllers/userController.js'; // Adjust path if necessary

const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post("/login",loginUser);
userRouter.post("/add_to_activity",addToHistory);
userRouter.get("/get_all_activity",getUserHistory);






export default userRouter;
