import "./logs.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Datatable from "../../components/datatable/Datatable";

const Logs = () => {
  return (
    <div className="logs">
      <Sidebar />
      <div className="logsContainer">
        <Navbar />
        <Datatable />
      </div>
    </div>
  );
};

export default Logs; 