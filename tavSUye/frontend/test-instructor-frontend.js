// Test script to verify frontend instructor API service
import { instructorApi } from './src/services/api.js';

async function testInstructorFrontendAPI() {
  console.log('Testing Frontend Instructor API Service...');
  
  try {
    console.log('Calling instructorApi.getAllInstructors()...');
    const instructors = await instructorApi.getAllInstructors();
    
    console.log('✅ Frontend API call successful!');
    console.log(`Instructors count: ${instructors?.length || 0}`);
    
    if (instructors && instructors.length > 0) {
      console.log('Sample instructor:', instructors[0]);
      console.log('All instructor names:');
      instructors.forEach((instructor, index) => {
        console.log(`  ${index + 1}. ${instructor.firstName} ${instructor.lastName} (${instructor.department})`);
      });
    } else {
      console.log('❌ No instructors returned');
    }
    
  } catch (error) {
    console.log('❌ Frontend API call failed:');
    console.log(`Error: ${error.message}`);
    console.log('Full error:', error);
  }
}

testInstructorFrontendAPI(); 