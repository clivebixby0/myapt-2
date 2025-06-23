import "./navbar.scss";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlinedIcon from "@mui/icons-material/FullscreenExitOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import { DarkModeContext } from "../../context/darkModeContext";
import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { dispatch } = useContext(DarkModeContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate();
  const profileRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
      <div className="navbar">
        <div className="wrapper">
          <div className="search">
            <input type="text" placeholder="Search..." />
            <SearchOutlinedIcon />
          </div>
          <div className="items">
            <div className="item">
              <LanguageOutlinedIcon className="icon" />
              English
            </div>
            <div className="item">
              <DarkModeOutlinedIcon
                  className="icon"
                  onClick={() => dispatch({ type: "TOGGLE" })}
              />
            </div>
            <div className="item">
              <FullscreenExitOutlinedIcon className="icon" />
            </div>

            <div
                className="item"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMessages(false);
                  setShowProfileMenu(false);
                }}
                style={{ position: "relative" }}
            >
              <NotificationsNoneOutlinedIcon className="icon" />
              <div className="counter">1</div>
              {showNotifications && (
                  <div className="notifications-popup">
                    <p><strong>Notifications</strong></p>
                    <div className="notification">New login detected</div>
                    <div className="notification">New message received</div>
                    <div className="notification">System update available</div>
                  </div>
              )}
            </div>

            <div
                className="item"
                onClick={() => {
                  setShowMessages(!showMessages);
                  setShowNotifications(false);
                  setShowProfileMenu(false);
                }}
                style={{ position: "relative" }}
            >
              <ChatBubbleOutlineOutlinedIcon className="icon" />
              <div className="counter">2</div>
              {showMessages && (
                  <div className="notifications-popup">
                    <p><strong>Messages</strong></p>
                    <div className="notification"><b>John Doe: </b>I'd like to inquire regarding the</div>
                    <div className="notification"><b>Jane Smith: </b>Is the wifi provided?</div>
                    <div className="notification"><b>Mike Johnson: </b>Are pets available?</div>
                  </div>
              )}
            </div>

            <div className="item">
              <ListOutlinedIcon className="icon" />
            </div>

            {/* Profile Avatar and Dropdown */}
            <div className="item" ref={profileRef} style={{ position: "relative" }}>
              <img
                  src="https://images.pexels.com/photos/941693/pexels-photo-941693.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
                  alt=""
                  className="avatar"
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowMessages(false);
                    setShowNotifications(false);
                  }}
                  style={{ cursor: "pointer" }}
              />
              {showProfileMenu && (
                  <div className="profile-dropdown">
                    <div className="dropdown-item" onClick={() => navigate("/profile")}>
                      Edit Profile
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Navbar;
