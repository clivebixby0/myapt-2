import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

const Widget = ({ type }) => {
  const { user } = useAuth();
  const { users, apartments, payments, maintenance } = useData();
  let data;
  let amount = 0;
  let diff = 0; // Placeholder, can be improved with historical data

  if (user?.role === 'tenant') {
    switch (type) {
      case "user":
        data = {
          title: "MY APARTMENT",
          isMoney: false,
          link: <Link to="/apartments" style={{ textDecoration: "none", color: "inherit" }}>View details</Link>,
          icon: (
            <HomeOutlinedIcon
              className="icon"
              style={{
                color: "var(--success-color)",
                backgroundColor: "rgba(5, 150, 105, 0.1)",
              }}
            />
          ),
        };
        // Show 1 if tenant has an apartment, 0 otherwise
        const myUser = users.find(u => u.id === user.id || u.uid === user.uid);
        amount = myUser && myUser.apartment ? 1 : 0;
        break;
      case "order":
        data = {
          title: "RENT DUE",
          isMoney: true,
          link: <Link to="/payments" style={{ textDecoration: "none", color: "inherit" }}>View payments</Link>,
          icon: (
            <ReceiptOutlinedIcon
              className="icon"
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                color: "var(--error-color)",
              }}
            />
          ),
        };
        // Sum of unpaid rent payments for this tenant
        amount = payments
          .filter(p => (p.tenantId === user.id || p.tenantId === user.uid) && ["Pending", "Overdue"].includes(p.status))
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        break;
      case "earning":
        data = {
          title: "MAINTENANCE",
          isMoney: false,
          link: <Link to="/maintenance" style={{ textDecoration: "none", color: "inherit" }}>View requests</Link>,
          icon: (
            <BuildOutlinedIcon
              className="icon"
              style={{ backgroundColor: "rgba(217, 119, 6, 0.1)", color: "var(--warning-color)" }}
            />
          ),
        };
        // Count of maintenance requests for this tenant
        amount = maintenance.filter(m => m.tenantId === user.id || m.tenantId === user.uid).length;
        break;
      case "balance":
        data = {
          title: "NOTIFICATIONS",
          isMoney: false,
          link: <Link to="/notifications" style={{ textDecoration: "none", color: "inherit" }}>View all</Link>,
          icon: (
            <NotificationsOutlinedIcon
              className="icon"
              style={{
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                color: "var(--primary-color)",
              }}
            />
          ),
        };
        // No notification data in context, fallback to 0
        amount = 0;
        break;
      default:
        break;
    }
  } else {
    // Admin widgets
    switch (type) {
      case "user":
        data = {
          title: "USERS",
          isMoney: false,
          link: <Link to="/users" style={{ textDecoration: "none", color: "inherit" }}>See all users</Link>,
          icon: (
            <PersonOutlinedIcon
              className="icon"
              style={{
                color: "var(--error-color)",
                backgroundColor: "rgba(220, 38, 38, 0.1)",
              }}
            />
          ),
        };
        amount = users.filter(u => u.role === 'tenant').length;
        break;
      case "order":
        data = {
          title: "ROOMS",
          isMoney: false,
          link: <Link to="/apartments" style={{ textDecoration: "none", color: "inherit" }}>View all apartments</Link>,
          icon: (
            <ShoppingCartOutlinedIcon
              className="icon"
              style={{
                backgroundColor: "rgba(217, 119, 6, 0.1)",
                color: "var(--warning-color)",
              }}
            />
          ),
        };
        amount = apartments.length;
        break;
      case "earning":
        data = {
          title: "EARNINGS",
          isMoney: true,
          link: <Link to="/stats" style={{ textDecoration: "none", color: "inherit" }}>View net earnings</Link>,
          icon: (
            <MonetizationOnOutlinedIcon
              className="icon"
              style={{ backgroundColor: "rgba(5, 150, 105, 0.1)", color: "var(--success-color)" }}
            />
          ),
        };
        // Sum of all paid payments
        amount = payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        break;
      case "balance":
        data = {
          title: "DUE PAYMENTS",
          isMoney: true,
          link: <Link to="/payments" style={{ textDecoration: "none", color: "inherit" }}>See details</Link>,
          icon: (
            <AccountBalanceWalletOutlinedIcon
              className="icon"
              style={{
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                color: "var(--primary-color)",
              }}
            />
          ),
        };
        // Sum of all due payments
        amount = payments.filter(p => ["Pending", "Overdue"].includes(p.status)).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        break;
      default:
        break;
    }
  }

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">
          {data.isMoney && "₱"} {amount}
        </span>
        <span className="link">{data.link}</span>
      </div>
      <div className="right">
        <div className="percentage positive">
          <KeyboardArrowUpIcon />
          {diff} %
        </div>
        {data.icon}
      </div>
    </div>
  );
};

export default Widget;
