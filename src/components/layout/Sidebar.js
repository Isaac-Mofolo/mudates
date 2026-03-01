// Sidebar.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaHeart, 
  FaComments, 
  FaCog, 
  FaUser, 
  FaSearch, 
  FaSignOutAlt,
  FaBell,
  FaUsers,
  FaCaretRight,
  FaCaretLeft,
  FaGift,
  FaStar,
  FaEye,
  FaCalendarAlt,
  FaBookmark
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../common/UserAvatar';
import './styles/Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();
  
  const [collapsed, setCollapsed] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingMatches, setPendingMatches] = useState(0);
  const [newLikes, setNewLikes] = useState(3); // Example dynamic data
  const [newVisitors, setNewVisitors] = useState(5); // Example dynamic data
  const [pendingGifts, setPendingGifts] = useState(2); // Example dynamic data
  const [userData, setUserData] = useState(null);
  const [activeItem, setActiveItem] = useState('discover');
  
  const mountedRef = useRef(false);

  // Main menu items (core features)
  const menuItems = [
    {
      id: 'discover',
      label: 'Discover',
      icon: <FaHome />,
      path: '/',
      badge: false
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: <FaHeart />,
      path: '/matches',
      badge: pendingMatches,
      badgeType: 'count'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <FaComments />,
      path: '/messages',
      badge: unreadMessages,
      badgeType: 'count'
    },
    {
      id: 'likes',
      label: 'Likes',
      icon: <FaStar />,
      path: '/likes',
      badge: newLikes,
      badgeType: 'count'
    },
    {
      id: 'visitors',
      label: 'Visitors',
      icon: <FaEye />,
      path: '/visitors',
      badge: newVisitors,
      badgeType: 'count'
    },
    {
      id: 'gifts',
      label: 'Gifts',
      icon: <FaGift />,
      path: '/gifts',
      badge: pendingGifts,
      badgeType: 'count'
    },
    {
      id: 'events',
      label: 'Events',
      icon: <FaCalendarAlt />,
      path: '/events',
      badge: false
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: <FaBookmark />,
      path: '/favorites',
      badge: false
    }
  ];

  // Bottom menu items (account & settings)
  const bottomItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <FaUser />,
      path: '/profile'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <FaCog />,
      path: '/settings',
      // Optional subItems can be added later
    }
  ];

  // Fetch user data
  useEffect(() => {
    mountedRef.current = true;
    
    if (user) {
      setUserData({
        name: user.name || user.first_name || 'User',
        email: user.email || '',
        avatarColor: 'linear-gradient(135deg, #003A8F, #3b82f6)',
        initials: (user.name || user.first_name || 'U').charAt(0),
        profilePicture: user.profile_picture
      });
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [user]);

  // Update active item based on route
  useEffect(() => {
    const path = location.pathname;
    
    const allItems = [...menuItems, ...bottomItems];
    const active = allItems.find(item => 
      item.path === path || (item.path !== '/' && path.startsWith(item.path))
    );
    
    if (active && mountedRef.current) {
      setActiveItem(active.id);
    }
  }, [location.pathname]);

  const handleNavClick = (item) => {
    navigate(item.path);
    setActiveItem(item.id);
  };

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-logo" onClick={() => navigate('/')}>
            <div className="logo-icon">M</div>
            <h1>Mdates</h1>
          </div>
        )}
        {collapsed && (
          <div className="sidebar-logo-collapsed" onClick={() => navigate('/')}>
            <div className="logo-icon">M</div>
          </div>
        )}
        
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FaCaretRight /> : <FaCaretLeft />}
        </button>
      </div>

      {/* Main Menu */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className={collapsed ? 'hidden' : 'nav-section-title'}>Menu</h3>
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`na-item ${activeItem === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                  title={collapsed ? item.label : ''}
                >
                  <div className="nav-icon-wrapper">
                    {item.icon}
                    {item.badge && item.badgeType === 'count' && (
                      <span className="nav-badge-count">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                    {item.badge && item.badgeType === 'dot' && (
                      <span className="nav-badge-dot"></span>
                    )}
                  </div>
                  {!collapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Menu */}
        <div className="nav-section bottom-section">
          <h3 className={collapsed ? 'hidden' : 'nav-section-title'}>Account</h3>
          <ul>
            {bottomItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`na-item ${activeItem === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item)}
                  title={collapsed ? item.label : ''}
                >
                  <div className="nav-icon-wrapper">
                    {item.icon}
                  </div>
                  {!collapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
            
            <li>
              <button
                className="na-item logout"
                onClick={handleLogout}
                title={collapsed ? "Logout" : ""}
              >
                <div className="nav-icon-wrapper">
                  <FaSignOutAlt />
                </div>
                {!collapsed && (
                  <span className="nav-label">Logout</span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Upgrade/CTA Section */}
      {!collapsed && (
        <div className="sidebar-upgrade">
          <div className="upgrade-content">
            <h4>Upgrade to Premium</h4>
            <p>Unlock all features</p>
            <button className="upgrade-button">Upgrade Now</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;