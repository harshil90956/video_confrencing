import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import server from '../environment';
import { createBlackSilenceStream } from '../utils/mediaUtils';

const server_url = server;
const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" },
        { "urls": "stun:stun1.l.google.com:19302" }
    ]
};

export const useVideoCall = (localVideoRef, routeTo) => {
    const socketRef = useRef();
    const socketIdRef = useRef();
    const connections = useRef({});
    const videoRefs = useRef(new Map());
    const localStreamRef = useRef(null);
    
    const iceCandidateBuffers = useRef(new Map());

    // State
    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [screen, setScreen] = useState(false);
    const [showModal, setModal] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [users, setUsers] = useState([]);
    const [mediaReady, setMediaReady] = useState(false);

    // ICE Candidate Buffer Management
    const initializeIceCandidateBuffer = useCallback((peerId) => {
        iceCandidateBuffers.current.set(peerId, []);
    }, []);

    const addIceCandidateToBuffer = useCallback((peerId, candidate) => {
        if (!iceCandidateBuffers.current.has(peerId)) {
            initializeIceCandidateBuffer(peerId);
        }
        iceCandidateBuffers.current.get(peerId).push(candidate);
    }, [initializeIceCandidateBuffer]);

    const flushIceCandidateBuffer = useCallback(async (peerId) => {
        const buffer = iceCandidateBuffers.current.get(peerId);
        const pc = connections.current[peerId];
        
        if (!buffer || !pc || !pc.remoteDescription) {
            return;
        }
        
        for (const candidate of buffer) {
            try {
                await pc.addIceCandidate(candidate);
            } catch (error) {
                console.error('Error adding buffered ICE candidate:', error);
            }
        }
        
        iceCandidateBuffers.current.set(peerId, []);
    }, []);

    const cleanupPeerResources = useCallback((peerId) => {
        console.log(`🧹 Cleaning up resources for peer: ${peerId}`);
        
        if (connections.current[peerId]) {
            connections.current[peerId].close();
            delete connections.current[peerId];
        }
        
        if (videoRefs.current.has(peerId)) {
            videoRefs.current.delete(peerId);
        }
        
        if (iceCandidateBuffers.current.has(peerId)) {
            iceCandidateBuffers.current.delete(peerId);
        }
    }, []);

    // Media Functions
    const getPermissions = async () => {
        try {
            try {
                const videoPermission = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 1280, height: 720 } 
                });
                setVideoAvailable(true);
                videoPermission.getTracks().forEach(track => track.stop());
            } catch (videoError) {
                console.log('Video permission denied');
                setVideoAvailable(false);
            }

            try {
                const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
                setAudioAvailable(true);
                audioPermission.getTracks().forEach(track => track.stop());
            } catch (audioError) {
                console.log('Audio permission denied');
                setAudioAvailable(false);
            }

            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
        } catch (error) {
            console.log('General permissions error:', error);
        }
    };

    const initializeMedia = async () => {
        try {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }

            if ((video && videoAvailable) || (audio && audioAvailable)) {
                const constraints = {
                    video: video && videoAvailable ? {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        frameRate: { ideal: 30 }
                    } : false,
                    audio: audio && audioAvailable
                };

                console.log('🎥 Initializing media with constraints:', constraints);
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    await localVideoRef.current.play().catch(console.log);
                }
                
                setMediaReady(true);
                console.log('✅ Media initialized successfully');
            } else {
                console.log('🖥️ Using black silence stream');
                const blackStream = createBlackSilenceStream();
                localStreamRef.current = blackStream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = blackStream;
                }
                setMediaReady(true);
            }
        } catch (error) {
            console.error('❌ Error accessing media devices:', error);
            const blackStream = createBlackSilenceStream();
            localStreamRef.current = blackStream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = blackStream;
            }
            setMediaReady(true);
        }
    };

    // Screen Share Functions
    const getDisplayMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ 
                video: true, 
                audio: true 
            });
            
            setScreen(true);
            
            if (localStreamRef.current) {
                replaceTracksInPeerConnections(stream);
            }
            
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            
            stream.getTracks().forEach(track => {
                track.onended = async () => {
                    console.log('🖥️ Screen share ended');
                    setScreen(false);
                    await initializeMedia();
                };
            });
        } catch (error) {
            console.log('❌ Screen share error:', error);
            setScreen(false);
        }
    };

    const replaceTracksInPeerConnections = (newStream) => {
        Object.entries(connections.current).forEach(([peerId, pc]) => {
            const senders = pc.getSenders();
            
            const videoTrack = newStream.getVideoTracks()[0];
            if (videoTrack) {
                const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(videoTrack).catch(console.log);
                } else {
                    pc.addTrack(videoTrack, newStream);
                }
            }
            
            const audioTrack = newStream.getAudioTracks()[0];
            if (audioTrack) {
                const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
                if (audioSender) {
                    audioSender.replaceTrack(audioTrack).catch(console.log);
                } else {
                    pc.addTrack(audioTrack, newStream);
                }
            }
        });
    };

    // WebRTC Functions - FIXED VERSION
    const createPeerConnection = useCallback((peerId) => {
        console.log(`🔗 Creating peer connection for: ${peerId}`);
        
        const pc = new RTCPeerConnection(peerConfigConnections);
        
        initializeIceCandidateBuffer(peerId);
        
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(`🧊 Sending ICE candidate to ${peerId}`);
                socketRef.current.emit('signal', peerId, JSON.stringify({ 'ice': event.candidate }));
            }
        };

        pc.ontrack = (event) => {
            console.log(`🎥 Track received from ${peerId}:`, event.streams.length);
            
            if (event.streams && event.streams[0]) {
                const remoteStream = event.streams[0];
                
                // Monitor stream tracks
                remoteStream.getTracks().forEach(track => {
                    console.log(`📊 Track ${track.kind} from ${peerId}:`, track.readyState);
                    
                    track.onended = () => {
                        console.log(`⏹️ Track ended for ${peerId}`);
                        updateUser(peerId, { 
                            videoEnabled: false,
                            audioEnabled: false 
                        });
                    };
                    
                    track.onmute = () => {
                        console.log(`🔇 Track muted for ${peerId}`);
                    };
                    
                    track.onunmute = () => {
                        console.log(`🔊 Track unmuted for ${peerId}`);
                    };
                });

                updateUser(peerId, { 
                    stream: remoteStream,
                    videoEnabled: true,
                    audioEnabled: true 
                });
                
                // Set video element with retry logic
                const setVideoStream = () => {
                    if (videoRefs.current.has(peerId)) {
                        const videoElement = videoRefs.current.get(peerId);
                        if (videoElement) {
                            videoElement.srcObject = remoteStream;
                            videoElement.muted = false; // Important for remote videos
                            
                            videoElement.play().then(() => {
                                console.log(`✅ Video playing for ${peerId}`);
                            }).catch(error => {
                                console.log(`❌ Auto-play failed for ${peerId}:`, error);
                                // Retry after delay
                                setTimeout(setVideoStream, 500);
                            });
                        }
                    }
                };
                
                setTimeout(setVideoStream, 100);
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`🔗 Connection state for ${peerId}:`, pc.connectionState);
            if (pc.connectionState === 'connected') {
                console.log(`✅ Fully connected to ${peerId}`);
            } else if (pc.connectionState === 'failed') {
                console.log(`❌ Connection failed with ${peerId}`);
                // Attempt to restart connection
                setTimeout(() => {
                    if (connections.current[peerId] && connections.current[peerId].connectionState === 'failed') {
                        console.log(`🔄 Attempting to restart connection with ${peerId}`);
                        cleanupPeerResources(peerId);
                        // Re-initiate connection
                        if (socketRef.current) {
                            connections.current[peerId] = createPeerConnection(peerId);
                            createAndSendOffer(peerId);
                        }
                    }
                }, 2000);
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`🧊 ICE connection state for ${peerId}:`, pc.iceConnectionState);
        };

        // Add local stream tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                try {
                    pc.addTrack(track, localStreamRef.current);
                    console.log(`➕ Added ${track.kind} track to ${peerId}`);
                } catch (error) {
                    console.log('Error adding track to peer connection:', error);
                }
            });
        }

        connections.current[peerId] = pc;
        return pc;
    }, [initializeIceCandidateBuffer, cleanupPeerResources]);

    const createAndSendOffer = useCallback(async (peerId) => {
        const pc = connections.current[peerId];
        if (!pc) {
            console.log(`❌ No peer connection for ${peerId}`);
            return;
        }

        try {
            console.log(`📤 Creating offer for ${peerId}`);
            
            if (!mediaReady) {
                console.log('⏳ Waiting for media to be ready...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            console.log(`📨 Offer created for ${peerId}, waiting for ICE gathering...`);
            
            // Wait for ICE gathering to complete
            await new Promise((resolve) => {
                if (pc.iceGatheringState === 'complete') {
                    resolve();
                    return;
                }
                
                const checkIceState = () => {
                    if (pc.iceGatheringState === 'complete') {
                        resolve();
                    } else {
                        setTimeout(checkIceState, 100);
                    }
                };
                
                const timeout = setTimeout(() => {
                    console.log(`⏰ ICE gathering timeout for ${peerId}, sending anyway`);
                    resolve();
                }, 5000);
                
                pc.onicegatheringstatechange = () => {
                    if (pc.iceGatheringState === 'complete') {
                        clearTimeout(timeout);
                        resolve();
                    }
                };
                
                checkIceState();
            });
            
            console.log(`🚀 Sending offer to ${peerId}`);
            socketRef.current.emit('signal', peerId, JSON.stringify({ 'sdp': pc.localDescription }));
        } catch (error) {
            console.error('❌ Error creating/sending offer:', error);
        }
    }, [mediaReady]);

    const handleOffer = useCallback(async (fromId, offer) => {
        console.log(`📩 Received offer from ${fromId}`);
        
        if (!connections.current[fromId]) {
            console.log(`🔗 Creating new peer connection for offer from ${fromId}`);
            connections.current[fromId] = createPeerConnection(fromId);
        }

        const pc = connections.current[fromId];

        try {
            // Check signaling state
            if (pc.signalingState !== 'stable') {
                console.log(`⚠️ Signaling state not stable: ${pc.signalingState}, waiting...`);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            await pc.setRemoteDescription(offer);
            console.log(`✅ Remote description set for ${fromId}`);
            
            await flushIceCandidateBuffer(fromId);
            
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log(`📤 Created answer for ${fromId}`);
            
            // Wait for ICE gathering
            await new Promise(resolve => {
                if (pc.iceGatheringState === 'complete') {
                    resolve();
                    return;
                }
                
                const checkIceState = () => {
                    if (pc.iceGatheringState === 'complete') {
                        resolve();
                    } else {
                        setTimeout(checkIceState, 100);
                    }
                };
                checkIceState();
            });
            
            socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': pc.localDescription }));
            console.log(`🚀 Sent answer to ${fromId}`);
        } catch (error) {
            console.error('❌ Error handling offer:', error);
        }
    }, [createPeerConnection, flushIceCandidateBuffer]);

    const handleAnswer = useCallback(async (fromId, answer) => {
        console.log(`📩 Received answer from ${fromId}`);
        
        const pc = connections.current[fromId];
        if (!pc) {
            console.log(`❌ No peer connection for ${fromId}`);
            return;
        }

        try {
            if (pc.signalingState !== 'have-local-offer') {
                console.log(`⚠️ Cannot set answer, wrong state: ${pc.signalingState}`);
                return;
            }

            await pc.setRemoteDescription(answer);
            console.log(`✅ Remote description set from answer for ${fromId}`);
            await flushIceCandidateBuffer(fromId);
        } catch (error) {
            console.error('❌ Error handling answer:', error);
        }
    }, [flushIceCandidateBuffer]);

    const handleIceCandidate = useCallback(async (fromId, candidate) => {
        console.log(`🧊 Received ICE candidate from ${fromId}`);
        
        const pc = connections.current[fromId];
        if (!pc) {
            console.log(`❌ No peer connection for ${fromId}, buffering candidate`);
            addIceCandidateToBuffer(fromId, candidate);
            return;
        }

        try {
            if (!pc.remoteDescription) {
                console.log(`⏳ No remote description yet, buffering ICE candidate for ${fromId}`);
                addIceCandidateToBuffer(fromId, candidate);
                return;
            }
            
            await pc.addIceCandidate(candidate);
            console.log(`✅ ICE candidate added for ${fromId}`);
        } catch (error) {
            console.error('❌ Error handling ICE candidate:', error);
        }
    }, [addIceCandidateToBuffer]);

    const gotMessageFromServer = useCallback((fromId, message) => {
        if (fromId === socketIdRef.current) return;

        try {
            const signal = JSON.parse(message);
            console.log(`📨 Signal from ${fromId}:`, signal.sdp ? signal.sdp.type : 'ice');

            if (signal.sdp) {
                if (signal.sdp.type === 'offer') {
                    handleOffer(fromId, new RTCSessionDescription(signal.sdp));
                } else if (signal.sdp.type === 'answer') {
                    handleAnswer(fromId, new RTCSessionDescription(signal.sdp));
                }
            } else if (signal.ice) {
                handleIceCandidate(fromId, new RTCIceCandidate(signal.ice));
            }
        } catch (error) {
            console.error('❌ Error parsing signal:', error);
        }
    }, [handleOffer, handleAnswer, handleIceCandidate]);

    // User Management
    const addUser = useCallback((userData) => {
        setUsers(prevUsers => {
            const exists = prevUsers.find(u => u.id === userData.id);
            if (exists) {
                console.log(`👤 User ${userData.id} already exists`);
                return prevUsers;
            }
            
            const newUser = { 
                ...userData, 
                isSpeaking: false,
                videoEnabled: userData.videoEnabled !== undefined ? userData.videoEnabled : false,
                audioEnabled: userData.audioEnabled !== undefined ? userData.audioEnabled : false,
                joinedAt: Date.now()
            };
            
            console.log(`👤 Added new user: ${newUser.id}`, newUser);
            return [...prevUsers, newUser];
        });
    }, []);

    const removeUser = useCallback((userId) => {
        console.log(`👤 Removing user: ${userId}`);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        cleanupPeerResources(userId);
    }, [cleanupPeerResources]);

    const updateUser = useCallback((userId, updates) => {
        console.log(`👤 Updating user ${userId}:`, updates);
        setUsers(prevUsers => 
            prevUsers.map(user => 
                user.id === userId ? { ...user, ...updates } : user
            )
        );
    }, []);

    // Track control functions
    const handleVideo = useCallback(async () => {
        const newVideoState = !video;
        console.log(`🎥 Video toggle: ${newVideoState}`);
        setVideo(newVideoState);
        
        if (localStreamRef.current) {
            const videoTracks = localStreamRef.current.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = newVideoState;
            });
            
            Object.values(connections.current).forEach(pc => {
                const senders = pc.getSenders();
                senders.forEach(sender => {
                    if (sender.track && sender.track.kind === 'video') {
                        sender.track.enabled = newVideoState;
                    }
                });
            });

            if (localVideoRef.current) {
                if (!newVideoState && videoTracks.length > 0) {
                    const blackStream = createBlackSilenceStream();
                    localVideoRef.current.srcObject = blackStream;
                } else if (newVideoState) {
                    localVideoRef.current.srcObject = localStreamRef.current;
                }
            }
        }
    }, [video]);

    const handleAudio = useCallback(() => {
        const newAudioState = !audio;
        console.log(`🎤 Audio toggle: ${newAudioState}`);
        setAudio(newAudioState);
        
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = newAudioState;
            });

            Object.values(connections.current).forEach(pc => {
                const senders = pc.getSenders();
                senders.forEach(sender => {
                    if (sender.track && sender.track.kind === 'audio') {
                        sender.track.enabled = newAudioState;
                    }
                });
            });
        }
    }, [audio]);

    const handleScreen = useCallback(async () => {
        if (screen) {
            console.log('🖥️ Stopping screen share');
            setScreen(false);
            await initializeMedia();
        } else {
            console.log('🖥️ Starting screen share');
            await getDisplayMedia();
        }
    }, [screen]);

    // Socket connection
    const connectToSocketServer = useCallback(() => {
    console.log('🔌 Connecting to socket server...');
    
    socketRef.current = io.connect(server_url, { 
        secure: false,
        transports: ['websocket', 'polling']
    });
    
    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on('connect', () => {
        console.log('✅ Connected to socket server, ID:', socketRef.current.id);
        
        // ✅ FIX: Send username along with room join
        socketRef.current.emit('join-call', { 
            room: window.location.href, 
            username: username // ✅ Send username to server
        });
        
        socketIdRef.current = socketRef.current.id;

        // ✅ FIX: Add local user with actual username
        addUser({
            id: socketIdRef.current,
            name: username, // ✅ Use actual username
            isYou: true,
            stream: localStreamRef.current,
            videoEnabled: video,
            audioEnabled: audio
        });

        socketRef.current.on('chat-message', addMessage);

        socketRef.current.on('user-left', (id) => {
            console.log(`👤 User left: ${id}`);
            removeUser(id);
        });

        socketRef.current.on('user-joined', (userData) => {
            // userData should be { id: 'socketId', username: 'actualUsername' }
            if (userData.id === socketIdRef.current) return;

            console.log(`🆕 User joined: ${userData.username} (${userData.id})`);
            
            addUser({
                id: userData.id,
                name: userData.username, // ✅ Use actual username from server
                isYou: false,
                videoEnabled: false,
                audioEnabled: false
            });

            if (!connections.current[userData.id] || connections.current[userData.id].connectionState === 'closed') {
                console.log(`🔗 Creating peer connection for new user: ${userData.id}`);
                connections.current[userData.id] = createPeerConnection(userData.id);
                
                setTimeout(() => {
                    if (connections.current[userData.id]) {
                        createAndSendOffer(userData.id);
                    }
                }, 1000);
            }
        });

             socketRef.current.on('existing-users', (existingUsers) => {
            // existingUsers should be array of { id: 'socketId', username: 'actualUsername' }
            console.log('👥 Existing users:', existingUsers);
            
            existingUsers.forEach(userData => {
                if (userData.id === socketIdRef.current) return;

                addUser({
                    id: userData.id,
                    name: userData.username, // ✅ Use actual username from server
                    isYou: false,
                    videoEnabled: false,
                    audioEnabled: false
                });

                if (!connections.current[userData.id] || connections.current[userData.id].connectionState === 'closed') {
                    console.log(`🔗 Creating peer connection for existing user: ${userData.id}`);
                    connections.current[userData.id] = createPeerConnection(userData.id);
                    
                    setTimeout(() => {
                        if (connections.current[userData.id]) {
                            createAndSendOffer(userData.id);
                        }
                    }, 500);
                }
            });
        });
    });

        socketRef.current.on('disconnect', () => {
            console.log('❌ Disconnected from server');
        });

        socketRef.current.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });
    }, [username, addUser, removeUser, gotMessageFromServer, createAndSendOffer, createPeerConnection, video, audio]);

    const handleEndCall = useCallback(() => {
        console.log('📞 Ending call...');
        
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        
        Object.keys(connections.current).forEach(peerId => {
            cleanupPeerResources(peerId);
        });
        
        iceCandidateBuffers.current.clear();
        
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        
        setUsers([]);
        setMediaReady(false);
        routeTo('/home');
    }, [routeTo, cleanupPeerResources]);

    const addMessage = useCallback((data, sender, socketIdSender) => {
        const newMessage = { 
            sender, 
            data, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prev) => prev + 1);
        }
    }, []);

    const sendMessage = useCallback(() => {
        if (message.trim() && socketRef.current) {
            socketRef.current.emit('chat-message', message, username);
            setMessage("");
        }
    }, [message, username]);

    const connect = useCallback(() => {
        if (username.trim()) {
            console.log('🚀 Connecting with username:', username);
            setAskForUsername(false);
            initializeMedia().then(() => {
                connectToSocketServer();
            });
            setMessages([]);
        }
    }, [username, connectToSocketServer]);

    // Effects
    useEffect(() => {
        getPermissions();
        
        // Debug connection status
        const interval = setInterval(() => {
            console.log('🔍 Connection Status:');
            Object.keys(connections.current).forEach(peerId => {
                const pc = connections.current[peerId];
                console.log(`Peer ${peerId}:`, {
                    signalingState: pc.signalingState,
                    connectionState: pc.connectionState,
                    iceConnectionState: pc.iceConnectionState,
                    iceGatheringState: pc.iceGatheringState
                });
            });
        }, 15000); // Every 15 seconds
        
        return () => {
            clearInterval(interval);
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            Object.values(connections.current).forEach(pc => {
                if (pc) pc.close();
            });
            iceCandidateBuffers.current.clear();
        };
    }, []);

    useEffect(() => {
        if (screen) {
            getDisplayMedia();
        }
    }, [screen]);

    return {
        // State
        videoAvailable,
        audioAvailable,
        screenAvailable,
        video,
        audio,
        screen,
        showModal,
        messages,
        message,
        newMessages,
        askForUsername,
        username,
        users,
        participants: users,
        mediaReady,
        localStream: localStreamRef.current,
        
        // Actions
        setVideo,
        setAudio,
        setScreen,
        setModal,
        setMessage,
        setAskForUsername,
        setUsername,
        setNewMessages,
        
        // Functions
        handleVideo,
        handleAudio,
        handleScreen,
        handleEndCall,
        sendMessage,
        connect,
        addMessage,
        videoRefs,
    };
};