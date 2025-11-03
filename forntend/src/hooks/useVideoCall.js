import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import server from '../environment';
import { createBlackSilenceStream } from '../utils/mediaUtils';

const server_url = server;
const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
};

export const useVideoCall = (localVideoRef, routeTo) => {
    const socketRef = useRef();
    const socketIdRef = useRef();
    const connections = useRef({});
    const videoRefs = useRef(new Map());
    const localStreamRef = useRef(null);
    
    // 🚨 CRITICAL FIX: ICE Candidate Buffering
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

    // 🚨 CRITICAL FIX: ICE Candidate Buffer Management
    const initializeIceCandidateBuffer = useCallback((peerId) => {
        iceCandidateBuffers.current.set(peerId, []);
        console.log(`📦 Initialized ICE candidate buffer for ${peerId}`);
    }, []);

    const addIceCandidateToBuffer = useCallback((peerId, candidate) => {
        if (!iceCandidateBuffers.current.has(peerId)) {
            initializeIceCandidateBuffer(peerId);
        }
        iceCandidateBuffers.current.get(peerId).push(candidate);
        console.log(`📦 Buffered ICE candidate for ${peerId}, total: ${iceCandidateBuffers.current.get(peerId).length}`);
    }, [initializeIceCandidateBuffer]);

    const flushIceCandidateBuffer = useCallback(async (peerId) => {
        const buffer = iceCandidateBuffers.current.get(peerId);
        const pc = connections.current[peerId];
        
        if (!buffer || !pc || !pc.remoteDescription) {
            console.log(`📦 No buffer to flush for ${peerId}`);
            return;
        }
        
        console.log(`📦 Flushing ICE candidate buffer for ${peerId}: ${buffer.length} candidates`);
        
        for (const candidate of buffer) {
            try {
                await pc.addIceCandidate(candidate);
                console.log('✅ Successfully added buffered ICE candidate');
            } catch (error) {
                console.error('❌ Error adding buffered ICE candidate:', error);
            }
        }
        
        // Clear the buffer after processing
        iceCandidateBuffers.current.set(peerId, []);
    }, []);

    const cleanupPeerResources = useCallback((peerId) => {
        console.log(`🧹 Cleaning up resources for peer: ${peerId}`);
        
        // Remove from connections
        if (connections.current[peerId]) {
            connections.current[peerId].close();
            delete connections.current[peerId];
        }
        
        // Remove from video refs
        if (videoRefs.current.has(peerId)) {
            videoRefs.current.delete(peerId);
        }
        
        // 🚨 CRITICAL: Clean up ICE candidate buffer
        if (iceCandidateBuffers.current.has(peerId)) {
            iceCandidateBuffers.current.delete(peerId);
        }
    }, []);

    // Media Functions
    const getPermissions = async () => {
        try {
            // Test video permission
            try {
                const videoPermission = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 1280, height: 720 } 
                });
                setVideoAvailable(true);
                videoPermission.getTracks().forEach(track => track.stop());
            } catch (videoError) {
                setVideoAvailable(false);
                console.log('Video permission denied:', videoError);
            }

            // Test audio permission
            try {
                const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
                setAudioAvailable(true);
                audioPermission.getTracks().forEach(track => track.stop());
            } catch (audioError) {
                setAudioAvailable(false);
                console.log('Audio permission denied:', audioError);
            }

            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
        } catch (error) {
            console.log('General permissions error:', error);
        }
    };

    const initializeMedia = async () => {
        try {
            // Stop any existing stream
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

                console.log('🎥 Getting user media with constraints:', constraints);
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                    await localVideoRef.current.play().catch(console.log);
                }
                
                console.log('✅ Media initialized successfully');
                setMediaReady(true);
            } else {
                // Both video and audio are disabled
                const blackStream = createBlackSilenceStream();
                localStreamRef.current = blackStream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = blackStream;
                }
                setMediaReady(true);
            }
        } catch (error) {
            console.error('❌ Error accessing media devices:', error);
            // Fallback to black silence
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
            
            // Replace tracks in peer connections instead of stopping stream
            if (localStreamRef.current) {
                replaceTracksInPeerConnections(stream);
            }
            
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            
            console.log("🖥️ Screen share started");
            
            // Handle screen share end
            stream.getTracks().forEach(track => {
                track.onended = async () => {
                    console.log('🖥️ Screen share ended');
                    setScreen(false);
                    await initializeMedia(); // Switch back to camera
                };
            });
        } catch (error) {
            console.log('❌ Screen share error:', error);
            setScreen(false);
        }
    };

    // Improved track replacement for screen sharing
    const replaceTracksInPeerConnections = (newStream) => {
        Object.values(connections.current).forEach(pc => {
            const senders = pc.getSenders();
            
            // Replace video track
            const videoTrack = newStream.getVideoTracks()[0];
            if (videoTrack) {
                const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(videoTrack).catch(console.log);
                } else {
                    // Add track if no sender exists
                    pc.addTrack(videoTrack, newStream);
                }
            }
            
            // Replace audio track if available
            const audioTrack = newStream.getAudioTracks()[0];
            if (audioTrack) {
                const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
                if (audioSender) {
                    audioSender.replaceTrack(audioTrack).catch(console.log);
                } else {
                    // Add track if no sender exists
                    pc.addTrack(audioTrack, newStream);
                }
            }
        });
    };

    // Update peer connections when initializing media
    const updatePeerConnectionTracks = (stream) => {
        Object.values(connections.current).forEach(pc => {
            const senders = pc.getSenders();
            
            // Check if we need to add tracks (for new connections)
            if (senders.length === 0) {
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });
            } else {
                // Update existing tracks
                const videoTrack = stream.getVideoTracks()[0];
                const audioTrack = stream.getAudioTracks()[0];
                
                senders.forEach(sender => {
                    if (sender.track) {
                        if (sender.track.kind === 'video' && videoTrack) {
                            sender.replaceTrack(videoTrack).catch(console.log);
                        } else if (sender.track.kind === 'audio' && audioTrack) {
                            sender.replaceTrack(audioTrack).catch(console.log);
                        }
                    }
                });
            }
        });
    };

    // WebRTC Functions with ICE Candidate Buffering
    const createPeerConnection = useCallback((peerId) => {
        console.log(`🔗 Creating peer connection for: ${peerId}`);
        const pc = new RTCPeerConnection(peerConfigConnections);
        
        // 🚨 CRITICAL: Initialize ICE candidate buffer for this peer
        initializeIceCandidateBuffer(peerId);
        
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log(`📤 Sending ICE candidate to ${peerId}`);
                socketRef.current.emit('signal', peerId, JSON.stringify({ 'ice': event.candidate }));
            }
        };

        pc.ontrack = (event) => {
            console.log('🎬 Track received from peer:', peerId, event.streams);
            if (event.streams && event.streams[0]) {
                updateUser(peerId, { 
                    stream: event.streams[0],
                    videoEnabled: true,
                    audioEnabled: true 
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`🔗 Connection state with ${peerId}:`, pc.connectionState);
            if (pc.connectionState === 'connected') {
                console.log(`✅ Successfully connected to ${peerId}`);
            } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                console.log(`❌ Connection failed with ${peerId}`);
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`🧊 ICE connection state with ${peerId}:`, pc.iceConnectionState);
        };

        // Add local stream tracks if available
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                try {
                    pc.addTrack(track, localStreamRef.current);
                    console.log(`✅ Added ${track.kind} track to peer ${peerId}`);
                } catch (error) {
                    console.log('❌ Error adding track to peer connection:', error);
                }
            });
        }

        connections.current[peerId] = pc;
        return pc;
    }, [initializeIceCandidateBuffer]);

    const createAndSendOffer = useCallback(async (peerId) => {
        const pc = connections.current[peerId];
        if (!pc) {
            console.error(`❌ No peer connection found for ${peerId}`);
            return;
        }

        try {
            console.log(`📨 Creating offer for ${peerId}`);
            
            // Wait for media to be ready
            if (!mediaReady) {
                console.log('⏳ Waiting for media to be ready...');
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            
            console.log(`📨 Offer created for ${peerId}, waiting for ICE gathering...`);
            
            // Wait for ICE gathering to complete with timeout
            await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    console.log('⏰ ICE gathering timeout, proceeding anyway');
                    resolve();
                }, 5000);
                
                if (pc.iceGatheringState === 'complete') {
                    clearTimeout(timeout);
                    resolve();
                } else {
                    pc.onicegatheringstatechange = () => {
                        if (pc.iceGatheringState === 'complete') {
                            clearTimeout(timeout);
                            resolve();
                        }
                    };
                }
            });
            
            socketRef.current.emit('signal', peerId, JSON.stringify({ 'sdp': pc.localDescription }));
            console.log(`✅ Offer sent to: ${peerId}`);
        } catch (error) {
            console.error('❌ Error creating/sending offer:', error);
        }
    }, [mediaReady]);

    const handleOffer = useCallback(async (fromId, offer) => {
        console.log(`📨 Received offer from: ${fromId}`);
        
        if (!connections.current[fromId]) {
            console.log(`🔗 Creating new peer connection for offer from ${fromId}`);
            connections.current[fromId] = createPeerConnection(fromId);
        }

        const pc = connections.current[fromId];

        try {
            console.log(`🔧 Setting remote description for ${fromId}`);
            await pc.setRemoteDescription(offer);
            console.log(`✅ Remote description set for ${fromId}`);
            
            // 🚨 CRITICAL: Flush any buffered ICE candidates
            await flushIceCandidateBuffer(fromId);
            
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': pc.localDescription }));
            console.log(`✅ Answer sent to: ${fromId}`);
        } catch (error) {
            console.error('❌ Error handling offer:', error);
        }
    }, [createPeerConnection, flushIceCandidateBuffer]);

    const handleAnswer = useCallback(async (fromId, answer) => {
        console.log(`📨 Received answer from: ${fromId}`);
        const pc = connections.current[fromId];
        if (!pc) {
            console.error(`❌ No peer connection found for answer from ${fromId}`);
            return;
        }

        try {
            console.log(`🔧 Setting remote description (answer) for ${fromId}`);
            await pc.setRemoteDescription(answer);
            console.log(`✅ Answer processed from: ${fromId}`);
            
            // 🚨 CRITICAL: Flush any buffered ICE candidates
            await flushIceCandidateBuffer(fromId);
        } catch (error) {
            console.error('❌ Error handling answer:', error);
        }
    }, [flushIceCandidateBuffer]);

    const handleIceCandidate = useCallback(async (fromId, candidate) => {
        console.log(`🧊 Received ICE candidate from: ${fromId}`);
        const pc = connections.current[fromId];
        if (!pc) {
            console.error(`❌ No peer connection found for ICE candidate from ${fromId}`);
            return;
        }

        try {
            // 🚨 CRITICAL: Check if remote description is set
            if (!pc.remoteDescription) {
                console.log(`📦 Remote description not set for ${fromId}, buffering ICE candidate`);
                addIceCandidateToBuffer(fromId, candidate);
                return;
            }
            
            // If remote description is set, process immediately
            console.log(`✅ Adding ICE candidate to ${fromId}`);
            await pc.addIceCandidate(candidate);
            console.log(`✅ ICE candidate added for ${fromId}`);
        } catch (error) {
            console.error('❌ Error handling ICE candidate:', error);
        }
    }, [addIceCandidateToBuffer]);

    const gotMessageFromServer = useCallback((fromId, message) => {
        if (fromId === socketIdRef.current) {
            console.log('🔄 Ignoring signal from self');
            return;
        }

        try {
            const signal = JSON.parse(message);
            console.log(`📡 Signal received from ${fromId}:`, signal.sdp ? 'SDP ' + signal.sdp.type : 'ICE candidate');

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
            console.error('❌ Error parsing signal message:', error);
        }
    }, [handleOffer, handleAnswer, handleIceCandidate]);

    // User Management
    const addUser = useCallback((userData) => {
        setUsers(prevUsers => {
            const exists = prevUsers.find(u => u.id === userData.id);
            if (exists) {
                console.log('👤 User already exists:', userData.name);
                return prevUsers;
            }
            
            const newUser = { 
                ...userData, 
                isSpeaking: false,
                videoEnabled: true,
                audioEnabled: true,
                joinedAt: Date.now()
            };
            
            console.log('✅ Adding user:', newUser.name);
            return [...prevUsers, newUser];
        });
    }, []);

    const removeUser = useCallback((userId) => {
        console.log('🗑️ Removing user:', userId);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        cleanupPeerResources(userId);
    }, [cleanupPeerResources]);

    const updateUser = useCallback((userId, updates) => {
        setUsers(prevUsers => 
            prevUsers.map(user => 
                user.id === userId ? { ...user, ...updates } : user
            )
        );
    }, []);

    // Track control functions
    const handleVideo = useCallback(async () => {
        const newVideoState = !video;
        console.log('🎥 Toggling video:', newVideoState);
        setVideo(newVideoState);
        
        if (localStreamRef.current) {
            const videoTracks = localStreamRef.current.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = newVideoState;
            });
            
            // Update all peer connections with new track state
            Object.values(connections.current).forEach(pc => {
                const senders = pc.getSenders();
                senders.forEach(sender => {
                    if (sender.track && sender.track.kind === 'video') {
                        sender.track.enabled = newVideoState;
                    }
                });
            });

            // Update local video display
            if (localVideoRef.current) {
                if (!newVideoState && videoTracks.length > 0) {
                    // Show black screen when video is off but keep stream
                    const blackStream = createBlackSilenceStream();
                    localVideoRef.current.srcObject = blackStream;
                } else if (newVideoState) {
                    // Restore original stream
                    localVideoRef.current.srcObject = localStreamRef.current;
                }
            }
        }
    }, [video]);

    const handleAudio = useCallback(() => {
        const newAudioState = !audio;
        console.log('🎤 Toggling audio:', newAudioState);
        setAudio(newAudioState);
        
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = newAudioState;
            });

            // Update all peer connections
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
            // Stop screen share and return to camera
            setScreen(false);
            await initializeMedia();
        } else {
            // Start screen share
            await getDisplayMedia();
        }
    }, [screen]);

    // Socket connection and messaging
    const connectToSocketServer = useCallback(() => {
        console.log('🔌 Connecting to socket server...');
        socketRef.current = io.connect(server_url, { 
            secure: false,
            transports: ['websocket', 'polling']
        });
        
        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {
            console.log('✅ Connected to socket server with ID:', socketRef.current.id);
            socketRef.current.emit('join-call', window.location.href);
            socketIdRef.current = socketRef.current.id;

            // Add local user
            addUser({
                id: socketIdRef.current,
                name: username,
                isYou: true,
                stream: localStreamRef.current,
                videoEnabled: video,
                audioEnabled: audio
            });

            socketRef.current.on('chat-message', addMessage);

            socketRef.current.on('user-left', (id) => {
                console.log('👋 User left:', id);
                removeUser(id);
            });

            socketRef.current.on('user-joined', (id, clients) => {
                console.log('👋 User joined:', id, 'All clients:', clients);
                clients.forEach(clientId => {
                    if (clientId === socketIdRef.current) return;

                    addUser({
                        id: clientId,
                        name: `User${clientId.slice(-4)}`,
                        isYou: false
                    });

                    if (!connections.current[clientId]) {
                        connections.current[clientId] = createPeerConnection(clientId);
                        // Wait a bit for connection to establish before sending offer
                        setTimeout(() => {
                            createAndSendOffer(clientId);
                        }, 1000);
                    }
                });
            });

            socketRef.current.on('existing-users', (existingUsers) => {
                console.log('👥 Existing users:', existingUsers);
                existingUsers.forEach(clientId => {
                    if (clientId === socketIdRef.current) return;

                    addUser({
                        id: clientId,
                        name: `User${clientId.slice(-4)}`,
                        isYou: false
                    });

                    if (!connections.current[clientId]) {
                        connections.current[clientId] = createPeerConnection(clientId);
                        setTimeout(() => {
                            createAndSendOffer(clientId);
                        }, 500);
                    }
                });
            });
        });

        socketRef.current.on('disconnect', () => {
            console.log('🔌 Disconnected from socket server');
        });

        socketRef.current.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });
    }, [username, addUser, removeUser, gotMessageFromServer, createAndSendOffer, createPeerConnection, video, audio]);

    const handleEndCall = useCallback(() => {
        console.log('📞 Ending call...');
        try {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }
        } catch (e) { 
            console.log('Error stopping tracks:', e);
        }
        
        // Clean up all peer resources
        Object.keys(connections.current).forEach(peerId => {
            cleanupPeerResources(peerId);
        });
        
        // Clear ICE candidate buffers
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
            setAskForUsername(false);
            // Initialize media first, then connect to socket
            initializeMedia().then(() => {
                connectToSocketServer();
            });
            setMessages([]);
        }
    }, [username, connectToSocketServer]);

    // Effects
    useEffect(() => {
        console.log("🎬 Initializing Video Meet");
        getPermissions();
        
        return () => {
            console.log("🧹 Cleaning up Video Meet");
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