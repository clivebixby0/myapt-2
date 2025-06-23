import "./login.scss";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress,
  Container,
  InputAdornment,
  IconButton
} from "@mui/material";
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Business as BusinessIcon
} from "@mui/icons-material";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      default:
        return 'Login failed. Please check your credentials and try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log('🔍 Login: Starting login process...', { email: formData.email });
      
      const result = await login(formData.email, formData.password);
      console.log('🔍 Login: Login result:', result);
      
      if (result.success) {
        console.log('✅ Login: Successful, redirecting to dashboard...');
        setSuccess("Login successful! Redirecting to dashboard...");
        
        // Clear form
        setFormData({ email: "", password: "" });
        
        // Redirect after a short delay
        setTimeout(() => {
          console.log('🚀 Login: Executing redirect...');
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        console.error('❌ Login: Failed:', result.error);
        const errorMessage = getErrorMessage(result.error?.code);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('❌ Login: Error:', error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            py: 4
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <BusinessIcon sx={{ fontSize: 60, color: '#fff', mb: 2 }} />
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              fontWeight: 'bold', 
              color: 'white'
            }}>
              MyAPT
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.8)' }}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Sign in to your account to continue
            </Typography>
          </Box>

          {/* Login Form */}
          <Paper 
            elevation={8} 
            sx={{ 
              p: 4, 
              width: '100%', 
              maxWidth: 400,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Email Field */}
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              {/* Password Field */}
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              {/* Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  py: 1.5,
                  mb: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Contact your administrator for account access
              </Typography>
              <Button
                variant="text"
                onClick={() => navigate('/register')}
                sx={{ color: '#667eea', fontSize: '14px' }}
              >
                Create Admin Account
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </div>
  );
};

export default Login;