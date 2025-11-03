import React from 'react';
import {
    Badge,
    IconButton,
    useMediaQuery,
    useTheme,
    Tooltip
} from '@mui/material';
import {
    Videocam as VideocamIcon,
    VideocamOff as VideocamOffIcon,
    CallEnd as CallEndIcon,
    Mic as MicIcon,
    MicOff as MicOffIcon,
    ScreenShare as ScreenShareIcon,
    StopScreenShare as StopScreenShareIcon,
    Chat as ChatIcon
} from '@mui/icons-material';
import styles from '../../style/ControlBar.module.css';

const ControlBar = ({
    video,
    audio,
    screen,
    screenAvailable,
    newMessages,
    onVideoToggle,
    onAudioToggle,
    onScreenToggle,
    onChatToggle,
    onEndCall
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Custom click handler to prevent all default behaviors
    const handleClick = (callback) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        callback();
    };

    return (
        <div 
            className={`${styles.controlBar} ${isMobile ? styles.controlBarMobile : ''}`}
            style={{
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                userSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent'
            }}
            onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onSelect={(e) => e.preventDefault()}
        >
            {/* Video Toggle */}
            <Tooltip title={video ? "Turn off camera" : "Turn on camera"} arrow>
                <IconButton 
                    onClick={handleClick(onVideoToggle)}
                    className={`${styles.controlButton} ${!video ? styles.controlButtonOff : ''}`}
                    size={isMobile ? "small" : "medium"}
                    disableRipple
                    sx={{
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none', 
                        msUserSelect: 'none',
                        userSelect: 'none',
                        WebkitTouchCallout: 'none',
                        WebkitTapHighlightColor: 'transparent'
                    }}
                >
                    <div className={styles.iconWrapper}>
                        {video ? (
                            <VideocamIcon className={styles.icon} />
                        ) : (
                            <>
                                <VideocamOffIcon className={styles.icon} />
                                <div className={styles.crossLine}></div>
                            </>
                        )}
                    </div>
                </IconButton>
            </Tooltip>

            {/* Audio Toggle */}
            <Tooltip title={audio ? "Mute microphone" : "Unmute microphone"} arrow>
                <IconButton 
                    onClick={handleClick(onAudioToggle)}
                    className={`${styles.controlButton} ${!audio ? styles.controlButtonOff : ''}`}
                    size={isMobile ? "small" : "medium"}
                    disableRipple
                    sx={{
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        userSelect: 'none',
                        WebkitTouchCallout: 'none',
                        WebkitTapHighlightColor: 'transparent'
                    }}
                >
                    <div className={styles.iconWrapper}>
                        {audio ? (
                            <MicIcon className={styles.icon} />
                        ) : (
                            <>
                                <MicOffIcon className={styles.icon} />
                                <div className={styles.crossLine}></div>
                            </>
                        )}
                    </div>
                </IconButton>
            </Tooltip>

            {/* Screen Share */}
            {screenAvailable && (
                <Tooltip title={screen ? "Stop sharing" : "Share screen"} arrow>
                    <IconButton 
                        onClick={handleClick(onScreenToggle)}
                        className={`${styles.controlButton} ${screen ? styles.controlButtonActive : ''}`}
                        size={isMobile ? "small" : "medium"}
                        disableRipple
                        sx={{
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            userSelect: 'none',
                            WebkitTouchCallout: 'none',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                    </IconButton>
                </Tooltip>
            )}

            {/* Chat */}
            <Tooltip title="Chat" arrow>
                <IconButton 
                    onClick={handleClick(onChatToggle)}
                    className={styles.controlButton}
                    size={isMobile ? "small" : "medium"}
                    disableRipple
                    sx={{
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        userSelect: 'none',
                        WebkitTouchCallout: 'none',
                        WebkitTapHighlightColor: 'transparent'
                    }}
                >
                    <Badge badgeContent={newMessages} color="error" max={99}>
                        <ChatIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            {/* End Call */}
            <Tooltip title="Leave call" arrow>
                <IconButton 
                    onClick={handleClick(onEndCall)}
                    className={styles.endCallButton}
                    size={isMobile ? "small" : "medium"}
                    disableRipple
                    sx={{
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        userSelect: 'none',
                        WebkitTouchCallout: 'none',
                        WebkitTapHighlightColor: 'transparent'
                    }}
                >
                    <CallEndIcon />
                </IconButton>
            </Tooltip>
        </div>
    );
};

export default ControlBar;