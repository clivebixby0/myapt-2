import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

// Sample data for testing
const sampleUsers = [
  {
    uid: 'sample-user-1',
    email: 'john.doe@example.com',
    username: 'johndoe',
    fullName: 'John Doe',
    phone: '+1 555 123 4567',
    address: '123 Main St, New York, NY 10001',
    country: 'USA',
    role: 'tenant',
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    uid: 'sample-user-2',
    email: 'jane.smith@example.com',
    username: 'janesmith',
    fullName: 'Jane Smith',
    phone: '+1 555 234 5678',
    address: '456 Oak Ave, Los Angeles, CA 90210',
    country: 'USA',
    role: 'tenant',
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    uid: 'sample-user-3',
    email: 'mike.johnson@example.com',
    username: 'mikejohnson',
    fullName: 'Mike Johnson',
    phone: '+1 555 345 6789',
    address: '789 Pine Rd, Chicago, IL 60601',
    country: 'USA',
    role: 'tenant',
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    uid: 'sample-admin-1',
    email: 'admin@apartment.com',
    username: 'admin',
    fullName: 'System Administrator',
    phone: '+1 555 999 0000',
    address: '100 Admin Blvd, Management City, MC 12345',
    country: 'USA',
    role: 'admin',
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

const sampleApartments = [
  {
    apartmentNumber: 'Apt 101',
    building: 'Building A',
    floor: 1,
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 850,
    monthlyRent: 1200,
    status: 'Available',
    description: 'Cozy 2-bedroom apartment with modern amenities',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    apartmentNumber: 'Apt 102',
    building: 'Building A',
    floor: 1,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 650,
    monthlyRent: 950,
    status: 'Occupied',
    description: 'Efficient 1-bedroom apartment perfect for singles',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    apartmentNumber: 'Apt 201',
    building: 'Building A',
    floor: 2,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1200,
    monthlyRent: 1800,
    status: 'Available',
    description: 'Spacious 3-bedroom apartment with balcony',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    apartmentNumber: 'Apt 301',
    building: 'Building B',
    floor: 3,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 950,
    monthlyRent: 1400,
    status: 'Under Maintenance',
    description: 'Well-maintained 2-bedroom apartment',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    apartmentNumber: 'Apt 401',
    building: 'Building B',
    floor: 4,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 700,
    monthlyRent: 1100,
    status: 'Available',
    description: 'Modern 1-bedroom apartment with city view',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

const samplePayments = [
  {
    tenantId: 'sample-user-1',
    tenantName: 'John Doe',
    apartmentId: 'apt-1',
    apartmentNumber: 'Apt 101',
    amount: 1200,
    paymentType: 'Rent',
    paymentMethod: 'Credit Card',
    paymentDate: new Date('2024-03-01'),
    status: 'Paid',
    description: 'March 2024 rent payment',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    tenantId: 'sample-user-2',
    tenantName: 'Jane Smith',
    apartmentId: 'apt-2',
    apartmentNumber: 'Apt 102',
    amount: 950,
    paymentType: 'Rent',
    paymentMethod: 'Bank Transfer',
    paymentDate: new Date('2024-03-05'),
    status: 'Paid',
    description: 'March 2024 rent payment',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    tenantId: 'sample-user-3',
    tenantName: 'Mike Johnson',
    apartmentId: 'apt-3',
    apartmentNumber: 'Apt 201',
    amount: 1800,
    paymentType: 'Rent',
    paymentMethod: 'Check',
    paymentDate: new Date('2024-03-10'),
    status: 'Pending',
    description: 'March 2024 rent payment',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    tenantId: 'sample-user-1',
    tenantName: 'John Doe',
    apartmentId: 'apt-1',
    apartmentNumber: 'Apt 101',
    amount: 500,
    paymentType: 'Deposit',
    paymentMethod: 'Bank Transfer',
    paymentDate: new Date('2024-02-15'),
    status: 'Paid',
    description: 'Security deposit',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

const sampleMaintenance = [
  {
    apartmentId: 'apt-1',
    apartmentNumber: 'Apt 101',
    requestedBy: 'sample-user-1',
    requesterName: 'John Doe',
    issueType: 'Plumbing',
    priority: 'Medium',
    issue: 'Kitchen sink is leaking and water is pooling under the cabinet',
    requestDate: new Date('2024-03-15'),
    status: 'In Progress',
    assignedTo: 'Mike the Plumber',
    notes: 'Scheduled for repair on March 18th',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    apartmentId: 'apt-2',
    apartmentNumber: 'Apt 102',
    requestedBy: 'sample-user-2',
    requesterName: 'Jane Smith',
    issueType: 'Electrical',
    priority: 'High',
    issue: 'Power outlet in bedroom is not working and there are sparks when plugging in devices',
    requestDate: new Date('2024-03-12'),
    status: 'Completed',
    assignedTo: 'Electric Pro Services',
    notes: 'Outlet replaced and wiring checked. All electrical systems working properly.',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    apartmentId: 'apt-3',
    apartmentNumber: 'Apt 201',
    requestedBy: 'sample-user-3',
    requesterName: 'Mike Johnson',
    issueType: 'HVAC',
    priority: 'Low',
    issue: 'Air conditioning unit is making unusual noise during operation',
    requestDate: new Date('2024-03-10'),
    status: 'Pending',
    assignedTo: '',
    notes: 'Will schedule inspection next week',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    apartmentId: 'apt-4',
    apartmentNumber: 'Apt 301',
    requestedBy: 'sample-admin-1',
    requesterName: 'System Administrator',
    issueType: 'Structural',
    priority: 'Emergency',
    issue: 'Crack in the ceiling that appears to be growing larger',
    requestDate: new Date('2024-03-08'),
    status: 'In Progress',
    assignedTo: 'Structural Engineers Inc.',
    notes: 'Emergency inspection completed. Temporary supports installed. Permanent repair scheduled.',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

export const addSampleData = async () => {
  try {
    console.log('Starting to add sample data...');

    // Add sample users
    console.log('Adding sample users...');
    for (const user of sampleUsers) {
      try {
        await addDoc(collection(db, 'users'), user);
        console.log(`Added user: ${user.fullName}`);
      } catch (error) {
        console.error(`Error adding user ${user.fullName}:`, error);
      }
    }

    // Add sample apartments
    console.log('Adding sample apartments...');
    for (const apartment of sampleApartments) {
      try {
        await addDoc(collection(db, 'apartments'), apartment);
      console.log(`Added apartment: ${apartment.apartmentNumber}`);
      } catch (error) {
        console.error(`Error adding apartment ${apartment.apartmentNumber}:`, error);
      }
    }

    // Add sample payments
    console.log('Adding sample payments...');
    for (const payment of samplePayments) {
      try {
        await addDoc(collection(db, 'payments'), payment);
        console.log(`Added payment: ${payment.tenantName} - $${payment.amount}`);
      } catch (error) {
        console.error(`Error adding payment for ${payment.tenantName}:`, error);
      }
    }

    // Add sample maintenance requests
    console.log('Adding sample maintenance requests...');
    for (const maintenance of sampleMaintenance) {
      try {
        await addDoc(collection(db, 'maintenance'), maintenance);
        console.log(`Added maintenance request: ${maintenance.apartmentNumber}`);
      } catch (error) {
        console.error(`Error adding maintenance for ${maintenance.apartmentNumber}:`, error);
      }
    }

    console.log('Sample data added successfully!');
    return { success: true, message: 'Sample data added successfully!' };
  } catch (error) {
    console.error('Error adding sample data:', error);
    return { success: false, error: error.message };
  }
};

export const clearSampleData = async () => {
  try {
    console.log('Clearing sample data...');
    
    // Note: This would require batch operations to delete multiple documents
    // For now, we'll just log that this function needs to be implemented
    console.log('Clear sample data function needs to be implemented with batch operations');
    
    return { success: true, message: 'Clear function needs batch implementation' };
  } catch (error) {
    console.error('Error clearing sample data:', error);
    return { success: false, error: error.message };
  }
}; 