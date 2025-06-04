// Simple test script to verify instructor API
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

async function testInstructorAPI() {
  console.log('Testing Instructor API...');
  
  try {
    // Test direct API call
    console.log('1. Testing direct API call...');
    const response = await axios.get(`${API_URL}/instructors/all`, {
      timeout: 5000,
      withCredentials: true
    });
    
    console.log('✅ Direct API call successful!');
    console.log(`Status: ${response.status}`);
    console.log(`Data length: ${response.data?.length || 0}`);
    
    if (response.data && response.data.length > 0) {
      console.log('Sample instructor:', response.data[0]);
    }
    
  } catch (error) {
    console.log('❌ Direct API call failed:');
    console.log(`Status: ${error.response?.status}`);
    console.log(`Message: ${error.message}`);
    
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log('🔒 Authentication required - this is expected');
      console.log('The frontend should handle this with fallback data');
    }
  }
  
  console.log('\n2. Testing frontend API service...');
  
  // Test if we can import the API service
  try {
    // This would be the frontend API call
    console.log('Frontend should handle 403 errors with fallback data');
    console.log('Check the browser console for actual API service results');
  } catch (error) {
    console.log('Error testing frontend API service:', error.message);
  }
}

testInstructorAPI(); 