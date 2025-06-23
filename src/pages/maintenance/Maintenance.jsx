import "./maintenance.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Datatable from "../../components/datatable/Datatable";

const Maintenance = () => {
  return (
    <div className="maintenance">
      <Sidebar />
      <div className="maintenanceContainer">
        <Navbar />
        <Datatable />
      </div>
    </div>
  );
};

export default Maintenance; 