import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns } from "../../datatablesource";
import { Link, useLocation } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Tabs, Tab, Box, Typography, IconButton } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { useState, useEffect } from "react";
import ViewModal from "../ViewModal";

const UsersDatatable = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { 
    users, 
    loading, 
    error,
    deleteUser,
    refreshData,
    apartments
  } = useData();

  // Debug logging
  console.log('🔍 UsersDatatable Debug:');
  console.log('Current user:', user);
  console.log('Users from context:', users);
  console.log('Users length:', users?.length);
  console.log('Loading:', loading);
  console.log('Error:', error);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [componentError, setComponentError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Reset component error when location changes
  useEffect(() => {
    setComponentError(null);
  }, [location.pathname]);

  // Validate that required functions are available
  useEffect(() => {
    if (!deleteUser) {
      console.error('=== MISSING DELETE FUNCTIONS ===');
      console.error('deleteUser:', !!deleteUser);
      setComponentError('Delete functions are not available. Please refresh the page.');
    }
  }, [deleteUser]);

  // Keep global apartments list up to date for apartment column fallback
  useEffect(() => {
    window._allApartments = apartments || [];
  }, [apartments]);

  // Define getTitle function outside try-catch so it can be used in error UI
  const getTitle = () => {
    return "Users Management";
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

  // Check if user can perform specific actions based on role
  const canAdd = () => {
    return user?.role === "admin";
  };

  const canDelete = (item) => {
    // Only admins can delete
    return user?.role === "admin";
  };

  const canView = () => {
    // All authenticated users can view
    return !!user;
  };

  // Separate users by role
  const adminUsers = users.filter(user => user.role === 'admin');
  const tenantUsers = users.filter(user => user.role === 'tenant');

  // Debug filtering
  console.log('🔍 User filtering debug:');
  console.log('All users:', users);
  console.log('Admin users:', adminUsers);
  console.log('Tenant users:', tenantUsers);
  console.log('Admin users length:', adminUsers.length);
  console.log('Tenant users length:', tenantUsers.length);

  // Test if users array is valid
  if (!Array.isArray(users)) {
    console.error('❌ Users is not an array:', typeof users, users);
  } else {
    console.log('✅ Users is a valid array with length:', users.length);
  }

  const getColumns = () => {
    return userColumns;
  };

  const shouldShowAddNew = () => {
    return canAdd();
  };

  const handleDelete = async (id) => {
    console.log('Delete requested for ID:', id);
    
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
    if (!Array.isArray(users)) {
      console.error('Users array is not properly initialized');
      setSnackbar({ 
        open: true, 
        message: 'Unable to delete item: Data not loaded', 
        severity: 'error' 
      });
      return;
    }
    
    // Find the item to delete for confirmation dialog
    const item = users.find(user => user.id === id);
    
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
      console.log('Item to delete:', JSON.stringify(itemToDelete, null, 2));
      
      // Validate delete function exists
      if (!deleteUser) {
        throw new Error('Delete function not found');
      }
      
      // Validate delete function is callable
      if (typeof deleteUser !== 'function') {
        throw new Error('Delete function is not callable');
      }
      
      // Call the delete function with error handling
      console.log('Calling delete function...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Delete operation timed out')), 30000); // 30 seconds
      });
      
      const deletePromise = deleteUser(itemToDelete.id);
      
      const result = await Promise.race([deletePromise, timeoutPromise]);
      console.log('Delete result:', result);
      
      if (result && result.success) {
        console.log('✅ Delete operation successful');
        setSnackbar({ 
          open: true, 
          message: 'User deleted successfully!', 
          severity: 'success' 
        });
      } else {
        const errorMessage = result?.error?.message || result?.error || 'Failed to delete user';
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
      let errorMessage = 'An error occurred while deleting the user';
      if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. You may not have the right to delete this user.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('not-found')) {
        errorMessage = 'User not found. It may have been already deleted.';
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
    
    setSelectedItem(row);
    setSelectedType('user');
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

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered from UsersDatatable');
    try {
      await refreshData();
      setSnackbar({ 
        open: true, 
        message: 'Data refreshed successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Refresh error:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to refresh data. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {getTitle()}
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading}
              size="small"
              title="Refresh data"
              sx={{ 
                color: '#2c3e50',
                '&:hover': { backgroundColor: 'rgba(44, 62, 80, 0.1)' }
              }}
            >
              <Refresh />
            </IconButton>
          </div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {getTitle()}
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading}
              size="small"
              title="Refresh data"
              sx={{ 
                color: '#2c3e50',
                '&:hover': { backgroundColor: 'rgba(44, 62, 80, 0.1)' }
              }}
            >
              <Refresh />
            </IconButton>
          </div>
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

  const renderTable = (data, title, emptyMessage) => (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
        {title} ({data.length})
      </Typography>
      {data.length > 0 ? (
        <DataGrid
          className="datagrid"
          rows={data}
          columns={getColumns().concat(actionColumn)}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25]}
          loading={loading}
          autoHeight
          sx={{
            '& .MuiDataGrid-root': {
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #e0e0e0',
            },
          }}
        />
      ) : (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <Typography variant="body1" color="textSecondary">
            {emptyMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <div className="datatable">
      <div className="datatableTitle">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {getTitle()}
          <IconButton 
            onClick={handleRefresh} 
            disabled={loading}
            size="small"
            title="Refresh data"
            sx={{ 
              color: '#2c3e50',
              '&:hover': { backgroundColor: 'rgba(44, 62, 80, 0.1)' }
            }}
          >
            <Refresh />
          </IconButton>
        </div>
        {shouldShowAddNew() && (
          <Link to={`${location.pathname}/new`} className="link">
            Add New User
          </Link>
        )}
      </div>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="user management tabs">
          <Tab label={`Tenants (${tenantUsers.length})`} />
          <Tab label={`Admins (${adminUsers.length})`} />
        </Tabs>
      </Box>

      {activeTab === 0 && renderTable(
        tenantUsers, 
        "Tenants", 
        "No tenants found. Add a new tenant to get started."
      )}
      
      {activeTab === 1 && renderTable(
        adminUsers, 
        "Administrators", 
        "No administrators found. Add a new admin to get started."
      )}
      
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
          <p>Are you sure you want to delete this user?</p>
          {itemToDelete?.item && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <strong>User to delete:</strong>
              <div>
                <p><strong>Name:</strong> {itemToDelete.item.fullName || itemToDelete.item.username}</p>
                <p><strong>Email:</strong> {itemToDelete.item.email}</p>
                <p><strong>Role:</strong> {itemToDelete.item.role}</p>
              </div>
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
    console.error('=== MAIN COMPONENT ERROR ===');
    console.error('Main component error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    console.error('Error name:', error.name);
    
    // Provide more specific error messages
    let errorMessage = 'An error occurred while loading the component';
    if (error.message.includes('permission')) {
      errorMessage = 'Permission denied. You may not have the right to access this component.';
    } else if (error.message.includes('network')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.message.includes('unavailable')) {
      errorMessage = 'Service temporarily unavailable. Please try again later.';
    }
    
    return (
      <div className="datatable">
        <div className="datatableTitle">
          {getTitle()}
        </div>
        <Alert severity="error" className="error-alert">
          <Typography variant="h6">Something went wrong</Typography>
          <Typography variant="body2">{errorMessage}</Typography>
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
};

export default UsersDatatable; 