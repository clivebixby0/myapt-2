import "./notifications.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Datatable from "../../components/datatable/Datatable";

const Notifications = () => {
  return (
    <div className="notifications">
      <Sidebar />
      <div className="notificationsContainer">
        <Navbar />
        <Datatable />
      </div>
    </div>
  );
};

export default Notifications; 