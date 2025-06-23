import "./payments.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Datatable from "../../components/datatable/Datatable";

const Payments = () => {
  return (
    <div className="payments">
      <Sidebar />
      <div className="paymentsContainer">
        <Navbar />
        <Datatable />
      </div>
    </div>
  );
};

export default Payments; 