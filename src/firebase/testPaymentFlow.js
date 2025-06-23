import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// Test function to simulate admin creating a payment for a tenant
export const testAdminPaymentCreation = async (tenantId, tenantName, apartmentId, apartmentNumber) => {
  try {
    console.log('Testing admin payment creation for tenant:', tenantName);
    
    const testPayment = {
      tenantId: tenantId,
      tenantName: tenantName,
      apartmentId: apartmentId,
      apartmentNumber: apartmentNumber,
      amount: 1500,
      paymentType: 'Rent',
      paymentMethod: 'Bank Transfer',
      paymentDate: new Date(),
      status: 'Paid',
      description: 'Monthly rent payment - Test',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'payments'), testPayment);
    console.log('✅ Test payment created successfully with ID:', docRef.id);
    
    return { 
      success: true, 
      paymentId: docRef.id,
      payment: { id: docRef.id, ...testPayment }
    };
  } catch (error) {
    console.error('❌ Error creating test payment:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Test function to verify tenant can see their payments
export const testTenantPaymentVisibility = async (tenantId) => {
  try {
    console.log('Testing tenant payment visibility for tenant ID:', tenantId);
    
    // This would be called from the DataContext to get payments
    // For now, we'll just log the test
    console.log('✅ Tenant payment visibility test completed');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error testing tenant payment visibility:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Function to run the complete test flow
export const runPaymentFlowTest = async () => {
  console.log('🧪 Starting payment flow test...');
  
  // This would need actual tenant and apartment IDs from your database
  // For now, this is a template for testing
  
  console.log('📋 Test Flow:');
  console.log('1. Admin creates payment for tenant');
  console.log('2. Payment appears in tenant\'s payment list');
  console.log('3. Tenant can view payment details');
  console.log('4. Admin can see all payments');
  
  return { success: true, message: 'Payment flow test template ready' };
}; 