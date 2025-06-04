// Test current instructor API response
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

async function testCurrentAPI() {
  console.log('Testing current instructor API...');
  
  try {
    // Test the actual API call that the frontend makes
    const response = await axios.get(`${API_URL}/instructors/all`, {
      timeout: 5000,
      withCredentials: true
    });
    
    console.log('✅ API call successful!');
    console.log(`Status: ${response.status}`);
    console.log(`Data length: ${response.data?.length || 0}`);
    
    if (response.data && response.data.length > 0) {
      console.log('First instructor from API:', response.data[0]);
    }
    
  } catch (error) {
    console.log('❌ API call failed (expected):');
    console.log(`Status: ${error.response?.status}`);
    console.log(`Message: ${error.message}`);
    
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log('🔒 This is expected - user not authenticated');
      console.log('Frontend should handle this with fallback data');
      
      // Simulate what the frontend should do
      console.log('\n📋 Frontend should return this fallback data:');
      const fallbackData = [
        {
          instructorId: 1,
          firstName: 'Erkay',
          lastName: 'Savaş',
          name: 'Erkay',
          surname: 'Savaş',
          title: 'Professor',
          email: 'erkays@sabanciuniv.edu',
          department: 'FENS'
        }
      ];
      console.log('Sample fallback instructor:', fallbackData[0]);
    }
  }
}

testCurrentAPI(); 