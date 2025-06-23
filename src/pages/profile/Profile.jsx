import "./profile.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useAuth } from "../../context/AuthContext";
import { Box, Typography, TextField, Button, Avatar } from "@mui/material";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile">
      <Sidebar />
      <div className="profileContainer">
        <Navbar />
        <div className="profileContent">
          <Typography variant="h4" sx={{ mb: 4 }}>Profile</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 100, height: 100 }} />
              <Button variant="contained" component="label">
                Upload Photo
                <input hidden accept="image/*" type="file" />
              </Button>
            </Box>
            <TextField
              label="Name"
              defaultValue={user?.name}
              fullWidth
            />
            <TextField
              label="Email"
              defaultValue={user?.email}
              fullWidth
              disabled
            />
            <TextField
              label="Role"
              defaultValue={user?.role}
              fullWidth
              disabled
            />
            <Button variant="contained" color="primary">
              Save Changes
            </Button>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Profile; 