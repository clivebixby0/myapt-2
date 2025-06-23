import "./home.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Widget from "../../components/widget/Widget";
import Featured from "../../components/featured/Featured";
import Chart from "../../components/chart/Chart";
import Table from "../../components/table/Table";
import SampleDataManager from "../../components/SampleDataManager";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="widgets">
          <Widget type="user" />
          <Widget type="order" />
          <Widget type="earning" />
          <Widget type="balance" />
        </div>
        <div className="charts">
          <Featured />
          <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
        </div>
        <div className="listContainer">
          <div className="listTitle">
            {user?.role === 'tenant' ? 'Recent Transactions & Requests' : 'Latest Transactions'}
          </div>
          <Table />
        </div>
        
        {/* Sample Data Manager - Only show for admin users */}
        {user?.role === 'admin' && (
          <SampleDataManager />
        )}
      </div>
    </div>
  );
};

export default Home;
