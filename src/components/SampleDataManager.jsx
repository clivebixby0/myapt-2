import React, { useState } from 'react';
import { Button, Alert, Box, Typography, Paper } from '@mui/material';
import { addSampleData, clearSampleData } from '../firebase/sampleData';

const SampleDataManager = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const handleAddSampleData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await addSampleData();
      
      if (result.success) {
        setMessage('Sample data added successfully! Refresh the page to see the new data.');
        setMessageType('success');
      } else {
        setMessage(`Error: ${result.error}`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSampleData = async () => {
    if (!window.confirm('Are you sure you want to clear all sample data? This action cannot be undone.')) {
      return;
    }
    
      setLoading(true);
      setMessage('');
      
      try {
      const result = await clearSampleData();
      
      if (result.success) {
        setMessage('Sample data cleared successfully!');
        setMessageType('success');
      } else {
        setMessage(`Error: ${result.error}`);
        setMessageType('error');
      }
      } catch (error) {
      setMessage(`Error: ${error.message}`);
        setMessageType('error');
      } finally {
        setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, m: 2, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        Sample Data Manager
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use these buttons to add or clear sample data for testing purposes.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddSampleData}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Sample Data'}
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={handleClearSampleData}
          disabled={loading}
        >
          {loading ? 'Clearing...' : 'Clear Sample Data'}
        </Button>
      </Box>

      {message && (
        <Alert severity={messageType} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Note: Sample data includes users, apartments, payments, and maintenance requests for testing the application.
      </Typography>
    </Paper>
  );
};

export default SampleDataManager; 