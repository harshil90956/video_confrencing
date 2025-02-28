import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
})

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null); 
    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        console.log("i am reached",name,username,password)
        try {
            console.log("before req")
            const request = await client.post("/register", { name, username, password });
            console.log("after req",request)

            if (request.status === httpStatus.CREATED) {
                console.log(request.data);
                return request.data.message;
            }
        } catch (err) {
            // Add better error handling
            const errorMessage = err.response?.data?.message || 'Registration failed!';
            throw new Error(errorMessage);
        }
    }

    const handleLogin = async (username, password) => {
        try {
            const request = await client.post("/login", { username, password });
            console.log('Login successful:', request.data.message);
            
            if (request.status === httpStatus.OK) {
                // Store the token in localStorage
                localStorage.setItem("token", request.data.token);
                console.log(request.data.message);
                // Redirect the user to the home page
                router("/home");
                
                // Optionally log the success message
                console.log(request.data.message);
                
                // Return the success message (if needed)
                return request.data.message;
            }
        } catch (err) {
            // Log the full error object for debugging purposes
            console.error('Login Error:', err);
            
            // Improve error handling for missing response data
            const errorMessage = err?.response?.data?.message || err?.message || 'Login failed! Please try again.';
            
            // Throw the error so it can be handled by the calling component
            throw new Error(errorMessage);
        }
    };
    
    const getHistoryOfUser = async () => {
        try {
            const request = await client.get("/get_all_activity", {
                params: { token: localStorage.getItem("token") }
            });
            return request.data;
        } catch (err) {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            const request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request.data; // Return the data for further use
        } catch (e) {
            throw e;
        }
    }

    const data = {
        userData,
        setUserData,
        addToUserHistory,
        getHistoryOfUser,
        handleRegister,
        handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}
