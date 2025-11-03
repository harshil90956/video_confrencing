import React, { useEffect, useRef } from 'react';
import { VideocamOff as VideocamOffIcon } from '@mui/icons-material';
import styles from '../../style/VideoMeet.module.css';

const VideoTile = React.memo(({ user, isLocal, videoRefs }) => {
    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current && user.stream) {
            try {
                videoRef.current.srcObject = user.stream;
                
                // Play the video
                videoRef.current.play().catch(error => {
                    console.log('Video play error:', error);
                });
            } catch (error) {
                console.log('Error setting video stream:', error);
            }
        }
        
        // Store ref for external access
        if (videoRefs && user.id) {
            videoRefs.current.set(user.id, videoRef);
        }

        return () => {
            if (user.id && videoRefs) {
                videoRefs.current.delete(user.id);
            }
        };
    }, [user.stream, user.id, videoRefs]);

    return (
        <div className={`${styles.videoTile} ${isLocal ? styles.localVideo : ''}`}>
            <video 
                ref={videoRef}
                autoPlay 
                muted={isLocal}
                playsInline
                className={styles.videoElement}
            />
            <div className={styles.videoOverlay}>
                <span className={styles.userName}>
                    {user.name} {isLocal && '(You)'}
                    {user.isSpeaking && ' 🎤'}
                </span>
                {!user.videoEnabled && (
                    <div className={styles.videoOffIndicator}>
                        <VideocamOffIcon />
                    </div>
                )}
            </div>
        </div>
    );
});

VideoTile.displayName = 'VideoTile';

export default VideoTile;