import "./register.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
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
  Business as BusinessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Flag as FlagIcon
} from "@mui/icons-material";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    fullName: "",
    phone: "",
    address: "",
    country: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.username || !formData.fullName) {
      setError("Please fill in all required fields.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    if (!formData.email.includes('@')) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log('🔧 Creating admin user...', { email: formData.email });
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      console.log('✅ User created in Firebase Auth:', user.uid);
      
      // Update user profile
      await updateProfile(user, {
        displayName: formData.fullName
      });
      
      console.log('✅ User profile updated');
      
      // Prepare user data for Firestore
      const firestoreData = {
        uid: user.uid,
        email: user.email,
        username: formData.username,
        fullName: formData.fullName,
        phone: formData.phone || '',
        address: formData.address || '',
        country: formData.country || '',
        role: 'admin', // Set as admin
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('📝 User data for Firestore:', firestoreData);
      
      // Create document with UID as document ID
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, firestoreData);
      
      console.log('✅ User document created in Firestore with UID as document ID:', user.uid);
      
      setSuccess("Admin user created successfully! You can now login with your credentials.");
      
      // Clear form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        username: "",
        fullName: "",
        phone: "",
        address: "",
        country: ""
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Admin user creation error:', error);
      
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
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
            <BusinessIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
            <Typography variant="h3" component="h1" gutterBottom sx={{ 
              fontWeight: 'bold', 
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Admin Registration
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Create a new admin account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fill in the details below to create an admin user
            </Typography>
          </Box>

          {/* Registration Form */}
          <Paper 
            elevation={8} 
            sx={{ 
              p: 4, 
              width: '100%', 
              maxWidth: 500,
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
                label="Email Address *"
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

              {/* Username Field */}
              <TextField
                fullWidth
                label="Username *"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={loading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              {/* Full Name Field */}
              <TextField
                fullWidth
                label="Full Name *"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                disabled={loading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              {/* Phone Field */}
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              {/* Address Field */}
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={loading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              {/* Country Field */}
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                disabled={loading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FlagIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              {/* Password Field */}
              <TextField
                fullWidth
                label="Password *"
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

              {/* Confirm Password Field */}
              <TextField
                fullWidth
                label="Confirm Password *"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
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
                        onClick={handleToggleConfirmPassword}
                        edge="end"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />

              {/* Register Button */}
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
                  "Create Admin Account"
                )}
              </Button>
            </Box>

            {/* Back to Login */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{ color: '#667eea' }}
              >
                Back to Login
              </Button>
            </Box>
          </Paper>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © MyAPT 2025
            </Typography>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default Register; 