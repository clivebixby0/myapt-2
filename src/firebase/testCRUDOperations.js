import { 
  userService, 
  apartmentService, 
  paymentService, 
  maintenanceService 
} from './services';

// Test function to verify delete operations work correctly
export const testDeleteOperations = async () => {
  console.log('🧪 Testing delete operations...');
  
  try {
    // Test user deletion
    console.log('Testing user deletion...');
    const testUserId = 'test-user-id'; // This would be a real user ID from your database
    const userDeleteResult = await userService.deleteUser(testUserId);
    console.log('User delete result:', userDeleteResult);
    
    // Test apartment deletion
    console.log('Testing apartment deletion...');
    const testApartmentId = 'test-apartment-id'; // This would be a real apartment ID
    const apartmentDeleteResult = await apartmentService.deleteApartment(testApartmentId);
    console.log('Apartment delete result:', apartmentDeleteResult);
    
    // Test payment deletion
    console.log('Testing payment deletion...');
    const testPaymentId = 'test-payment-id'; // This would be a real payment ID
    const paymentDeleteResult = await paymentService.deletePayment(testPaymentId);
    console.log('Payment delete result:', paymentDeleteResult);
    
    // Test maintenance deletion
    console.log('Testing maintenance deletion...');
    const testMaintenanceId = 'test-maintenance-id'; // This would be a real maintenance ID
    const maintenanceDeleteResult = await maintenanceService.deleteMaintenance(testMaintenanceId);
    console.log('Maintenance delete result:', maintenanceDeleteResult);
    
    return { 
      success: true, 
      message: 'Delete operations test completed',
      results: {
        user: userDeleteResult,
        apartment: apartmentDeleteResult,
        payment: paymentDeleteResult,
        maintenance: maintenanceDeleteResult
      }
    };
  } catch (error) {
    console.error('❌ Error testing delete operations:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Test function to verify view operations work correctly
export const testViewOperations = async () => {
  console.log('🧪 Testing view operations...');
  
  try {
    // Test getting all users
    console.log('Testing get all users...');
    const usersResult = await userService.getAllUsers();
    console.log('Users result:', usersResult);
    
    // Test getting all apartments
    console.log('Testing get all apartments...');
    const apartmentsResult = await apartmentService.getAllApartments();
    console.log('Apartments result:', apartmentsResult);
    
    // Test getting all payments
    console.log('Testing get all payments...');
    const paymentsResult = await paymentService.getAllPayments();
    console.log('Payments result:', paymentsResult);
    
    // Test getting all maintenance
    console.log('Testing get all maintenance...');
    const maintenanceResult = await maintenanceService.getAllMaintenance();
    console.log('Maintenance result:', maintenanceResult);
    
    return { 
      success: true, 
      message: 'View operations test completed',
      results: {
        users: usersResult,
        apartments: apartmentsResult,
        payments: paymentsResult,
        maintenance: maintenanceResult
      }
    };
  } catch (error) {
    console.error('❌ Error testing view operations:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Function to run the complete CRUD test
export const runCRUDTest = async () => {
  console.log('🧪 Starting CRUD operations test...');
  
  console.log('📋 Test Flow:');
  console.log('1. Test view operations (get all data)');
  console.log('2. Test delete operations (delete test items)');
  console.log('3. Verify error handling');
  
  const viewResult = await testViewOperations();
  const deleteResult = await testDeleteOperations();
  
  return { 
    success: viewResult.success && deleteResult.success, 
    viewResult,
    deleteResult,
    message: 'CRUD operations test completed'
  };
}; 