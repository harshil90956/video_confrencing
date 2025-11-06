import axios from "axios";
import httpStatus from "http-status";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});

// Better axios configuration
const client = axios.create({
    baseURL: `${server}`,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for debugging
client.interceptors.request.use(
    (config) => {
        console.log(`🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        console.log('Request Data:', config.data);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
client.interceptors.response.use(
    (response) => {
        console.log(`✅ Response received from: ${response.config.url}`);
        console.log('Response Data:', response.data);
        return response;
    },
    (error) => {
        console.error(`❌ Response Error from: ${error.config?.url}`, {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null); 
    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        console.log("📝 Registration attempt:", { name, username });
        
        try {
            // Input validation
            if (!name?.trim() || !username?.trim() || !password?.trim()) {
                throw new Error('All fields are required');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            const request = await client.post("/register", { 
                name: name.trim(), 
                username: username.trim(), 
                password: password.trim() 
            });

            console.log("✅ Registration successful:", request.data);

            if (request.status === httpStatus.CREATED) {
                return request.data.message || "Registration successful!";
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (err) {
            console.error('💥 Registration failed:', err);
            
            let errorMessage = 'Registration failed!';
            
            if (axios.isAxiosError(err)) {
                if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
                    errorMessage = 'Cannot connect to server. Please check:\n1. Backend is running\n2. Server URL is correct\n3. No CORS issues';
                } else if (err.response) {
                    errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
                } else if (err.request) {
                    errorMessage = 'No response from server. Check if backend is running.';
                }
            } else {
                errorMessage = err.message || 'Registration failed!';
            }
            
            throw new Error(errorMessage);
        }
    }

    const handleLogin = async (username, password) => {
        console.log("🔐 Login attempt:", { username });
        
        try {
            // Input validation
            if (!username?.trim() || !password?.trim()) {
                throw new Error('Please enter both username and password');
            }

            const request = await client.post("/login", { 
                username: username.trim(), 
                password: password.trim() 
            });

            console.log('✅ Login successful:', request.data);
            
            if (request.status === httpStatus.OK) {
                // Store the token in localStorage
                if (request.data.token) {
                    localStorage.setItem("token", request.data.token);
                    
                    // Store user data if available
                    if (request.data.user) {
                        localStorage.setItem("user", JSON.stringify(request.data.user));
                        setUserData(request.data.user);
                    }
                    
                    console.log('🔑 Token stored, redirecting to home...');
                    
                    // Redirect the user to the home page
                    router("/home");
                    
                    return request.data.message || "Login successful!";
                } else {
                    throw new Error('No token received from server');
                }
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (err) {
            console.error('💥 Login Error Details:', {
                name: err.name,
                message: err.message,
                code: err.code,
                response: err.response?.data
            });
            
            let errorMessage = 'Login failed! Please try again.';
            
            if (axios.isAxiosError(err)) {
                if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
                    errorMessage = 'Cannot connect to server. Please check:\n• Backend server is running\n• Server URL: ' + server + '\n• No browser extensions blocking requests';
                } else if (err.response) {
                    // Server responded with error status
                    const status = err.response.status;
                    const serverMessage = err.response.data?.message;
                    
                    switch (status) {
                        case 400:
                            errorMessage = serverMessage || 'Invalid request data';
                            break;
                        case 401:
                            errorMessage = serverMessage || 'Invalid username or password';
                            break;
                        case 404:
                            errorMessage = 'Login endpoint not found. Check API routes.';
                            break;
                        case 500:
                            errorMessage = serverMessage || 'Server error. Please try again later.';
                            break;
                        default:
                            errorMessage = serverMessage || `Server error (${status})`;
                    }
                } else if (err.request) {
                    // Request made but no response received
                    errorMessage = 'No response from server. Please check if backend is running.';
                }
            } else {
                errorMessage = err.message || 'Login failed!';
            }
            
            throw new Error(errorMessage);
        }
    };
    
    const getHistoryOfUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error('No authentication token found');
            }

            const request = await client.get("/get_all_activity", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return request.data;
        } catch (err) {
            console.error('History fetch error:', err);
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error('No authentication token found');
            }

            const request = await client.post("/add_to_activity", {
                meeting_code: meetingCode
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return request.data;
        } catch (e) {
            console.error('Add to history error:', e);
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