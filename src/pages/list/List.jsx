import "./list.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import Datatable from "../../components/datatable/Datatable"
import UsersDatatable from "../../components/datatable/UsersDatatable"
import { useLocation } from "react-router-dom"

const List = () => {
  const location = useLocation();
  
  // Check if we're on the users page
  const isUsersPage = location.pathname === "/users";
  
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        {isUsersPage ? <UsersDatatable /> : <Datatable/>}
      </div>
    </div>
  )
}

export default List