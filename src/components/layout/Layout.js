// Layout.js - Updated
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import './styles/Layout.css';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSettingsClick = () => {
    navigate('/settings');
    if (isMobile) setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div 
            className="sidebar-overlay" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="mobile-sidebar">
            <Sidebar />
          </div>
        </>
      )}

      <div className="main-content">
        <Navbar 
          onSettingsClick={handleSettingsClick}
          onMenuClick={isMobile ? toggleSidebar : null}
          showMenuButton={isMobile}
        />
        
        <main className="main-content-area">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile only) */}
      {isMobile && <BottomNav />}
    </div>
  );
};

export default Layout;