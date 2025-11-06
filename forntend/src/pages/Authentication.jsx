import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
    Snackbar, 
    Alert, 
    Typography, 
    Container,
    InputAdornment,
    IconButton,
    CircularProgress
} from '@mui/material';
import { 
    Visibility, 
    VisibilityOff, 
    Person, 
    PersonOutline
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext.jsx';

// Create a custom theme with beautiful colors
const customTheme = createTheme({
    palette: {
        primary: {
            main: '#6366f1',
            light: '#818cf8',
            dark: '#4338ca',
        },
        secondary: {
            main: '#ec4899',
            light: '#f472b6',
            dark: '#db2777',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            fontSize: '2rem',
            '@media (max-width: 1200px)': {
                fontSize: '1.75rem',
            },
            '@media (max-width: 900px)': {
                fontSize: '1.5rem',
            },
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            '@media (max-width: 1200px)': {
                fontSize: '1.1rem',
            },
        },
        body1: {
            '@media (max-width: 1200px)': {
                fontSize: '0.9rem',
            },
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                    transition: 'all 0.3s ease',
                    '@media (max-width: 1200px)': {
                        fontSize: '0.85rem',
                        padding: '8px 16px',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        '&:hover fieldset': {
                            borderColor: '#6366f1',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                        },
                        '@media (max-width: 1200px)': {
                            fontSize: '0.9rem',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        '@media (max-width: 1200px)': {
                            fontSize: '0.9rem',
                        },
                    },
                },
            },
        },
        MuiContainer: {
            styleOverrides: {
                root: {
                    '@media (max-width: 1200px)': {
                        paddingLeft: '16px',
                        paddingRight: '16px',
                    },
                },
            },
        },
    },
});

