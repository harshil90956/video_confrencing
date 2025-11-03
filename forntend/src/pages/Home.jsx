import React, { useState, useEffect } from 'react'
import withAuth from '../utils/Auth.jsx'
import { useNavigate } from 'react-router-dom';
import '../style/Home.css'
import { 
  Button, 
  IconButton, 
  TextField, 
  Tooltip, 
  Fab,
  Grid,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Videocam as VideocamIcon,
  ExitToApp as ExitToAppIcon,
  History as HistoryIcon,
  Groups as GroupsIcon,
  Security as SecurityIcon,
  HighQuality as HighQualityIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

function Home() {
    let navigate = useNavigate();
    const { addToUserHistory, user } = useContext(AuthContext);
    const [meetingCode, setMeetingCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFloatingVisible, setIsFloatingVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFloatingVisible(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;
        
        setIsLoading(true);
        try {
            await addToUserHistory(meetingCode);
            navigate(`/${meetingCode}`);
        } catch (error) {
            console.error('Error joining call:', error);
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleJoinVideoCall();
        }
    };

    const features = [
        { icon: <HighQualityIcon />, text: "HD Quality", color: "#FF6B6B" },
        { icon: <SecurityIcon />, text: "Secure", color: "#4ECDC4" },
        { icon: <GroupsIcon />, text: "Multi-user", color: "#45B7D1" },
        { icon: <ScheduleIcon />, text: "24/7 Available", color: "#FFA07A" }
    ];

    return (
        <>
            {/* Animated Background */}
            <div className="animated-background">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
                <div className="floating-shape shape-4"></div>
            </div>

            {/* Navigation Bar - Fixed with Material UI AppBar */}
            <AppBar position="fixed" className="navbar-home" elevation={0}>
                <Toolbar>
                    <Grid container alignItems="center" justifyContent="space-between">
                        {/* Left Side - Brand */}
                        <Grid item>
                            <Box className="nav-brand">
                                <Box className="logo-wrapper">
                                    <VideocamIcon className="logo-icon" />
                                    <Typography variant="h6" className="logo-text">
                                        BeamTalk
                                    </Typography>
                                </Box>
                                {user && (
                                    <Typography variant="body2" className="welcome-text">
                                        Welcome, {user.name || user.email}!
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                        
                        {/* Right Side - Actions */}
                        <Grid item>
                            <Box className="nav-actions">
                                <Tooltip title="Meeting History" arrow>
                                    <IconButton 
                                        className="history-btn"
                                        onClick={() => navigate('/history')}
                                        size="large"
                                    >
                                        <HistoryIcon />
                                    </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Logout" arrow>
                                    <Button 
                                        className="logout-btn"
                                        onClick={() => { 
                                            localStorage.removeItem("token"); 
                                            navigate('/auth'); 
                                        }}
                                        startIcon={<ExitToAppIcon />}
                                        variant="outlined"
                                        size="small"
                                    >
                                        Logout
                                    </Button>
                                </Tooltip>
                            </Box>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="xl" className="home-container">
                <Grid container className="home-content" spacing={4} alignItems="center" justifyContent="center">
                    {/* Left Panel - Content */}
                    <Grid item xs={12} lg={7} xl={6}>
                        <Box className="left-panel">
                            <Box className="main-content">
                                <Box className="welcome-badge">
                                    <span>🎉 Premium Video Calls</span>
                                </Box>
                                
                                <Typography variant="h2" className="main-heading">
                                    Connect with 
                                    <span className="gradient-text"> Crystal Clear</span> 
                                    Quality
                                </Typography>
                                
                                <Typography variant="h6" className="subtitle">
                                    Experience seamless video conferencing with BeamTalk. 
                                    Join meetings instantly or start your own with just one click.
                                </Typography>

                                {/* Join Meeting Card */}
                                <Box className="join-card">
                                    <Typography variant="h5" className="card-title">
                                        <VideocamIcon className="title-icon" />
                                        Join a Meeting
                                    </Typography>
                                    
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} sm={8} md={7}>
                                            <TextField
                                                fullWidth
                                                value={meetingCode}
                                                onChange={(e) => setMeetingCode(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                label="Enter Meeting Code"
                                                variant="outlined"
                                                className="meeting-input"
                                                placeholder="e.g., ABC123"
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4} md={5}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={handleJoinVideoCall}
                                                disabled={!meetingCode.trim() || isLoading}
                                                className="join-btn"
                                                size="large"
                                            >
                                                {isLoading ? (
                                                    <Box className="loading-spinner"></Box>
                                                ) : (
                                                    <>
                                                        Join Now
                                                        <span className="btn-arrow">→</span>
                                                    </>
                                                )}
                                            </Button>
                                        </Grid>
                                    </Grid>

                                    <Box className="quick-tips">
                                        <Typography variant="body2">
                                            💡 <strong>Tip:</strong> Enter the code shared by your meeting host
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Features Grid */}
                                <Grid container spacing={2} className="features-grid">
                                    {features.map((feature, index) => (
                                        <Grid item xs={6} sm={3} key={index}>
                                            <Box 
                                                className="feature-card"
                                                style={{ '--accent-color': feature.color }}
                                            >
                                                <Box className="feature-icon">
                                                    {feature.icon}
                                                </Box>
                                                <Typography variant="body2" className="feature-text">
                                                    {feature.text}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Right Panel - Visual */}
                    <Grid item xs={12} lg={5} xl={6}>
                        <Box className="right-panel">
                            <Box className="hero-visual">
                                <Box className="phone-mockup">
                                    <img 
                                        src='/logo3.png' 
                                        alt='BeamTalk Video Call Interface'
                                        className='hero-image'
                                    />
                                    
                                    {/* Floating Elements */}
                                    <Box className={`floating-msg ${isFloatingVisible ? 'visible' : ''}`}>
                                        <span>👋 Hello!</span>
                                    </Box>
                                    <Box className={`floating-msg msg-2 ${isFloatingVisible ? 'visible' : ''}`}>
                                        <span>💬 Connected</span>
                                    </Box>
                                    <Box className={`floating-msg msg-3 ${isFloatingVisible ? 'visible' : ''}`}>
                                        <span>⭐ Premium</span>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                {/* Quick Actions Fab */}
                <Tooltip title="Quick Actions" arrow>
                    <Fab className="quick-actions-fab" onClick={() => navigate('/history')}>
                        <RestoreIcon />
                    </Fab>
                </Tooltip>
            </Container>
        </>
    )
}

export default withAuth(Home);