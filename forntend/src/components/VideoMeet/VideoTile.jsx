import React, { useEffect, useRef } from 'react';
import styles from '../../style/VideoMeet.module.css';

const VideoTile = ({ user, isLocal, videoRefs }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (user.id && videoRef.current) {
            videoRefs.current.set(user.id, videoRef.current);
        }

        return () => {
            if (user.id) {
                videoRefs.current.delete(user.id);
            }
        };
    }, [user.id, videoRefs]);

    useEffect(() => {
        if (videoRef.current && user.stream) {
            if (videoRef.current.srcObject !== user.stream) {
                videoRef.current.srcObject = user.stream;
            }
            
            videoRef.current.muted = isLocal;
            
            videoRef.current.play().catch(error => {
                console.log('Auto-play failed:', error);
            });
        }
    }, [user.stream, user.id, isLocal]);

    // ✅ Get user display name
    const displayName = user.name || `User${user.id.slice(-4)}`;

    return (
        <div className={`${styles.videoTile} ${isLocal ? styles.localVideo : ''}`}>
            
            {/* Video Element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isLocal}
                className={styles.videoElement}
            />
            
            {/* ✅ OPTION 1: Modern Overlay (Recommended) */}
            <div className={styles.userInfoOverlay}>
                <div className={styles.userInfoContent}>
                    <span className={styles.userName}>
                        {displayName} {isLocal ? '(You)' : ''}
                    </span>
                    <div className={styles.statusIcons}>
                        {!user.videoEnabled && <span className={`${styles.icon} ${styles.videoOff}`}>📹</span>}
                        {!user.audioEnabled && <span className={`${styles.icon} ${styles.audioOff}`}>🎤</span>}
                    </div>
                </div>
            </div>

            {/* ✅ OPTION 2: Simple Style (Alternative) */}
            {/* <div className={styles.userInfoSimple}>
                {displayName} {isLocal ? '(You)' : ''}
            </div> */}

            {/* ✅ OPTION 3: Bottom Bar Style (Alternative) */}
            {/* <div className={styles.userInfoBottomBar}>
                <span className={styles.userName}>
                    {displayName} {isLocal ? '(You)' : ''}
                </span>
                <div className={styles.statusIcons}>
                    {!user.videoEnabled && <span>📹</span>}
                    {!user.audioEnabled && <span>🎤</span>}
                </div>
            </div> */}
            
            {/* No Video Placeholder */}
            {(!user.stream || user.stream.getVideoTracks().length === 0) && (
                <div className={styles.noVideoPlaceholder}>
                    <div className={styles.avatar}>
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className={styles.placeholderName}>
                        {displayName}
                    </span>
                </div>
            )}
        </div>
    );
};

export default VideoTile;