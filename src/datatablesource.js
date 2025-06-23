export const userColumns = [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "user",
    headerName: "User",
    width: 230,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img 
            className="cellImg" 
            src={params.row.profileImage || "https://images.pexels.com/photos/1820770/pexels-photo-1820770.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"} 
            alt="avatar" 
          />
          {params.row.fullName || params.row.username}
        </div>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 230,
  },
  {
    field: "role",
    headerName: "Role",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithRole ${params.row.role}`}>
          {params.row.role}
        </div>
      );
    },
  },
  {
    field: "apartment",
    headerName: "Apartment",
    width: 150,
    renderCell: (params) => {
      // Try to use the joined apartment object first
      if (params.row.apartment) {
        return (
          <div className="cellWithApartment">
            {params.row.apartment.apartmentNumber}
          </div>
        );
      }
      // Fallback: if apartmentId exists, look up from global apartments list
      if (params.row.apartmentId && window._allApartments) {
        const apt = window._allApartments.find(a => a.id === params.row.apartmentId);
        if (apt) {
          return (
            <div className="cellWithApartment">
              {apt.apartmentNumber}
            </div>
          );
        }
      }
      return (
        <div className="cellWithApartment no-apartment">
          Not Assigned
        </div>
      );
    },
  },
  {
    field: "status",
    headerName: "Status",
    width: 160,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.status}`}>
          {params.row.status}
        </div>
      );
    },
  },
];

// Remove static data since we're using Firebase
// export const userRows = [...];
// export const paymentRows = [...];
// export const maintenanceRows = [...];
// export const notificationRows = [...];
// export const logRows = [...];
