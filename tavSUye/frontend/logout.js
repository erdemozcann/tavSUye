// This is a simple Node.js script that will log you out by clearing browser storage
// Run this script with Node.js

// Create a simple HTML file that clears localStorage and sessionStorage
const fs = require('fs');

const logoutHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Logging out...</title>
  <script>
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Set specific flags to ensure we're fully logged out
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('demo_user_mode');
    sessionStorage.removeItem('app_initialized');
    sessionStorage.removeItem('autoLoginAttempts');

    // Add noAutoLogin parameter to prevent auto-login
    window.location.href = '/login?noAutoLogin=true';
    
    document.getElementById('message').innerText = 'You have been logged out. Redirecting to login page...';
  </script>
</head>
<body style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px;">
  <h1>Logging Out</h1>
  <p id="message">Processing logout...</p>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync('public/logout.html', logoutHtml);

console.log('Logout file created. Open http://localhost:5173/logout.html in your browser to log out'); 