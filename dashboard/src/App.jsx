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
     <div className="min-h-screen bg-[#fbfbfd] flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className="h-12 w-12 border-[3px] border-black/5 border-t-black rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-1.5 w-1.5 bg-black rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-[13px] font-semibold text-black/40 uppercase tracking-[0.2em] ml-1">Secure Intel Access</p>
     </div>
  );
  
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

const DashboardLayout = ({ children, title }) => (
  <div className="flex min-h-screen bg-[#fbfbfd]">
    <Sidebar />
    <div className="flex-1 transition-all duration-300 ml-64">
      <TopBar title={title} />
      <main className="p-10 max-w-[1600px] mx-auto">
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
            <DashboardLayout title="Security Archive">
              <AlertLog />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/map" element={
          <ProtectedRoute>
            <DashboardLayout title="Geo-Spatial Intelligence">
              <ThreatMap />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/blocked" element={
          <ProtectedRoute>
            <DashboardLayout title="Threat Quarantine">
              <BlockedIPs />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout title="System Configuration">
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
