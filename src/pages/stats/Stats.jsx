import "./stats.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";

const Stats = () => {
  return (
    <div className="stats">
      <Sidebar />
      <div className="statsContainer">
        <Navbar />
        <div className="charts">
          <Chart title="Monthly Revenue" aspect={2 / 1} />
          <Chart title="Occupancy Rate" aspect={2 / 1} />
        </div>
      </div>
    </div>
  );
};

export default Stats; 