import React from 'react';
import {
    IconButton,
    TextField,
    Button,
    Avatar,
    Typography
} from '@mui/material';
import { Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';
import styles from '../../style/Chat.module.css';

const ChatSidebar = ({
    messages,
    message,
    participants,
    username,
    onClose,
    onMessageChange,
    onSendMessage,
    onKeyPress,
    chatContainerRef
}) => {
    return (
        <div className={styles.chatSidebar}>
            {/* Header */}
            <div className={styles.chatHeader}>
                <Typography variant="h6">Meeting Chat</Typography>
                <IconButton 
                    size="small" 
                    onClick={onClose}
                    className={styles.closeChat}
                >
                    <CloseIcon />
                </IconButton>
            </div>
            
            {/* Participants Section */}
            <div className={styles.participantsSection}>
                <Typography variant="subtitle2" className={styles.sectionTitle}>
                    Participants ({participants.length})
                </Typography>
                <div className={styles.participantsList}>
                    {participants.map(participant => (
                        <div key={participant.id} className={styles.participantItem}>
                            <Avatar className={styles.participantAvatar}>
                                {participant.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography className={styles.participantName}>
                                {participant.name} {participant.isYou && '(You)'}
                            </Typography>
                        </div>
                    ))}
                </div>
            </div>

            {/* Messages Area */}
            <div ref={chatContainerRef} className={styles.chatMessages}>
                {messages.length > 0 ? messages.map((item, index) => (
                    <div 
                        key={index} 
                        className={`${styles.message} ${
                            item.sender === username ? styles.ownMessage : styles.otherMessage
                        }`}
                    >
                        <div className={styles.messageHeader}>
                            <Typography className={styles.messageSender}>
                                {item.sender === username ? 'You' : item.sender}
                            </Typography>
                            <Typography className={styles.messageTime}>{item.time}</Typography>
                        </div>
                        <div className={styles.messageContent}>
                            <Typography variant="body2" style={{ color: 'inherit' }}>
                                {item.data}
                            </Typography>
                        </div>
                    </div>
                )) : (
                    <div className={styles.noMessages}>
                        <Typography variant="body2">
                            No messages yet. Start the conversation!
                        </Typography>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className={styles.chatInputContainer}>
                <TextField
                    fullWidth
                    size="small"
                    value={message}
                    onChange={(e) => onMessageChange(e.target.value)}
                    onKeyPress={onKeyPress}
                    placeholder="Type a message..."
                    variant="outlined"
                    className={styles.chatInput}
                    multiline
                    maxRows={3}
                />
                <Button 
                    variant="contained" 
                    onClick={onSendMessage}
                    disabled={!message.trim()}
                    className={styles.sendButton}
                    endIcon={<SendIcon />}
                >
                    Send
                </Button>
            </div>
        </div>
    );
};

export default ChatSidebar;