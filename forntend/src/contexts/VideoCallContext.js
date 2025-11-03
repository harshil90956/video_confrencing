import React, { createContext, useContext, useRef, useCallback } from 'react';

const VideoCallContext = createContext();

export const VideoCallProvider = ({ children, value }) => {
    return (
        <VideoCallContext.Provider value={value}>
            {children}
        </VideoCallContext.Provider>
    );
};

export const useVideoCallContext = () => {
    const context = useContext(VideoCallContext);
    if (!context) {
        throw new Error('useVideoCallContext must be used within VideoCallProvider');
    }
    return context;
};