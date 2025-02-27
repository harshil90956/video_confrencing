import User from "../models/userSchema.js";
import bcrypt from 'bcrypt';
import httpStatus from "http-status";
import crypto from "crypto";
import { Meeting } from "../models/meetingModel.js";

// User registration function
const registerUser = async (req, res) => {
  const { username, name, password } = req.body;
  console.log(username);

  try {
    // Check if all required fields are provided
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the user already exists (by username)
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(httpStatus.FOUND).json({ message: "User already exists." });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const user = new User({
      username,
      name,
      password: hashedPassword,
    });

    await user.save();

    // Respond with a success message
    res.status(httpStatus.CREATED).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// User login function
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // Validate request body
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found." });
    }

    // Compare password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials." });
    }

    // Generate a token and save it to the user object
    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();

    // Respond with the token
    return res.status(httpStatus.OK).json({ token , message:"Loging Sucessfullly"});
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        console.log('Received Token:', token); // Log the received token
        const user = await User.findOne({ token: token });

        if (!user) {
            console.log('User not found');  // Log if user is not found
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Found User:', user); // Log user info to verify
        const meetings = await Meeting.find({ user_id: user.username });

        console.log('Meetings Found:', meetings);  // Log meetings found
        res.json(meetings);  // Send the meetings back
    } catch (e) {
        console.error('Error:', e);  // Log the error
        res.status(500).json({ message: `Something went wrong: ${e.message}` });
    }
};


const addToHistory = async (req,res)=>{
  const {token,meeting_code} = req.body;

  try {
    const user = await User.findOne({token:token});
    if (!user) {
      return res.status(404).json({ message: "User not found" });
  }

  console.log(user.username);
    const newMeeting = new Meeting({
      user_id:user.username,
      meetingCode:meeting_code
    });

    await newMeeting.save();
    res.status(httpStatus.CREATED).json({message:"Added code to history"})
  } catch (e) {
    res.json({message:`Something Went Wrong ${e}`})
  }
}

export { registerUser, loginUser,getUserHistory,addToHistory };
