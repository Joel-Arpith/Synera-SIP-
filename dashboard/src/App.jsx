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
     <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6">
        <div className="h-10 w-10 border-4 border-[#6366f120] border-t-[#6366f1] rounded-full animate-spin" />
        <p className="text-xs font-mono text-[#475569] uppercase tracking-[0.4em]">Establishing Secure Context</p>
     </div>
  );
  
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

const DashboardLayout = ({ children, title }) => (
  <div className="flex min-h-screen bg-[#0a0a0f]">
    <Sidebar />
    <div className="flex-1 transition-all duration-300 ml-[240px]"> {/* ml updated dynamically if I had more robust state, but 240 is default */}
      <TopBar title={title} />
      <main className="p-8">
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
            <DashboardLayout title="Operational Overview">
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute>
            <DashboardLayout title="Incursion Archive">
              <AlertLog />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute>
            <DashboardLayout title="Geo-Spatial Intel">
              <ThreatMap />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/blocked" element={
          <ProtectedRoute>
            <DashboardLayout title="Firewall Quarantine">
              <BlockedIPs />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout title="System Sovereignty">
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
