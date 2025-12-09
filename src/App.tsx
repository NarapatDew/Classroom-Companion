import { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginScreen from './components/Auth/LoginScreen';
import Dashboard from './components/Dashboard/Dashboard';
import type { UserProfile } from './types';
import './index.css';

// Get Client ID from environment or use a placeholder
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'missing-client-id';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="min-h-screen bg-[#f8f9fa] text-text">
        {!user || !accessToken ? (
          <LoginScreen onLogin={(u, token) => {
            setUser(u);
            setAccessToken(token);
          }} />
        ) : (
          <Dashboard
            user={user}
            accessToken={accessToken}
            onLogout={() => {
              setUser(null);
              setAccessToken(null);
            }}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
