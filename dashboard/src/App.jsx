import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

// Pages
import Landing from './pages/Landing';
import About from './pages/About';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AlertLog from './pages/AlertLog';
import ThreatMap from './pages/ThreatMap';
import BlockedIPs from './pages/BlockedIPs';
import Settings from './pages/Settings';

// Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    
    const { data: { subscription } } = 
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setLoading(false);
      });
    
    return () => subscription.unsubscribe();
  }, []);
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div
        className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
      />
    </div>
  );
  
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

const DashboardLayout = ({ children, title }) => (
  <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
    <Sidebar />
    <div className="flex-1 ml-[220px]">
      <TopBar title={title} />
      <main className="p-8 max-w-[1400px] mx-auto">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout title="Dashboard">
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute>
            <DashboardLayout title="Alert log">
              <AlertLog />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute>
            <DashboardLayout title="Threat map">
              <ThreatMap />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/blocked" element={
          <ProtectedRoute>
            <DashboardLayout title="Blocked IPs">
              <BlockedIPs />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout title="Settings">
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
