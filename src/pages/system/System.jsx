import "./system.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Featured from "../../components/featured/Featured";
import SampleDataManager from "../../components/SampleDataManager";
import { Button, Card, CardContent, Typography, Box } from "@mui/material";
import { runPermissionTests } from "../../firebase/testDeletePermissions";
import { useState } from "react";

const System = () => {
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    try {
      const results = await runPermissionTests();
      setTestResults(results);
      console.log('Test results:', results);
    } catch (error) {
      console.error('Test error:', error);
      setTestResults({ success: false, error: error.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="system">
      <Sidebar />
      <div className="systemContainer">
        <Navbar />
        <div className="systemStatus">
          <Featured />
          <SampleDataManager />
          
          {/* Permission Test Section */}
          <Card style={{ marginTop: '20px', marginBottom: '20px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Firebase Permission Tests
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Test the delete and view permissions for debugging purposes
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary" 
                onClick={runTests}
                disabled={testing}
                style={{ marginTop: '10px' }}
              >
                {testing ? 'Running Tests...' : 'Run Permission Tests'}
              </Button>
              
              {testResults && (
                <Box style={{ marginTop: '20px' }}>
                  <Typography variant="h6" gutterBottom>
                    Test Results:
                  </Typography>
                  <pre style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '10px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </Box>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default System; 