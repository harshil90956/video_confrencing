import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Typography,
    TextField,
    Button,
    Box
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import styles from '../../style/LobbyDialog.module.css';

const LobbyDialog = ({ username, setUsername, connect }) => {
    return (
        <Dialog open={true} maxWidth="xs" fullWidth className={styles.lobbyDialog}>
            <Box className={styles.lobbyContainer}>
                <DialogTitle className={styles.lobbyTitle}>
                    <Typography variant="h5" component="h1" align="center" fontWeight="600">
                        Join Meeting
                    </Typography>
                </DialogTitle>
                
                <DialogContent className={styles.lobbyContent}>
                    <Box display="flex" justifyContent="center" mb={3}>
                        <Avatar className={styles.userAvatar}>
                            <PersonIcon />
                        </Avatar>
                    </Box>
                    
                    <TextField 
                        fullWidth
                        label="Your name" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)}
                        variant="outlined"
                        className={styles.nameInput}
                        onKeyPress={(e) => e.key === 'Enter' && connect()}
                        autoFocus
                        placeholder="Enter your name"
                    />
                </DialogContent>
                
                <DialogActions className={styles.lobbyActions}>
                    <Button 
                        variant="contained" 
                        onClick={connect}
                        className={styles.joinButton}
                        size="large"
                        disabled={!username.trim()}
                        fullWidth
                    >
                        Join Meeting
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default LobbyDialog;