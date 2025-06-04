import React from 'react';

export default function FallbackPage() {
  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto', 
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#1976d2' }}>tavSUye</h1>
      <h2>Basic Fallback Mode</h2>
      
      <p>
        This is a minimal fallback page that loads when the main application encounters issues.
      </p>
      
      <div style={{ 
        margin: '30px 0',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Demo User Information</h3>
        <p><strong>Username:</strong> demo.user</p>
        <p><strong>Password:</strong> password123</p>
        
        <button 
          onClick={() => {
            localStorage.setItem('demo_user_mode', 'true');
            window.location.href = '/';
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Continue as Demo User
        </button>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Reload Page
        </button>
        
        <button
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Data & Reload
        </button>
      </div>
      
      <footer style={{ marginTop: '50px', color: '#666', fontSize: '0.8rem' }}>
        <p>Status: Fallback Mode Active</p>
        <p>© {new Date().getFullYear()} tavSUye</p>
      </footer>
    </div>
  );
} 