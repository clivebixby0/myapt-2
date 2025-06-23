import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  userService, 
  apartmentService, 
  paymentService, 
  maintenanceService,
  relationshipService
} from '../firebase/services';

const DataContext = createContext();

const initialState = {
  users: [],
  apartments: [],
  payments: [],
  maintenance: [],
  loading: false,
  error: null
};

const dataReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'SET_APARTMENTS':
      return { ...state, apartments: action.payload };
    
    case 'SET_PAYMENTS':
      return { ...state, payments: action.payload };
    
    case 'SET_MAINTENANCE':
      return { ...state, maintenance: action.payload };
    
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    
    case 'ADD_APARTMENT':
      return { ...state, apartments: [...state.apartments, action.payload] };
    
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    
    case 'ADD_MAINTENANCE':
      return { ...state, maintenance: [...state.maintenance, action.payload] };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        )
      };
    
    case 'UPDATE_APARTMENT':
      return {
        ...state,
        apartments: state.apartments.map(apt => 
          apt.id === action.payload.id ? action.payload : apt
        )
      };
    
    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment => 
          payment.id === action.payload.id ? action.payload : payment
        )
      };
    
    case 'UPDATE_MAINTENANCE':
      return {
        ...state,
        maintenance: state.maintenance.map(maintenance => 
          maintenance.id === action.payload.id ? action.payload : maintenance
        )
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    
    case 'DELETE_APARTMENT':
      return {
        ...state,
        apartments: state.apartments.filter(apt => apt.id !== action.payload)
      };
    
    case 'DELETE_PAYMENT':
      return {
        ...state,
        payments: state.payments.filter(payment => payment.id !== action.payload)
      };
    
    case 'DELETE_MAINTENANCE':
      return {
        ...state,
        maintenance: state.maintenance.filter(maintenance => maintenance.id !== action.payload)
      };
    
    default:
      return state;
  }
};

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const loadAllData = useCallback(async () => {
    if (state.loading) {
      console.log('🔄 Data loading already in progress, skipping...');
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🔄 Starting to load all data...');
      
      // Load all data with relationships in parallel
      const [usersResult, apartmentsResult, paymentsResult, maintenanceResult] = await Promise.all([
        relationshipService.getAllUsersWithApartments(),
        relationshipService.getAllApartmentsWithTenants(),
        paymentService.getAllPayments(),
        maintenanceService.getAllMaintenance()
      ]);

      console.log('📊 Data loading results:');
      console.log('Users result:', usersResult);
      console.log('Users success:', usersResult.success);
      console.log('Users data length:', usersResult.data?.length);
      console.log('Sample user data:', usersResult.data?.[0]);

      // Only update state if the request was successful
      if (usersResult.success) {
        console.log('✅ Users loaded successfully, dispatching to state');
        console.log('Users to dispatch:', usersResult.data);
        dispatch({ type: 'SET_USERS', payload: usersResult.data });
      } else {
        console.error('❌ Failed to load users:', usersResult.error);
        // Try to load users without relationships as fallback
        console.log('🔄 Trying to load users without relationships...');
        const fallbackResult = await userService.getAllUsers();
        if (fallbackResult.success) {
          console.log('✅ Fallback users loaded successfully');
          dispatch({ type: 'SET_USERS', payload: fallbackResult.data });
        } else {
          console.error('❌ Fallback also failed:', fallbackResult.error);
        }
      }
      
      if (apartmentsResult.success) {
        console.log('✅ Apartments loaded successfully');
        dispatch({ type: 'SET_APARTMENTS', payload: apartmentsResult.data });
      } else {
        console.error('Failed to load apartments:', apartmentsResult.error);
      }
      
      if (paymentsResult.success) {
        console.log('✅ Payments loaded successfully');
        dispatch({ type: 'SET_PAYMENTS', payload: paymentsResult.data });
      } else {
        console.error('Failed to load payments:', paymentsResult.error);
      }
      
      if (maintenanceResult.success) {
        console.log('✅ Maintenance loaded successfully');
        dispatch({ type: 'SET_MAINTENANCE', payload: maintenanceResult.data });
      } else {
        console.error('Failed to load maintenance:', maintenanceResult.error);
      }

      // Only set error if all requests failed
      const allFailed = !usersResult.success && !apartmentsResult.success && 
                       !paymentsResult.success && !maintenanceResult.success;
      
      if (allFailed) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data. Please refresh the page.' });
      } else {
        // Clear any previous errors if at least one request succeeded
        dispatch({ type: 'SET_ERROR', payload: null });
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      // Don't set error if we have existing data, just log it
      if (state.users.length === 0 && state.apartments.length === 0 && 
          state.payments.length === 0 && state.maintenance.length === 0) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []); // Remove dependencies to prevent infinite loops

  // Load initial data from Firebase
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const addUser = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await userService.addUser(userData);
      if (result.success) {
        // Reload all data to get the updated relationships
        await loadAllData();
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Add user error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addApartment = async (apartmentData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await apartmentService.addApartment(apartmentData);
      if (result.success) {
        const newApartment = { id: result.id, ...apartmentData };
        dispatch({ type: 'ADD_APARTMENT', payload: newApartment });
        return { success: true };
      }
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addPayment = async (paymentData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await paymentService.addPayment(paymentData);
      if (result.success) {
        const newPayment = { id: result.id, ...paymentData };
        dispatch({ type: 'ADD_PAYMENT', payload: newPayment });
        return { success: true };
      }
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addMaintenance = async (maintenanceData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await maintenanceService.addMaintenance(maintenanceData);
      if (result.success) {
        const newMaintenance = { id: result.id, ...maintenanceData };
        dispatch({ type: 'ADD_MAINTENANCE', payload: newMaintenance });
        return { success: true };
      }
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateUser = async (userId, userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await userService.updateUser(userId, userData);
      if (result.success) {
        // If apartment assignment is involved, reload all data to get updated relationships
        if (userData.apartmentId !== undefined) {
          await loadAllData();
        } else {
          const updatedUser = { id: userId, ...userData };
          dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        }
        return { success: true };
      }
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateApartment = async (apartmentId, apartmentData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await apartmentService.updateApartment(apartmentId, apartmentData);
      if (result.success) {
        // If tenant assignment is involved, reload all data to get updated relationships
        if (apartmentData.tenantId !== undefined) {
          await loadAllData();
        } else {
          const updatedApartment = { id: apartmentId, ...apartmentData };
          dispatch({ type: 'UPDATE_APARTMENT', payload: updatedApartment });
        }
        return { success: true };
      }
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updatePayment = async (paymentId, paymentData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await paymentService.updatePayment(paymentId, paymentData);
      if (result.success) {
        const updatedPayment = { id: paymentId, ...paymentData };
        dispatch({ type: 'UPDATE_PAYMENT', payload: updatedPayment });
        return { success: true };
      }
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateMaintenance = async (maintenanceId, maintenanceData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await maintenanceService.updateMaintenance(maintenanceId, maintenanceData);
      if (result.success) {
        const updatedMaintenance = { id: maintenanceId, ...maintenanceData };
        dispatch({ type: 'UPDATE_MAINTENANCE', payload: updatedMaintenance });
        return { success: true };
      }
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteUser = async (id) => {
    console.log('DataContext: Deleting user with ID:', id);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await userService.deleteUser(id);
      console.log('DataContext: Delete user result:', result);
      if (result.success) {
        // Reload all data to get updated relationships after user deletion
        await loadAllData();
        return { success: true };
      }
      console.error('DataContext: Delete user failed:', result);
      return result;
    } catch (error) {
      console.error('DataContext: Delete user error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteApartment = async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await apartmentService.deleteApartment(id);
      if (result.success) {
        // Reload all data to get updated relationships after apartment deletion
        await loadAllData();
        return { success: true };
      }
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deletePayment = async (id) => {
    console.log('DataContext: Deleting payment with ID:', id);
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Validate input
      if (!id) {
        throw new Error('Payment ID is required');
      }
      
      console.log('DataContext: Calling payment service delete...');
      const result = await paymentService.deletePayment(id);
      console.log('DataContext: Delete payment result:', result);
      
      if (result.success) {
        console.log('DataContext: Payment deleted successfully, updating state');
        dispatch({ type: 'DELETE_PAYMENT', payload: id });
        return { success: true };
      } else {
        console.error('DataContext: Delete payment failed:', result);
        return result;
      }
    } catch (error) {
      console.error('DataContext: Delete payment error:', error);
      console.error('DataContext: Error stack:', error.stack);
      console.error('DataContext: Error message:', error.message);
      
      // Don't dispatch error to avoid breaking the UI
      // Just return the error
      return { 
        success: false, 
        error: error.message || 'Failed to delete payment'
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteMaintenance = async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await maintenanceService.deleteMaintenance(id);
      if (result.success) {
        dispatch({ type: 'DELETE_MAINTENANCE', payload: id });
        return { success: true };
      }
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Relationship management functions
  const assignTenantToApartment = async (apartmentId, tenantId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await apartmentService.assignTenantToApartment(apartmentId, tenantId);
      if (result.success) {
        // Reload data to get updated relationships
        await loadAllData();
        return { success: true };
      }
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeTenantFromApartment = async (apartmentId, tenantId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await apartmentService.removeTenantFromApartment(apartmentId, tenantId);
      if (result.success) {
        // Reload data to get updated relationships
        await loadAllData();
        return { success: true };
      }
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const linkPaymentToMaintenance = async (maintenanceId, paymentId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await maintenanceService.linkPaymentToMaintenance(maintenanceId, paymentId);
      if (result.success) {
        // Reload data to get updated relationships
        await loadAllData();
        return { success: true };
      }
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Manual refresh function
  const refreshData = async () => {
    console.log('🔄 Manual refresh triggered');
    await loadAllData();
  };

  const value = {
    ...state,
    loading: state.loading,
    error: state.error,
    addUser,
    addApartment,
    addPayment,
    addMaintenance,
    updateUser,
    updateApartment,
    updatePayment,
    updateMaintenance,
    deleteUser,
    deleteApartment,
    deletePayment,
    deleteMaintenance,
    assignTenantToApartment,
    removeTenantFromApartment,
    linkPaymentToMaintenance,
    refreshData,
    loadAllData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 