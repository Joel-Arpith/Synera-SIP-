import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

// Components & Pages
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ThreatMap from './pages/ThreatMap';
import BlockedIPs from './pages/BlockedIPs';
import AlertLog from './pages/AlertLog';
import Settings from './pages/Settings';
import Login from './pages/Login';

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-primary"></div>
    </div>
  );

  return (
    <Router>
      <div className="flex min-h-screen bg-background text-gray-100 font-sans">
        {!session ? (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <>
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
              <Header user={session.user} />
              <main className="flex-1 overflow-y-auto p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/map" element={<ThreatMap />} />
                  <Route path="/blocked" element={<BlockedIPs />} />
                  <Route path="/alerts" element={<AlertLog />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
