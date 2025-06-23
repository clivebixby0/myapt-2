import { 
  userService, 
  apartmentService, 
  paymentService, 
  maintenanceService 
} from './services';
import { auth } from './config';

// Test function to verify delete permissions
export const testDeletePermissions = async () => {
  console.log('🧪 Testing delete permissions...');
  
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
      console.error('❌ No authenticated user found');
      return { 
        success: false, 
        error: 'No authenticated user found' 
      };
    }
    
    // Get all users first to see what's available
    console.log('Getting all users...');
    const usersResult = await userService.getAllUsers();
    console.log('Users result:', usersResult);
    
    if (usersResult.success && usersResult.data.length > 0) {
      const testUser = usersResult.data[0];
      console.log('Test user for deletion:', testUser);
      
      // Try to delete the first user (this should work for admin users)
      console.log('Attempting to delete test user...');
      const deleteResult = await userService.deleteUser(testUser.id);
      console.log('Delete result:', deleteResult);
      
      if (deleteResult.success) {
        console.log('✅ Delete operation successful');
        return { 
          success: true, 
          message: 'Delete permissions are working correctly',
          deletedUser: testUser
        };
      } else {
        console.error('❌ Delete operation failed:', deleteResult.error);
        return { 
          success: false, 
          error: deleteResult.error,
          message: 'Delete permissions are not working correctly'
        };
      }
    } else {
      console.log('No users found to test deletion');
      return { 
        success: true, 
        message: 'No users found to test deletion' 
      };
    }
  } catch (error) {
    console.error('❌ Error testing delete permissions:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Test function to verify view permissions
export const testViewPermissions = async () => {
  console.log('🧪 Testing view permissions...');
  
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
      console.error('❌ No authenticated user found');
      return { 
        success: false, 
        error: 'No authenticated user found' 
      };
    }
    
    // Test getting all data
    const [usersResult, apartmentsResult, paymentsResult, maintenanceResult] = await Promise.all([
      userService.getAllUsers(),
      apartmentService.getAllApartments(),
      paymentService.getAllPayments(),
      maintenanceService.getAllMaintenance()
    ]);
    
    console.log('View test results:');
    console.log('Users:', usersResult);
    console.log('Apartments:', apartmentsResult);
    console.log('Payments:', paymentsResult);
    console.log('Maintenance:', maintenanceResult);
    
    const allSuccessful = usersResult.success && apartmentsResult.success && 
                         paymentsResult.success && maintenanceResult.success;
    
    if (allSuccessful) {
      console.log('✅ View permissions are working correctly');
      return { 
        success: true, 
        message: 'View permissions are working correctly',
        results: {
          users: usersResult.data?.length || 0,
          apartments: apartmentsResult.data?.length || 0,
          payments: paymentsResult.data?.length || 0,
          maintenance: maintenanceResult.data?.length || 0
        }
      };
    } else {
      console.error('❌ Some view operations failed');
      return { 
        success: false, 
        error: 'Some view operations failed',
        results: {
          users: usersResult,
          apartments: apartmentsResult,
          payments: paymentsResult,
          maintenance: maintenanceResult
        }
      };
    }
  } catch (error) {
    console.error('❌ Error testing view permissions:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Function to run all permission tests
export const runPermissionTests = async () => {
  console.log('🧪 Starting permission tests...');
  
  const viewResult = await testViewPermissions();
  const deleteResult = await testDeletePermissions();
  
  console.log('Permission test results:');
  console.log('View permissions:', viewResult);
  console.log('Delete permissions:', deleteResult);
  
  return {
    success: viewResult.success && deleteResult.success,
    viewResult,
    deleteResult
  };
}; 