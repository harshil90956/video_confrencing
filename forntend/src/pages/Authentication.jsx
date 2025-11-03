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
    Email
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
            const errorMessage = err.response?.data?.message || 'An error occurred!';
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

    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline />
            <Grid container sx={{ height: '100vh', minHeight: 600 }}>
                {/* Left Side - Background Image with Content - Optimized for Medium Screens */}
                <Grid
                    item
                    xs={false}
                    md={6}
                    lg={7}
                    sx={{
                        position: 'relative',
                        display: { 
                            xs: 'none', 
                            sm: 'none', 
                            md: 'flex',
                            lg: 'flex' 
                        },
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: { md: 3, lg: 4 },
                    }}
                >
                    {/* Background Image Container */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: 'url(https://images.unsplash.com/photo-1577495508048-b635879837f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            opacity: 0.9,
                        }}
                    />
                    
                    {/* Dark Overlay for better text readability */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        }}
                    />

                    {/* Content - Optimized for Medium Screens */}
                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 2,
                            color: 'white',
                            textAlign: 'center',
                            maxWidth: { md: 500, lg: 600 },
                            px: { md: 3, lg: 4 },
                        }}
                    >
                        <LockOutlinedIcon 
                            sx={{ 
                                fontSize: { md: 60, lg: 80 }, 
                                mb: { md: 2, lg: 3 },
                                color: 'white'
                            }} 
                        />
                        <Typography 
                            variant="h3" 
                            component="h1" 
                            gutterBottom
                            sx={{ 
                                fontWeight: 'bold',
                                mb: { md: 2, lg: 3 },
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                fontSize: { md: '1.75rem', lg: '2.25rem' }
                            }}
                        >
                            Welcome to Our Platform
                        </Typography>
                        <Typography 
                            variant="h5"
                            sx={{
                                mb: { md: 3, lg: 4 },
                                opacity: 0.9,
                                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                fontSize: { md: '1.1rem', lg: '1.25rem' }
                            }}
                        >
                            {formState === 0 
                                ? 'Sign in to access your personalized dashboard.' 
                                : 'Join our community and start your journey.'
                            }
                        </Typography>
                        <Typography 
                            variant="body1"
                            sx={{
                                opacity: 0.8,
                                fontStyle: 'italic',
                                maxWidth: { md: 400, lg: 500 },
                                mx: 'auto',
                                fontSize: { md: '0.9rem', lg: '1rem' }
                            }}
                        >
                            "Secure, reliable, and user-friendly authentication"
                        </Typography>
                    </Box>
                </Grid>

                {/* Right Side - Login Form - Optimized for Medium Screens */}
                <Grid 
                    item 
                    xs={12} 
                    md={6} 
                    lg={5}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        backgroundColor: 'background.paper',
                        overflow: 'auto',
                        py: { xs: 2, md: 3, lg: 4 },
                    }}
                >
                    <Container 
                        maxWidth="sm" 
                        sx={{ 
                            py: { 
                                xs: 3, 
                                md: 4, 
                                lg: 8 
                            },
                            px: { 
                                xs: 2, 
                                sm: 3, 
                                md: 4, 
                                lg: 6 
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
                            {/* Avatar - Show only on mobile and medium screens */}
                            <Avatar
                                sx={{
                                    width: { xs: 50, md: 60, lg: 70 },
                                    height: { xs: 50, md: 60, lg: 70 },
                                    bgcolor: 'primary.main',
                                    mb: { xs: 2, md: 3, lg: 3 },
                                    display: { lg: 'none' }
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
                                        md: '1.6rem', 
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
                                    mb: { xs: 3, md: 3, lg: 4 },
                                    textAlign: 'center',
                                    fontSize: { md: '0.9rem', lg: '1rem' }
                                }}
                            >
                                {formState === 0 
                                    ? 'Sign in to continue to your account' 
                                    : 'Join us today and get started'
                                }
                            </Typography>

                            {/* Toggle Buttons - Compact for Medium Screens */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    width: '100%',
                                    maxWidth: { xs: 280, md: 260, lg: 280 },
                                    backgroundColor: 'grey.100',
                                    borderRadius: 2,
                                    p: 0.5,
                                    mb: { xs: 3, md: 3, lg: 4 },
                                }}
                            >
                                <Button
                                    fullWidth
                                    variant={formState === 0 ? 'contained' : 'text'}
                                    onClick={switchToSignIn}
                                    sx={{
                                        borderRadius: 1.5,
                                        py: { xs: 1, md: 1, lg: 1.2 },
                                        fontSize: { xs: '0.8rem', md: '0.8rem', lg: '0.9rem' },
                                        fontWeight: 600,
                                        minHeight: { xs: 36, md: 38, lg: 40 },
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
                                        py: { xs: 1, md: 1, lg: 1.2 },
                                        fontSize: { xs: '0.8rem', md: '0.8rem', lg: '0.9rem' },
                                        fontWeight: 600,
                                        minHeight: { xs: 36, md: 38, lg: 40 },
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

                            {/* Form - Optimized for Medium Screens */}
                            <Box sx={{ 
                                width: '100%', 
                                maxWidth: { xs: 400, md: 380, lg: 400 } 
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
                                            '& .MuiInputBase-root': {
                                                height: { xs: 48, md: 46, lg: 56 }
                                            }
                                        }}
                                    />
                                )}

                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Email Address"
                                    value={username}
                                    autoFocus={formState === 0}
                                    onChange={(e) => setUsername(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email 
                                                    fontSize="small" 
                                                    color="primary" 
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        mb: 2,
                                        '& .MuiInputBase-root': {
                                            height: { xs: 48, md: 46, lg: 56 }
                                        }
                                    }}
                                />

                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                                        '& .MuiInputBase-root': {
                                            height: { xs: 48, md: 46, lg: 56 }
                                        }
                                    }}
                                />

                                {/* Error Message */}
                                {error && (
                                    <Alert 
                                        severity="error" 
                                        sx={{ 
                                            mb: 2,
                                            borderRadius: 2,
                                            py: { md: 0.5, lg: 1 },
                                            '& .MuiAlert-message': {
                                                fontSize: { md: '0.8rem', lg: '0.875rem' }
                                            }
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
                                        py: { xs: 1.25, md: 1.25, lg: 1.5 },
                                        fontSize: { xs: '0.9rem', md: '0.9rem', lg: '1rem' },
                                        fontWeight: 'bold',
                                        minHeight: { xs: 44, md: 42, lg: 48 },
                                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5659e3 0%, #d63f87 100%)',
                                            transform: { md: 'translateY(-1px)', lg: 'translateY(-2px)' },
                                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                        },
                                    }}
                                >
                                    {isLoading ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        formState === 0 ? 'Sign In' : 'Create Account'
                                    )}
                                </Button>

                                {/* Switch Form Text */}
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    align="center"
                                    sx={{ 
                                        mt: 3,
                                        fontSize: { md: '0.8rem', lg: '0.875rem' }
                                    }}
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
                                            fontSize: { md: '0.8rem', lg: '0.875rem' },
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