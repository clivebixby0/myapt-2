import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography, Box, Chip, Avatar, Divider, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert } from '@mui/material';
import { Close, Person, Home, Payment, Build, Email, Phone, LocationOn, CalendarToday, AttachMoney, Apartment, Description, Edit, Refresh } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './ViewModal.scss';

const ViewModal = ({ open, onClose, data, type }) => {
  const { user: currentUser } = useAuth();
  const { updateUser, updateApartment, updatePayment, updateMaintenance, loadAllData } = useData();
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Debug logging to see what data is being passed
  console.log('=== VIEWMODAL DEBUG ===');
  console.log('ViewModal received data:', data);
  console.log('ViewModal type:', type);
  console.log('ViewModal open:', open);
  console.log('Data keys:', data ? Object.keys(data) : 'No data');
  console.log('Data structure:', JSON.stringify(data, null, 2));
  console.log('Current user:', currentUser);
  
  // Initialize newStatus when data changes
  useEffect(() => {
    if (data?.status) {
      setNewStatus(data.status);
    }
  }, [data]);
  
  const isAdmin = currentUser?.role === 'admin';
  
  const getStatusOptions = () => {
    switch (type) {
      case 'users':
      case 'user':
        return ['active', 'assigned', 'passive', 'suspended'];
      case 'apartments':
      case 'apartment':
        return ['available', 'occupied', 'under maintenance', 'reserved'];
      case 'payments':
      case 'payment':
        return ['paid', 'pending', 'overdue', 'cancelled'];
      case 'maintenance':
        return ['pending', 'in progress', 'completed', 'cancelled'];
      default:
        return [];
    }
  };
  
  const handleStatusChange = async () => {
    if (!isAdmin || !data?.id || !newStatus) return;
    
    setUpdating(true);
    try {
      console.log('Updating status for:', type, data.id, 'to:', newStatus);
      
      let result;
      switch (type) {
        case 'users':
        case 'user':
          result = await updateUser(data.id, { status: newStatus });
          break;
        case 'apartments':
        case 'apartment':
          result = await updateApartment(data.id, { status: newStatus });
          break;
        case 'payments':
        case 'payment':
          result = await updatePayment(data.id, { status: newStatus });
          break;
        case 'maintenance':
          result = await updateMaintenance(data.id, { status: newStatus });
          break;
        default:
          throw new Error('Unknown type for status update');
      }
      
      if (result && result.success) {
        console.log('Status updated successfully');
        setIsEditingStatus(false);
        // Close modal to refresh data
        handleCloseModal();
        // Show success message
        showSnackbar('Status updated successfully!');
      } else {
        console.error('Status update failed:', result);
        showSnackbar('Failed to update status: ' + (result?.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Status update error:', error);
      showSnackbar('Error updating status: ' + error.message, 'error');
    } finally {
      setUpdating(false);
    }
  };
  
  const cancelStatusEdit = () => {
    setIsEditingStatus(false);
    setNewStatus(data?.status || '');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAllData();
      showSnackbar('Data refreshed successfully!');
    } catch (error) {
      console.error('Refresh error:', error);
      showSnackbar('Failed to refresh data: ' + error.message, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'assigned':
      case 'paid':
      case 'completed':
        return 'success';
      case 'pending':
      case 'in progress':
        return 'warning';
      case 'passive':
      case 'overdue':
      case 'cancelled':
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderUserDetails = () => (
    <Box className="modal-content">
      <Box className="user-header">
        <Avatar 
          src={data?.profileImage} 
          alt={data?.fullName || data?.username}
          className="user-avatar"
        >
          {data?.fullName?.charAt(0) || data?.username?.charAt(0) || 'U'}
        </Avatar>
        <Box className="user-info">
          <Typography variant="h5" className="user-name">
            {data?.fullName || data?.username || 'Unknown User'}
          </Typography>
          <Typography variant="body2" className="user-email">
            {data?.email || 'No email provided'}
          </Typography>
          <Chip 
            label={data?.role || 'User'} 
            color="primary" 
            size="small" 
            className="role-chip"
          />
        </Box>
      </Box>
      
      <Divider className="divider" />
      
      <Box className="details-grid">
        <Box className="detail-item">
          <Person className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">User ID</Typography>
            <Typography variant="body2">{data?.id || data?.uid || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Person className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Full Name</Typography>
            <Typography variant="body2">{data?.fullName || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Person className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Username</Typography>
            <Typography variant="body2">{data?.username || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Email className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Email</Typography>
            <Typography variant="body2">{data?.email || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Phone className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Phone</Typography>
            <Typography variant="body2">{data?.phone || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <LocationOn className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Address</Typography>
            <Typography variant="body2">{data?.address || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <LocationOn className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Country</Typography>
            <Typography variant="body2">{data?.country || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Person className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Role</Typography>
            <Typography variant="body2">{data?.role || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <CalendarToday className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Created</Typography>
            <Typography variant="body2">{formatDate(data?.createdAt)}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <CalendarToday className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Last Updated</Typography>
            <Typography variant="body2">{formatDate(data?.updatedAt)}</Typography>
          </Box>
        </Box>
        
        {/* Apartment Information for Users */}
        <Box className="detail-item">
          <Home className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Assigned Apartment</Typography>
            <Typography variant="body2">
              {data?.apartment ? (
                `${data.apartment.apartmentNumber} - Building ${data.apartment.building}`
              ) : data?.apartmentId ? (
                <>
                  Apartment ID: {data.apartmentId} (Details not loaded)
                  <Typography variant="caption" display="block" style={{ color: '#666', marginTop: '4px' }}>
                    💡 Try clicking the refresh button above to load apartment details
                  </Typography>
                </>
              ) : (
                'No apartment assigned'
              )}
            </Typography>
          </Box>
        </Box>
        
        {data?.apartment && (
          <>
            <Box className="detail-item">
              <Typography variant="caption" className="detail-label">Apartment Floor</Typography>
              <Typography variant="body2">{data.apartment.floor || 'N/A'}</Typography>
            </Box>
            
            <Box className="detail-item">
              <Typography variant="caption" className="detail-label">Bedrooms</Typography>
              <Typography variant="body2">{data.apartment.bedrooms || 'N/A'}</Typography>
            </Box>
            
            <Box className="detail-item">
              <Typography variant="caption" className="detail-label">Bathrooms</Typography>
              <Typography variant="body2">{data.apartment.bathrooms || 'N/A'}</Typography>
            </Box>
            
            <Box className="detail-item">
              <Typography variant="caption" className="detail-label">Square Feet</Typography>
              <Typography variant="body2">{data.apartment.squareFeet ? `${data.apartment.squareFeet} sq ft` : 'N/A'}</Typography>
            </Box>
            
            <Box className="detail-item">
              <AttachMoney className="detail-icon" />
              <Box>
                <Typography variant="caption" className="detail-label">Monthly Rent</Typography>
                <Typography variant="body2">{formatCurrency(data.apartment.monthlyRent)}</Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
      
      <Box className="status-section">
        <Typography variant="h6" className="section-title">Status</Typography>
        {isEditingStatus ? (
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FormControl size="small" style={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Status"
                disabled={updating}
              >
                {getStatusOptions().map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleStatusChange}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={cancelStatusEdit}
              disabled={updating}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Chip 
              label={data?.status || 'Unknown'} 
              color={getStatusColor(data?.status)}
              className="status-chip"
            />
            {isAdmin && (
              <IconButton
                size="small"
                onClick={() => setIsEditingStatus(true)}
                style={{ color: '#1976d2' }}
              >
                <Edit fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
      
      {/* Debug section - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <Box className="debug-section" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <Typography variant="h6" style={{ marginBottom: '10px' }}>Debug Information</Typography>
          <Typography variant="body2" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            {JSON.stringify(data, null, 2)}
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderApartmentDetails = () => (
    <Box className="modal-content">
      <Box className="apartment-header">
        <Home className="apartment-icon" />
        <Box className="apartment-info">
          <Typography variant="h5" className="apartment-title">
            {data?.apartmentNumber}
          </Typography>
          <Typography variant="body2" className="apartment-building">
            Building {data?.building}
          </Typography>
        </Box>
      </Box>
      
      <Divider className="divider" />
      
      <Box className="details-grid">
        <Box className="detail-item">
          <Apartment className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Apartment Number</Typography>
            <Typography variant="body2">{data?.apartmentNumber || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Home className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Building</Typography>
            <Typography variant="body2">{data?.building || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Typography variant="caption" className="detail-label">Floor</Typography>
          <Typography variant="body2">{data?.floor || 'N/A'}</Typography>
        </Box>
        
        <Box className="detail-item">
          <Typography variant="caption" className="detail-label">Bedrooms</Typography>
          <Typography variant="body2">{data?.bedrooms || 'N/A'}</Typography>
        </Box>
        
        <Box className="detail-item">
          <Typography variant="caption" className="detail-label">Bathrooms</Typography>
          <Typography variant="body2">{data?.bathrooms || 'N/A'}</Typography>
        </Box>
        
        <Box className="detail-item">
          <Typography variant="caption" className="detail-label">Square Feet</Typography>
          <Typography variant="body2">{data?.squareFeet ? `${data.squareFeet} sq ft` : 'N/A'}</Typography>
        </Box>
        
        <Box className="detail-item">
          <AttachMoney className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Monthly Rent</Typography>
            <Typography variant="body2">{formatCurrency(data?.monthlyRent)}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <CalendarToday className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Created</Typography>
            <Typography variant="body2">{formatDate(data?.createdAt)}</Typography>
          </Box>
        </Box>
        
        {/* Tenant Information for Apartments */}
        <Box className="detail-item">
          <Person className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Assigned Tenant</Typography>
            <Typography variant="body2">
              {data?.tenant ? (
                `${data.tenant.fullName || data.tenant.username} (${data.tenant.email})`
              ) : data?.tenantId ? (
                <>
                  Tenant ID: {data.tenantId} (Details not loaded)
                  <Typography variant="caption" display="block" style={{ color: '#666', marginTop: '4px' }}>
                    💡 Try clicking the refresh button above to load tenant details
                  </Typography>
                </>
              ) : (
                'No tenant assigned'
              )}
            </Typography>
          </Box>
        </Box>
        
        {data?.tenant && (
          <>
            <Box className="detail-item">
              <Phone className="detail-icon" />
              <Box>
                <Typography variant="caption" className="detail-label">Tenant Phone</Typography>
                <Typography variant="body2">{data.tenant.phone || 'N/A'}</Typography>
              </Box>
            </Box>
            
            <Box className="detail-item">
              <LocationOn className="detail-icon" />
              <Box>
                <Typography variant="caption" className="detail-label">Tenant Address</Typography>
                <Typography variant="body2">{data.tenant.address || 'N/A'}</Typography>
              </Box>
            </Box>
            
            <Box className="detail-item">
              <Person className="detail-icon" />
              <Box>
                <Typography variant="caption" className="detail-label">Tenant Status</Typography>
                <Typography variant="body2">{data.tenant.status || 'N/A'}</Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
      
      <Box className="status-section">
        <Typography variant="h6" className="section-title">Status</Typography>
        {isEditingStatus ? (
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FormControl size="small" style={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Status"
                disabled={updating}
              >
                {getStatusOptions().map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleStatusChange}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={cancelStatusEdit}
              disabled={updating}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Chip 
              label={data?.status || 'Unknown'} 
              color={getStatusColor(data?.status)}
              className="status-chip"
            />
            {isAdmin && (
              <IconButton
                size="small"
                onClick={() => setIsEditingStatus(true)}
                style={{ color: '#1976d2' }}
              >
                <Edit fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderPaymentDetails = () => (
    <Box className="modal-content">
      <Box className="payment-header">
        <Payment className="payment-icon" />
        <Box className="payment-info">
          <Typography variant="h5" className="payment-title">
            Payment #{data?.id?.slice(-8)}
          </Typography>
          <Typography variant="body2" className="payment-tenant">
            {data?.tenantName || data?.tenant}
          </Typography>
        </Box>
      </Box>
      
      <Divider className="divider" />
      
      <Box className="details-grid">
        <Box className="detail-item">
          <Person className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Tenant</Typography>
            <Typography variant="body2">{data?.tenantName || data?.tenant || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Apartment className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Apartment</Typography>
            <Typography variant="body2">
              {data?.apartmentNumber ? `${data.apartmentNumber} - ${data.building || 'N/A'}` : 'N/A'}
            </Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <AttachMoney className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Amount</Typography>
            <Typography variant="body2">{formatCurrency(data?.amount)}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <CalendarToday className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Payment Date</Typography>
            <Typography variant="body2">{formatDate(data?.paymentDate || data?.date)}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Typography variant="caption" className="detail-label">Payment Type</Typography>
          <Typography variant="body2">{data?.paymentType || 'N/A'}</Typography>
        </Box>
        
        <Box className="detail-item">
          <Typography variant="caption" className="detail-label">Payment Method</Typography>
          <Typography variant="body2">{data?.paymentMethod || 'N/A'}</Typography>
        </Box>
        
        <Box className="detail-item">
          <Description className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Description</Typography>
            <Typography variant="body2">{data?.description || 'Rent payment'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <CalendarToday className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Created</Typography>
            <Typography variant="body2">{formatDate(data?.createdAt)}</Typography>
          </Box>
        </Box>
      </Box>
      
      <Box className="status-section">
        <Typography variant="h6" className="section-title">Status</Typography>
        {isEditingStatus ? (
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FormControl size="small" style={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Status"
                disabled={updating}
              >
                {getStatusOptions().map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleStatusChange}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={cancelStatusEdit}
              disabled={updating}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Chip 
              label={data?.status || 'Unknown'} 
              color={getStatusColor(data?.status)}
              className="status-chip"
            />
            {isAdmin && (
              <IconButton
                size="small"
                onClick={() => setIsEditingStatus(true)}
                style={{ color: '#1976d2' }}
              >
                <Edit fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderMaintenanceDetails = () => (
    <Box className="modal-content">
      <Box className="maintenance-header">
        <Build className="maintenance-icon" />
        <Box className="maintenance-info">
          <Typography variant="h5" className="maintenance-title">
            Request #{data?.id?.slice(-8)}
          </Typography>
          <Typography variant="body2" className="maintenance-apartment">
            {data?.apartmentNumber || data?.apartment}
          </Typography>
        </Box>
      </Box>
      
      <Divider className="divider" />
      
      <Box className="details-grid">
        <Box className="detail-item">
          <Apartment className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Apartment</Typography>
            <Typography variant="body2">{data?.apartmentNumber || data?.apartment || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Person className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Requested By</Typography>
            <Typography variant="body2">{data?.requestedBy || data?.tenantName || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Description className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Issue</Typography>
            <Typography variant="body2">{data?.issue || data?.description || 'N/A'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <CalendarToday className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Request Date</Typography>
            <Typography variant="body2">{formatDate(data?.requestDate || data?.date)}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <CalendarToday className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Scheduled Date</Typography>
            <Typography variant="body2">{formatDate(data?.scheduledDate) || 'Not scheduled'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <CalendarToday className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Completed Date</Typography>
            <Typography variant="body2">{formatDate(data?.completedDate) || 'Not completed'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Person className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Assigned To</Typography>
            <Typography variant="body2">{data?.assignedTo || 'Not assigned'}</Typography>
          </Box>
        </Box>
        
        <Box className="detail-item">
          <Description className="detail-icon" />
          <Box>
            <Typography variant="caption" className="detail-label">Notes</Typography>
            <Typography variant="body2">{data?.notes || 'No additional notes'}</Typography>
          </Box>
        </Box>
      </Box>
      
      <Box className="status-section">
        <Typography variant="h6" className="section-title">Status</Typography>
        {isEditingStatus ? (
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FormControl size="small" style={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Status"
                disabled={updating}
              >
                {getStatusOptions().map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleStatusChange}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={cancelStatusEdit}
              disabled={updating}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Box style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Chip 
              label={data?.status || 'Unknown'} 
              color={getStatusColor(data?.status)}
              className="status-chip"
            />
            {isAdmin && (
              <IconButton
                size="small"
                onClick={() => setIsEditingStatus(true)}
                style={{ color: '#1976d2' }}
              >
                <Edit fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderContent = () => {
    console.log('=== RENDER CONTENT DEBUG ===');
    console.log('Type:', type);
    console.log('Data available:', !!data);
    console.log('Data keys:', data ? Object.keys(data) : 'No data');
    
    if (!data) {
      console.error('❌ No data provided to ViewModal');
      return (
        <Box className="modal-content">
          <Typography variant="h6" color="error">Error: No data available</Typography>
          <Typography variant="body2">Please try again or contact support if the issue persists.</Typography>
        </Box>
      );
    }
    
    switch (type) {
      case 'users':
      case 'user':
        console.log('Rendering user details');
        return renderUserDetails();
      case 'apartments':
      case 'apartment':
        console.log('Rendering apartment details');
        return renderApartmentDetails();
      case 'payments':
      case 'payment':
        console.log('Rendering payment details');
        return renderPaymentDetails();
      case 'maintenance':
        console.log('Rendering maintenance details');
        return renderMaintenanceDetails();
      default:
        console.error('❌ Unknown type:', type);
        console.log('Available data:', data);
        return (
          <Box className="modal-content">
            <Typography variant="h6" color="error">Unknown data type: {type}</Typography>
            <Typography variant="body2" style={{ marginTop: '10px' }}>
              Debug information:
            </Typography>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
              marginTop: '10px'
            }}>
              {JSON.stringify({ type, data }, null, 2)}
            </pre>
          </Box>
        );
    }
  };

  const handleCloseModal = () => {
    setIsEditingStatus(false);
    setNewStatus('');
    setUpdating(false);
    onClose();
  };
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setIsEditingStatus(false);
      setNewStatus('');
      setUpdating(false);
    } else if (data?.status) {
      setNewStatus(data.status);
    }
  }, [open, data?.status]);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCloseModal} 
      maxWidth="md" 
      fullWidth
      className="view-modal"
    >
      <DialogTitle className="modal-title">
        <Box className="title-content">
          <Typography variant="h6">
            {type === 'user' && 'User Details'}
            {type === 'apartment' && 'Apartment Details'}
            {type === 'payment' && 'Payment Details'}
            {type === 'maintenance' && 'Maintenance Request Details'}
          </Typography>
        </Box>
        <Box className="title-actions">
          <IconButton
            aria-label="refresh"
            onClick={handleRefresh}
            disabled={refreshing}
            className="refresh-button"
            title="Refresh data"
          >
            <Refresh className={refreshing ? 'rotating' : ''} />
          </IconButton>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            className="close-button"
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent className="modal-body">
        {renderContent()}
      </DialogContent>
      
      <DialogActions className="modal-actions">
        <Button onClick={handleCloseModal} variant="outlined">
          Close
        </Button>
      </DialogActions>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ViewModal; 