export default function Authentication() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const handleAuth = async () => {
        setIsLoading(true);
        try {
            let result;
            if (formState === 0) {
                result = await handleLogin(username, password);
                setMessage("Login successful!");
                setError('');
                setOpen(true);
            } else {
                result = await handleRegister(name, username, password);
                setUsername('');
                setPassword('');
                setName('');
                setMessage(result.message || 'Registered successfully!');
                setOpen(true);
                setError('');
                setFormState(0);
            }
        } catch (err) {
            console.error('Error:', err); 
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred!';
            setError(errorMessage);
            setOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const switchToSignUp = () => {
        setFormState(1);
        setError('');
    };

    const switchToSignIn = () => {
        setFormState(0);
        setError('');
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleAuth();
        }
    };

    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline />
            <Grid container sx={{ height: '100vh', minHeight: 600 }}>
                {/* Left Side - Beautiful Gradient Background */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: { xs: 3, md: 4 },
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                        }
                    }}
                >
                    {/* Content */}
                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 2,
                            color: 'white',
                            textAlign: 'center',
                            maxWidth: 500,
                            px: 3,
                        }}
                    >
                        <LockOutlinedIcon 
                            sx={{ 
                                fontSize: { xs: 60, md: 80 }, 
                                mb: { xs: 2, md: 3 },
                                color: 'white'
                            }} 
                        />
                        <Typography 
                            variant="h3" 
                            component="h1" 
                            gutterBottom
                            sx={{ 
                                fontWeight: 'bold',
                                mb: { xs: 2, md: 3 },
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' }
                            }}
                        >
                            Welcome to BeamTalk
                        </Typography>
                        <Typography 
                            variant="h5"
                            sx={{
                                mb: { xs: 2, md: 3 },
                                opacity: 0.9,
                                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                                fontSize: { xs: '1.1rem', md: '1.25rem', lg: '1.5rem' }
                            }}
                        >
                            {formState === 0 
                                ? 'Sign in to start video calling with crystal clear quality.' 
                                : 'Join BeamTalk and experience seamless video conferencing.'
                            }
                        </Typography>
                        <Typography 
                            variant="body1"
                            sx={{
                                opacity: 0.8,
                                fontStyle: 'italic',
                                maxWidth: 400,
                                mx: 'auto',
                                fontSize: { xs: '0.9rem', md: '1rem' }
                            }}
                        >
                            "Connect, collaborate, and communicate effortlessly"
                        </Typography>
                    </Box>
                </Grid>

                {/* Right Side - Login Form */}
                <Grid 
                    item 
                    xs={12} 
                    md={6}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        backgroundColor: 'background.paper',
                        overflow: 'auto',
                        py: { xs: 3, md: 4 },
                    }}
                >
                    <Container 
                        maxWidth="sm" 
                        sx={{ 
                            py: { 
                                xs: 2, 
                                md: 4, 
                                lg: 6 
                            },
                            px: { 
                                xs: 3, 
                                sm: 4, 
                                md: 6 
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            {/* Avatar - Show on all screens */}
                            <Avatar
                                sx={{
                                    width: { xs: 60, md: 70 },
                                    height: { xs: 60, md: 70 },
                                    bgcolor: 'primary.main',
                                    mb: 3,
                                }}
                            >
                                <LockOutlinedIcon />
                            </Avatar>

                            {/* Form Title */}
                            <Typography 
                                component="h1" 
                                variant="h4" 
                                gutterBottom
                                sx={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    fontWeight: 'bold',
                                    mb: 1,
                                    textAlign: 'center',
                                    fontSize: { 
                                        xs: '1.5rem', 
                                        md: '1.75rem', 
                                        lg: '2rem' 
                                    }
                                }}
                            >
                                {formState === 0 ? 'Welcome Back' : 'Create Account'}
                            </Typography>
                            
                            <Typography 
                                variant="body1" 
                                color="text.secondary"
                                sx={{ 
                                    mb: 4,
                                    textAlign: 'center',
                                    fontSize: { xs: '0.9rem', md: '1rem' }
                                }}
                            >
                                {formState === 0 
                                    ? 'Sign in to continue to your account' 
                                    : 'Join us today and get started'
                                }
                            </Typography>

                            {/* Toggle Buttons */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    width: '100%',
                                    maxWidth: 300,
                                    backgroundColor: 'grey.100',
                                    borderRadius: 2,
                                    p: 0.5,
                                    mb: 4,
                                }}
                            >
                                <Button
                                    fullWidth
                                    variant={formState === 0 ? 'contained' : 'text'}
                                    onClick={switchToSignIn}
                                    sx={{
                                        borderRadius: 1.5,
                                        py: 1.2,
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        minHeight: 40,
                                        color: formState === 0 ? 'white' : 'text.secondary',
                                        backgroundColor: formState === 0 ? 'primary.main' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: formState === 0 ? 'primary.dark' : 'grey.200',
                                        },
                                    }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    fullWidth
                                    variant={formState === 1 ? 'contained' : 'text'}
                                    onClick={switchToSignUp}
                                    sx={{
                                        borderRadius: 1.5,
                                        py: 1.2,
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        minHeight: 40,
                                        color: formState === 1 ? 'white' : 'text.secondary',
                                        backgroundColor: formState === 1 ? 'primary.main' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: formState === 1 ? 'primary.dark' : 'grey.200',
                                        },
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </Box>

                            {/* Form */}
                            <Box sx={{ 
                                width: '100%', 
                                maxWidth: 400 
                            }}>
                                {formState === 1 && (
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        label="Full Name"
                                        value={name}
                                        autoFocus={formState === 1}
                                        onChange={(e) => setName(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Person 
                                                        fontSize="small" 
                                                        color="primary" 
                                                    />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ 
                                            mb: 2,
                                        }}
                                        placeholder="Enter your full name"
                                    />
                                )}

                                {/* Username Field */}
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Username"
                                    value={username}
                                    autoFocus={formState === 0}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonOutline 
                                                    fontSize="small" 
                                                    color="primary" 
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        mb: 2,
                                    }}
                                    placeholder="Enter your username"
                                    helperText={formState === 1 ? "Choose a unique username" : ""}
                                />

                                {/* Password Field */}
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlinedIcon 
                                                    fontSize="small" 
                                                    color="primary" 
                                                />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={togglePasswordVisibility}
                                                    edge="end"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        mb: 3,
                                    }}
                                    placeholder="Enter your password"
                                    helperText={formState === 1 ? "Use a strong password" : ""}
                                />

                                {/* Error Message */}
                                {error && (
                                    <Alert 
                                        severity="error" 
                                        sx={{ 
                                            mb: 2,
                                            borderRadius: 2,
                                        }}
                                    >
                                        {error}
                                    </Alert>
                                )}

                                {/* Submit Button */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleAuth}
                                    disabled={isLoading}
                                    sx={{
                                        mt: 2,
                                        mb: 2,
                                        py: 1.5,
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5659e3 0%, #d63f87 100%)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                                        },
                                    }}
                                >
                                    {isLoading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        formState === 0 ? 'Sign In' : 'Create Account'
                                    )}
                                </Button>

                                {/* Switch Form Text */}
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    align="center"
                                    sx={{ mt: 3 }}
                                >
                                    {formState === 0 
                                        ? "Don't have an account? " 
                                        : "Already have an account? "
                                    }
                                    <Button
                                        variant="text"
                                        onClick={formState === 0 ? switchToSignUp : switchToSignIn}
                                        sx={{
                                            color: 'primary.main',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            fontSize: '0.875rem',
                                            p: 0,
                                            ml: 0.5,
                                            minWidth: 'auto',
                                            '&:hover': {
                                                backgroundColor: 'transparent',
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        {formState === 0 ? 'Sign up' : 'Sign in'}
                                    </Button>
                                </Typography>
                            </Box>
                        </Box>
                    </Container>
                </Grid>
            </Grid>

            {/* Snackbar for notifications */}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setOpen(false)} 
                    severity={error ? 'error' : 'success'}
                    sx={{ width: '100%' }}
                >
                    {error || message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}