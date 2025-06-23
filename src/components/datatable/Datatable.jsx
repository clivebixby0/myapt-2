import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns } from "../../datatablesource";
import { Link, useLocation } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar } from "@mui/material";
import { useState, useEffect } from "react";
import ViewModal from "../ViewModal";
import { Typography } from "@mui/material";

const Datatable = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { 
    users, 
    apartments, 
    payments, 
    maintenance, 
    loading, 
    error,
    deleteUser, 
    deleteApartment, 
    deletePayment, 
    deleteMaintenance 
  } = useData();

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [componentError, setComponentError] = useState(null);

  // Reset component error when location changes
  useEffect(() => {
    setComponentError(null);
  }, [location.pathname]);

  // Validate that required functions are available
  useEffect(() => {
    if (!deleteUser || !deleteApartment || !deletePayment || !deleteMaintenance) {
      console.error('=== MISSING DELETE FUNCTIONS ===');
      console.error('deleteUser:', !!deleteUser);
      console.error('deleteApartment:', !!deleteApartment);
      console.error('deletePayment:', !!deletePayment);
      console.error('deleteMaintenance:', !!deleteMaintenance);
      setComponentError('Delete functions are not available. Please refresh the page.');
    }
  }, [deleteUser, deleteApartment, deletePayment, deleteMaintenance]);

  // Define getTitle function outside try-catch so it can be used in error UI
  const getTitle = () => {
    switch (location.pathname) {
      case "/users":
        return "Users";
      case "/apartments":
        return "Apartments";
      case "/payments":
        return user?.role === "tenant" ? "My Payments" : "Payments";
      case "/maintenance":
        return user?.role === "tenant" ? "My Maintenance Requests" : "Maintenance Requests";
      case "/notifications":
        return "Notifications";
      case "/logs":
        return "System Logs";
      default:
        return "Data";
    }
  };

  // If there's a component error, show error UI
  if (componentError) {
    return (
      <div className="datatable">
        <div className="datatableTitle">
          {getTitle()}
        </div>
        <Alert severity="error" className="error-alert">
          <Typography variant="h6">Something went wrong</Typography>
          <Typography variant="body2">{componentError}</Typography>
          <Button 
            variant="contained" 
            onClick={() => setComponentError(null)}
            style={{ marginTop: '10px' }}
          >
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  // Wrap all the main logic in try-catch to prevent white screens
  try {

  // Static data for notifications and logs (since we removed them from datatablesource)
  const notificationRows = [
    {
      id: 1,
      title: "Maintenance Update",
      message: "Your maintenance request has been scheduled",
      date: "2024-03-15",
      status: "Unread",
    },
    {
      id: 2,
      title: "Payment Reminder",
      message: "Rent payment is due in 3 days",
      date: "2024-03-14",
      status: "Read",
    },
    {
      id: 3,
      title: "System Update",
      message: "New features have been added to the dashboard",
      date: "2024-03-13",
      status: "Unread",
    },
  ];

  const logRows = [
    {
      id: 1,
      action: "Login",
      user: "admin@apartment.com",
      date: "2024-03-15 10:30",
      details: "Successful login from IP 192.168.1.1",
    },
    {
      id: 2,
      action: "Update",
      user: "admin@apartment.com",
      date: "2024-03-15 11:45",
      details: "Updated tenant information for Apt 101",
    },
    {
      id: 3,
      action: "Delete",
      user: "admin@apartment.com",
      date: "2024-03-15 14:20",
      details: "Deleted maintenance request #123",
    },
  ];

  // Check if user can perform specific actions based on role and current page
  const canAdd = () => {
    if (location.pathname === "/payments") {
      return user?.role === "admin" || user?.role === "tenant";
    }
    if (location.pathname === "/maintenance") {
      return user?.role === "admin" || user?.role === "tenant";
    }
    return user?.role === "admin";
  };

  const canDelete = (item) => {
    if (location.pathname === "/payments") {
      // Only admins can delete payments
      return user?.role === "admin";
    }
    if (location.pathname === "/maintenance") {
      // Tenants can delete their own maintenance requests, admins can delete any
      if (user?.role === "admin") {
        return true;
      }
      if (user?.role === "tenant") {
        const userId = user.id || user.uid;
        const requestTenantId = item?.tenantId || item?.uid;
        return requestTenantId === userId;
      }
      return false;
    }
    // For other pages, only admins can delete
    return user?.role === "admin";
  };

  const canView = () => {
    // All authenticated users can view
    return !!user;
  };

  const getData = () => {
    switch (location.pathname) {
      case "/users":
        return users;
      case "/apartments":
        return apartments;
      case "/payments":
        // For tenants, only show their own payments
        if (user?.role === "tenant") {
          // Use both uid and id for compatibility
          const userId = user.id || user.uid;
          return payments.filter(payment => {
            const paymentTenantId = payment.tenantId || payment.uid;
            return paymentTenantId === userId;
          });
        }
        return payments;
      case "/maintenance":
        // For tenants, only show their own maintenance requests
        if (user?.role === "tenant") {
          // Use both uid and id for compatibility
          const userId = user.id || user.uid;
          return maintenance.filter(request => {
            const requestTenantId = request.tenantId || request.uid;
            return requestTenantId === userId;
          });
        }
        return maintenance;
      case "/notifications":
        return notificationRows;
      case "/logs":
        return logRows;
      default:
        return users;
    }
  };

  const getColumns = () => {
    switch (location.pathname) {
      case "/users":
        return userColumns;
      case "/apartments":
        return [
          { field: "id", headerName: "ID", width: 70 },
          { field: "apartmentNumber", headerName: "Apartment", width: 150 },
          { field: "building", headerName: "Building", width: 150 },
          { field: "floor", headerName: "Floor", width: 100 },
          { field: "bedrooms", headerName: "Bedrooms", width: 120 },
          { field: "bathrooms", headerName: "Bathrooms", width: 120 },
          { field: "squareFeet", headerName: "Sq Ft", width: 100 },
          { field: "monthlyRent", headerName: "Rent", width: 120 },
          { field: "status", headerName: "Status", width: 150 },
        ];
      case "/payments":
        return [
          { field: "id", headerName: "ID", width: 70 },
          { field: "tenantName", headerName: "Tenant", width: 200 },
          { field: "amount", headerName: "Amount", width: 130 },
          { field: "paymentDate", headerName: "Date", width: 200 },
          { field: "status", headerName: "Status", width: 130 },
        ];
      case "/maintenance":
        return [
          { field: "id", headerName: "ID", width: 70 },
          { field: "apartmentNumber", headerName: "Apartment", width: 200 },
          { field: "issue", headerName: "Issue", width: 200 },
          { field: "requestDate", headerName: "Date", width: 200 },
          { field: "status", headerName: "Status", width: 130 },
        ];
      case "/notifications":
        return [
          { field: "id", headerName: "ID", width: 70 },
          { field: "title", headerName: "Title", width: 200 },
          { field: "message", headerName: "Message", width: 300 },
          { field: "date", headerName: "Date", width: 200 },
          { field: "status", headerName: "Status", width: 130 },
        ];
      case "/logs":
        return [
          { field: "id", headerName: "ID", width: 70 },
          { field: "action", headerName: "Action", width: 200 },
          { field: "user", headerName: "User", width: 200 },
          { field: "date", headerName: "Date", width: 200 },
          { field: "details", headerName: "Details", width: 300 },
        ];
      default:
        return userColumns;
    }
  };

  const shouldShowAddNew = () => {
    // Don't show "Add New" for logs, notifications, and other read-only sections
    if (["/logs", "/notifications"].includes(location.pathname)) {
      return false;
    }
    // Hide Add New for tenants on payments page
    if (location.pathname === "/payments" && user?.role === "tenant") {
      return false;
    }
    // Check role-based permissions
    return canAdd();
  };

  const handleDelete = async (id) => {
    console.log('Delete requested for ID:', id);
    console.log('Current pathname:', location.pathname);
    
    // Validate that we have a valid ID
    if (!id) {
      setSnackbar({ 
        open: true, 
        message: 'Unable to delete item: Invalid ID', 
        severity: 'error' 
      });
      return;
    }
    
    // Validate that data arrays are available
    if (!Array.isArray(users) || !Array.isArray(apartments) || !Array.isArray(payments) || !Array.isArray(maintenance)) {
      console.error('Data arrays are not properly initialized');
      setSnackbar({ 
        open: true, 
        message: 'Unable to delete item: Data not loaded', 
        severity: 'error' 
      });
      return;
    }
    
    // Find the item to delete for confirmation dialog
    let item;
    switch (location.pathname) {
      case "/users":
        item = users.find(user => user.id === id);
        break;
      case "/apartments":
        item = apartments.find(apt => apt.id === id);
        break;
      case "/payments":
        item = payments.find(payment => payment.id === id);
        break;
      case "/maintenance":
        item = maintenance.find(maint => maint.id === id);
        break;
      default:
        break;
    }
    
    // Check if item was found
    if (!item) {
      setSnackbar({ 
        open: true, 
        message: 'Unable to delete item: Item not found', 
        severity: 'error' 
      });
      return;
    }
    
    setItemToDelete({ id, item });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) {
      console.error('No item to delete');
      return;
    }
    
    setDeleteLoading(true);
    try {
      console.log('=== DELETE DEBUG ===');
      console.log('Confirming delete for:', itemToDelete);
      console.log('Current pathname:', location.pathname);
      console.log('Item to delete:', JSON.stringify(itemToDelete, null, 2));
      
      let result;
      let deleteFunction;
      
      switch (location.pathname) {
        case "/users":
          console.log('Deleting user with ID:', itemToDelete.id);
          deleteFunction = deleteUser;
          break;
        case "/apartments":
          console.log('Deleting apartment with ID:', itemToDelete.id);
          deleteFunction = deleteApartment;
          break;
        case "/payments":
          console.log('Deleting payment with ID:', itemToDelete.id);
          deleteFunction = deletePayment;
          break;
        case "/maintenance":
          console.log('Deleting maintenance with ID:', itemToDelete.id);
          deleteFunction = deleteMaintenance;
          break;
        default:
          console.error('Unknown pathname for deletion:', location.pathname);
          throw new Error(`Unknown pathname for deletion: ${location.pathname}`);
      }
      
      // Validate delete function exists
      if (!deleteFunction) {
        throw new Error('Delete function not found');
      }
      
      // Validate delete function is callable
      if (typeof deleteFunction !== 'function') {
        throw new Error('Delete function is not callable');
      }
      
      // Call the delete function with error handling
      console.log('Calling delete function...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Delete operation timed out')), 30000); // 30 seconds
      });
      
      const deletePromise = deleteFunction(itemToDelete.id);
      
      result = await Promise.race([deletePromise, timeoutPromise]);
      console.log('Delete result:', result);
      
      if (result && result.success) {
        console.log('✅ Delete operation successful');
        setSnackbar({ 
          open: true, 
          message: 'Item deleted successfully!', 
          severity: 'success' 
        });
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } else {
        const errorMessage = result?.error?.message || result?.error || 'Failed to delete item';
        console.error('❌ Delete failed:', errorMessage);
        console.error('Full result:', result);
        setSnackbar({ 
          open: true, 
          message: `Delete failed: ${errorMessage}`, 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('=== DELETE ERROR ===');
      console.error('Delete error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      
      // Provide more specific error messages
      let errorMessage = 'An error occurred while deleting the item';
      if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. You may not have the right to delete this item.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('not-found')) {
        errorMessage = 'Item not found. It may have been already deleted.';
      } else if (error.message.includes('unavailable')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      console.log('=== DELETE COMPLETE ===');
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleView = (row) => {
    console.log('=== VIEW DEBUG ===');
    console.log('View requested for row:', row);
    console.log('Current pathname:', location.pathname);
    console.log('Row data structure:', JSON.stringify(row, null, 2));
    console.log('Row keys:', Object.keys(row || {}));
    console.log('Row ID:', row?.id);
    console.log('Row UID:', row?.uid);
    
    // Validate that we have the necessary data
    if (!row) {
      console.error('❌ Row is null or undefined');
      setSnackbar({ 
        open: true, 
        message: 'Unable to view item: No data provided', 
        severity: 'error' 
      });
      return;
    }
    
    if (!row.id && !row.uid) {
      console.error('❌ Row has no ID or UID');
      setSnackbar({ 
        open: true, 
        message: 'Unable to view item: Invalid data structure', 
        severity: 'error' 
      });
      return;
    }
    
    console.log('✅ Data validation passed');
    console.log('Opening view modal for item:', row);
    console.log('Item type:', location.pathname.slice(1));
    
    setSelectedItem(row);
    setSelectedType(location.pathname.slice(1)); // Remove leading slash
    setViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedItem(null);
    setSelectedType(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        // For tenants on /payments, show Pay button if not paid
        if (location.pathname === "/payments" && user?.role === "tenant") {
          if (params.row.status !== "Paid") {
            return (
              <div className="cellAction">
                <div
                  className="payButton"
                  style={{ cursor: 'pointer', color: '#1976d2', fontWeight: 600 }}
                  onClick={() => alert(`Pay for payment ID: ${params.row.id}`)}
                >
                  Pay
                </div>
              </div>
            );
          } else {
            return null;
          }
        }
        // Default actions
        return (
          <div className="cellAction">
            {canView() && (
              <div 
                className="viewButton"
                onClick={() => handleView(params.row)}
                style={{ cursor: 'pointer' }}
              >
                View
              </div>
            )}
            {canDelete(params.row) && (
              <div
                className="deleteButton"
                onClick={() => handleDelete(params.row.id)}
              >
                Delete
              </div>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="datatable">
        <div className="datatableTitle">
          {getTitle()}
          {shouldShowAddNew() && (
            <Link to={`${location.pathname}/new`} className="link">
              Add New
            </Link>
          )}
        </div>
        <div className="loading-container">
          <CircularProgress />
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="datatable">
        <div className="datatableTitle">
          {getTitle()}
          {shouldShowAddNew() && (
            <Link to={`${location.pathname}/new`} className="link">
              Add New
            </Link>
          )}
        </div>
        <Alert severity="error" className="error-alert">
          Error loading data: {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="datatable">
      <div className="datatableTitle">
        {getTitle()}
        {shouldShowAddNew() && (
          <Link to={`${location.pathname}/new`} className="link">
            Add New
          </Link>
        )}
      </div>
      <DataGrid
        className="datagrid"
        rows={getData()}
        columns={getColumns().concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        loading={loading}
      />
      
      <ViewModal
        open={viewModalOpen}
        onClose={handleCloseModal}
        data={selectedItem}
        type={selectedType}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this item?</p>
          {itemToDelete?.item && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <strong>Item to delete:</strong>
              {location.pathname === "/users" && (
                <div>
                  <p><strong>Name:</strong> {itemToDelete.item.fullName || itemToDelete.item.username || 'N/A'}</p>
                  <p><strong>Email:</strong> {itemToDelete.item.email || 'N/A'}</p>
                  <p><strong>Role:</strong> {itemToDelete.item.role || 'N/A'}</p>
                </div>
              )}
              {location.pathname === "/apartments" && (
                <div>
                  <p><strong>Apartment:</strong> {itemToDelete.item.apartmentNumber || 'N/A'}</p>
                  <p><strong>Building:</strong> {itemToDelete.item.building || 'N/A'}</p>
                </div>
              )}
              {location.pathname === "/payments" && (
                <div>
                  <p><strong>Tenant:</strong> {itemToDelete.item.tenantName || itemToDelete.item.tenant || 'N/A'}</p>
                  <p><strong>Amount:</strong> ₱{itemToDelete.item.amount != null ? itemToDelete.item.amount : 'N/A'}</p>
                  <p><strong>Date:</strong> {itemToDelete.item.paymentDate ? (typeof itemToDelete.item.paymentDate === 'object' && itemToDelete.item.paymentDate.seconds ? new Date(itemToDelete.item.paymentDate.seconds * 1000).toLocaleDateString() : itemToDelete.item.paymentDate) : 'N/A'}</p>
                </div>
              )}
              {location.pathname === "/maintenance" && (
                <div>
                  <p><strong>Apartment:</strong> {itemToDelete.item.apartmentNumber || 'N/A'}</p>
                  <p><strong>Issue:</strong> {itemToDelete.item.issue || 'N/A'}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary" disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            autoFocus
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
  } catch (error) {
    console.error('Datatable component error:', error);
    return (
      <div className="datatable">
        <div className="datatableTitle">Error</div>
        <Alert severity="error">
          <Typography variant="h6">Something went wrong</Typography>
          <Typography variant="body2">{error.message || 'An unexpected error occurred.'}</Typography>
        </Alert>
      </div>
    );
  }
};

export default Datatable;
