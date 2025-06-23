import "./settings.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { Box, Typography, Switch, FormControlLabel } from "@mui/material";

const Settings = () => {
  return (
    <div className="settings">
      <Sidebar />
      <div className="settingsContainer">
        <Navbar />
        <div className="settingsContent">
          <Typography variant="h4" sx={{ mb: 4 }}>Settings</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={<Switch />}
              label="Email Notifications"
            />
            <FormControlLabel
              control={<Switch />}
              label="SMS Notifications"
            />
            <FormControlLabel
              control={<Switch />}
              label="Maintenance Alerts"
            />
            <FormControlLabel
              control={<Switch />}
              label="Payment Reminders"
            />
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Settings; 