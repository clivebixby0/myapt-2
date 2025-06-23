import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import StoreIcon from "@mui/icons-material/Store";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SettingsSystemDaydreamOutlinedIcon from "@mui/icons-material/SettingsSystemDaydreamOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { NavLink, useNavigate } from "react-router-dom";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext } from "react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="top">
        <NavLink to="/dashboard" style={{ textDecoration: "none" }}>
          <span className="logo">{user?.role === 'admin' ? 'Apartment Admin' : 'Apartment Tenant'}</span>
        </NavLink>
      </div>
      <hr />
      <div className="center">
        <ul>
          <p className="title">MAIN</p>
          <NavLink to="/dashboard" style={{ textDecoration: "none" }}
                   className={({ isActive }) => isActive ? "link active" : "link"}
          >
            <li>
              <DashboardIcon className="icon" />
              <span>Dashboard</span>
            </li>
          </NavLink>
          <p className="title">LISTS</p>
          {user?.role === 'admin' && (
            <NavLink to="/users" style={{ textDecoration: "none" }}
                     className={({ isActive }) => isActive ? "link active" : "link"}
            >
              <li>
                <PersonOutlineIcon className="icon" />
                <span>Users</span>
              </li>
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/apartments" style={{ textDecoration: "none" }}
                     className={({ isActive }) => isActive ? "link active" : "link"}
            >
              <li>
                <StoreIcon className="icon" />
                <span>Apartments</span>
              </li>
            </NavLink>
          )}
          <NavLink to="/payments" style={{ textDecoration: "none" }}
                   className={({ isActive }) => isActive ? "link active" : "link"}
          >
            <li>
              <CreditCardIcon className="icon" />
              <span>Payments</span>
            </li>
          </NavLink>
          <NavLink to="/maintenance" style={{ textDecoration: "none" }}
                   className={({ isActive }) => isActive ? "link active" : "link"}
          >
            <li>
              <LocalShippingIcon className="icon" />
              <span>Maintenance</span>
            </li>
          </NavLink>
          <p className="title">USEFUL</p>
          {user?.role === 'admin' && (
            <NavLink to="/stats" style={{ textDecoration: "none" }}
                     className={({ isActive }) => isActive ? "link active" : "link"}
            >
              <li>
                <InsertChartIcon className="icon" />
                <span>Stats</span>
              </li>
            </NavLink>
          )}
          <NavLink to="/notifications" style={{ textDecoration: "none" }}
                   className={({ isActive }) => isActive ? "link active" : "link"}
          >

            <li>
              <NotificationsNoneIcon className="icon" />
              <span>Notifications</span>
            </li>
          </NavLink>
          <p className="title">SERVICE</p>
          {user?.role === 'admin' && (
            <>
              <NavLink to="/system" style={{ textDecoration: "none" }}
                       className={({ isActive }) => isActive ? "link active" : "link"}
              >
                <li>
                  <SettingsSystemDaydreamOutlinedIcon className="icon" />
                  <span>System Health</span>
                </li>
              </NavLink>
              <NavLink to="/logs" style={{ textDecoration: "none" }}
                       className={({ isActive }) => isActive ? "link active" : "link"}
              >
                <li>
                  <PsychologyOutlinedIcon className="icon" />
                  <span>Logs</span>
                </li>
              </NavLink>
            </>
          )}
          <NavLink to="/settings" style={{ textDecoration: "none" }}
                   className={({ isActive }) => isActive ? "link active" : "link"}
          >
            <li>
              <SettingsApplicationsIcon className="icon" />
              <span>Settings</span>
            </li>
          </NavLink>
          <p className="title">USER</p>
          <NavLink to="/profile" style={{ textDecoration: "none" }}
                   className={({ isActive }) => isActive ? "link active" : "link"}
          >
            <li>
              <AccountCircleOutlinedIcon className="icon" />
              <span>Profile</span>
            </li>
          </NavLink>
          <li onClick={handleLogout}>
            <ExitToAppIcon className="icon" />
            <span>Logout</span>
          </li>
        </ul>
      </div>
      <div className="bottom">
        <div
          className="colorOption"
          onClick={() => dispatch({ type: "LIGHT" })}
        ></div>
        <div
          className="colorOption"
          onClick={() => dispatch({ type: "DARK" })}
        ></div>
      </div>
    </div>
  );
};

export default Sidebar;
