import React, { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../style/VideoMeet.module.css';
import { useVideoCall } from '../hooks/useVideoCall';
import LobbyDialog from '../components/VideoMeet/LobbyDialog';
import ControlBar from '../components/VideoMeet/ControlBar';
import ChatSidebar from '../components/VideoMeet/ChatSidebar';
import VideoTile from '../components/VideoMeet/VideoTile';

export default function VideoMeetComponent() {
    const localVideoRef = useRef();
    const chatContainerRef = useRef();
    const routeTo = useNavigate();

    const {
        showModal,
        messages,
        message,
        newMessages,
        askForUsername,
        username,
        users,
        mediaReady,
        localStream,
        videoRefs,
        setMessage,
        setUsername,
        setAskForUsername,
        setNewMessages,
        setModal,
        handleVideo,
        handleAudio,
        handleScreen,
        handleEndCall,
        sendMessage,
        connect,
    } = useVideoCall(localVideoRef, routeTo);

    // 🚀 FIX: Move all hooks to the top level - no conditional returns before hooks
    const { gridClass, gridStyle, displayUsers } = useMemo(() => {
        const totalUsers = users.length;
        let gridClass = '';
        let gridStyle = {};

        // Smart layout selection based on user count
        switch (totalUsers) {
            case 1:
                gridClass = styles.oneUser;
                break;
            case 2:
                gridClass = styles.twoUsers;
                break;
            case 3:
                gridClass = styles.threeUsers;
                break;
            case 4:
                gridClass = styles.fourUsers;
                break;
            case 5:
                gridClass = styles.fiveUsers;
                break;
            case 6:
                gridClass = styles.sixUsers;
                break;
            case 7:
                gridClass = styles.sevenUsers;
                break;
            case 8:
                gridClass = styles.eightUsers;
                break;
            case 9:
                gridClass = styles.nineUsers;
                break;
            default:
                gridClass = styles.manyUsers;
                // Dynamic calculation for large groups
                const columns = Math.ceil(Math.sqrt(totalUsers));
                const rows = Math.ceil(totalUsers / columns);
                gridStyle = {
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`
                };
                break;
        }

        // 🚀 FIX: Ensure we have users to display
        const localUser = mediaReady && localStream ? {
            id: 'local',
            name: username,
            isYou: true,
            videoEnabled: true,
            audioEnabled: true,
            stream: localStream
        } : null;

        const remoteUsers = users.filter(user => !user.isYou);
        const displayUsers = localUser ? [localUser, ...remoteUsers] : remoteUsers;

        return { gridClass, gridStyle, displayUsers };
    }, [users, localStream, mediaReady, username, styles]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    // Debug logging to verify all users are processed
    console.log('🔄 Current users:', displayUsers.length, 'Layout:', gridClass);

    // 🚀 FIX: Move conditional rendering AFTER all hooks
    if (askForUsername) {
        return (
            <div className={styles.container}>
                <LobbyDialog
                    username={username}
                    setUsername={setUsername}
                    connect={connect}
                />
            </div>
        );
    }

    if (!mediaReady) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Initializing media...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.meetContainer}>
                {/* 🚀 ULTIMATE GRID SOLUTION: Combined CSS classes + inline styles */}
                <div 
                    className={`${styles.videoGrid} ${gridClass}`}
                    style={gridStyle}
                    data-user-count={displayUsers.length}
                >
                    {displayUsers.map((user, index) => (
                        <VideoTile
                            key={user.id}
                            user={user}
                            isLocal={user.isYou}
                            videoRefs={videoRefs}
                            data-user-index={index}
                        />
                    ))}
                </div>

                {/* Control Bar */}
                <ControlBar
                    video={true}
                    audio={true}
                    screen={false}
                    screenAvailable={true}
                    newMessages={newMessages}
                    onVideoToggle={handleVideo}
                    onAudioToggle={handleAudio}
                    onScreenToggle={handleScreen}
                    onChatToggle={() => {
                        setModal(!showModal);
                        setNewMessages(0);
                    }}
                    onEndCall={handleEndCall}
                />

                {/* Chat Sidebar */}
                {showModal && (
                    <ChatSidebar
                        messages={messages}
                        message={message}
                        participants={users}
                        username={username}
                        onClose={() => setModal(false)}
                        onMessageChange={setMessage}
                        onSendMessage={sendMessage}
                        onKeyPress={handleKeyPress}
                        chatContainerRef={chatContainerRef}
                    />
                )}
            </div>
        </div>
    );
}