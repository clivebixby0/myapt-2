import "./featured.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import { useAuth } from "../../context/AuthContext";

const Featured = () => {
  const { user } = useAuth();

  // Tenant-specific content
  if (user?.role === 'tenant') {
    return (
      <div className="featured">
        <div className="top">
          <h1 className="title">Rent Payment Status</h1>
          <MoreVertIcon fontSize="small" />
        </div>
        <div className="bottom">
          <div className="featuredChart">
            <CircularProgressbar 
              value={85} 
              text={"85%"} 
              strokeWidth={5}
              styles={{
                path: {
                  stroke: `var(--success-color)`,
                },
                text: {
                  fill: `var(--text-primary)`,
                  fontSize: '16px',
                  fontWeight: '600',
                },
                trail: {
                  stroke: `var(--border-color)`,
                },
              }}
            />
          </div>
          <p className="title">Rent paid this month</p>
          <p className="amount">$1,200</p>
          <p className="desc">
            Your rent payment is up to date. Next payment due in 15 days.
          </p>
          <div className="summary">
            <div className="item">
              <div className="itemTitle">Monthly Rent</div>
              <div className="itemResult positive">
                <KeyboardArrowUpOutlinedIcon fontSize="small"/>
                <div className="resultAmount">$1,200</div>
              </div>
            </div>
            <div className="item">
              <div className="itemTitle">Utilities</div>
              <div className="itemResult positive">
                <KeyboardArrowUpOutlinedIcon fontSize="small"/>
                <div className="resultAmount">$150</div>
              </div>
            </div>
            <div className="item">
              <div className="itemTitle">Total Due</div>
              <div className="itemResult negative">
                <KeyboardArrowDownIcon fontSize="small"/>
                <div className="resultAmount">$1,350</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin content (existing)
  return (
    <div className="featured">
      <div className="top">
        <h1 className="title">Total Revenue</h1>
        <MoreVertIcon fontSize="small" />
      </div>
      <div className="bottom">
        <div className="featuredChart">
          <CircularProgressbar 
            value={70} 
            text={"70%"} 
            strokeWidth={5}
            styles={{
              path: {
                stroke: `var(--primary-color)`,
              },
              text: {
                fill: `var(--text-primary)`,
                fontSize: '16px',
                fontWeight: '600',
              },
              trail: {
                stroke: `var(--border-color)`,
              },
            }}
          />
        </div>
        <p className="title">Total sales made today</p>
        <p className="amount">$420</p>
        <p className="desc">
          Previous transactions processing. Last payments may not be included.
        </p>
        <div className="summary">
          <div className="item">
            <div className="itemTitle">Target</div>
            <div className="itemResult negative">
              <KeyboardArrowDownIcon fontSize="small"/>
              <div className="resultAmount">$12.4k</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Week</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small"/>
              <div className="resultAmount">$12.4k</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Month</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small"/>
              <div className="resultAmount">$12.4k</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
