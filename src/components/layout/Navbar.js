// Navbar.jsx
// ✅ Fix unread notifications badge (no “refresh feel”)
// ✅ Uses Socket.IO to update unread count instantly (conversation_updated / new_message)
// ✅ Keeps REST polling as fallback (30s) WITHOUT resetting badge incorrectly
// ✅ Fixes “on notification open setUnreadCount(0)” (was wrong if you didn’t mark read on backend)
// ✅ Adds optional "mark all read" hook point when opening notifications
// ✅ On large screens: hides "Mdates" text, integrates search input into left side with icon inside
// ✅ FIXED: Profile picture now displays correctly – using direct <img> with fallback (like UserCard)
// ✅ IMPROVED: Small screen search – single search icon toggle, clean form with submit button and clear button

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaSearch,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaTimes,
  FaChevronDown,
  FaUserCircle,
  FaQuestionCircle,
  FaMoon,
  FaGlobe,
} from 'react-icons/fa';
import { io } from 'socket.io-client';

import { API_ENDPOINTS, fetchJSON, fetchWithAuth } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import Notifications from './Notifications';
import './styles/Navbar.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://mudates.tiguleni.com';

const Navbar = ({ onSettingsClick, sidebarCollapsed = false }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 768);
  const [avatarError, setAvatarError] = useState(false); // for fallback

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const socketRef = useRef(null);
  const mountedRef = useRef(false);

  const { user: currentAuthUser, token, logout, isAuthenticated } = useAuth();

  const isDashboardPage = location.pathname === '/' || location.pathname === '/dashboard';

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On large screens, search input is always active
  useEffect(() => {
    if (isLargeScreen) {
      setSearchActive(true);
    } else {
      setSearchActive(false);
    }
  }, [isLargeScreen]);

  useEffect(() => {
    mountedRef.current = true;

    const fetchUserData = async () => {
      if (!token) return;

      try {
        const data = await fetchJSON(API_ENDPOINTS.PROFILE, { method: 'GET' }, token);

        if (!mountedRef.current) return;
        console.log('Profile data:', data); 
        setUserData({
          id: data.id,
          name: data.first_name || data.name || 'User',
          email: data.email || '',
          avatarColor: data.profile_color || 'linear-gradient(135deg, #003A8F, #3b82f6)',
          initials: (data.first_name || data.name || 'U').charAt(0).toUpperCase(),
          profilePicture: data.profile_picture, 
          isOnline: true,
        });
        setAvatarError(false); 
      } catch (error) {
        console.error('Error fetching user data:', error);

        if (!mountedRef.current) return;
        if (currentAuthUser) {
          setUserData({
            name: currentAuthUser.name || currentAuthUser.first_name || 'You',
            email: currentAuthUser.email || '',
            avatarColor: 'linear-gradient(135deg, #003A8F, #3b82f6)',
            initials: (currentAuthUser.name || currentAuthUser.first_name || 'Y').charAt(0).toUpperCase(),
            profilePicture: currentAuthUser.profile_picture, 
            isOnline: true,
          });
        }
      }
    };

    if (token) fetchUserData();
    else if (currentAuthUser) {
      setUserData({
        name: currentAuthUser.name || currentAuthUser.first_name || 'You',
        email: currentAuthUser.email || '',
        avatarColor: 'linear-gradient(135deg, #003A8F, #3b82f6)',
        initials: (currentAuthUser.name || currentAuthUser.first_name || 'Y').charAt(0).toUpperCase(),
        profilePicture: currentAuthUser.profile_picture,
        isOnline: true,
      });
    }

    return () => {
      mountedRef.current = false;
    };
  }, [token, currentAuthUser]);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;

    try {
      const data = await fetchJSON(API_ENDPOINTS.CHAT_CONVERSATIONS, { method: 'GET' }, token);

      const totalUnread = Array.isArray(data)
        ? data.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
        : 0;

      if (mountedRef.current) setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    fetchUnreadCount();
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchUnreadCount, token]);

  // ----------------------------
  // Socket: instant unread updates
  // ----------------------------
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    if (socketRef.current) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      auth: { token: `Bearer ${token}` },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[navbar socket] ✅ connected', socket.id);
    });

    socket.on('connected', () => {
      fetchUnreadCount();
    });

    socket.on('connect_error', (err) => {
      console.error('[navbar socket] ❌ connect_error:', err?.message || err);
    });

    socket.on('conversation_updated', () => {
      fetchUnreadCount();
    });

    socket.on('new_message', () => {
      fetchUnreadCount();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, fetchUnreadCount]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        !isLargeScreen &&
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchActive &&
        window.innerWidth < 768
      ) {
        setSearchActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchActive, isLargeScreen]);
  const handleProfileClick = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  const handleSettingsNavClick = () => {
    if (onSettingsClick) onSettingsClick();
    else navigate('/settings');
    setShowDropdown(false);
  };

  const handleHelpClick = () => {
    navigate('/help');
    setShowDropdown(false);
  };

  const handleThemeToggle = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    setShowDropdown(false);
  };

  const handleLogoutClick = async () => {
    if (!token) {
      logout();
      return;
    }

    try {
      await fetchWithAuth(API_ENDPOINTS.LOGOUT, { method: 'POST' }, token);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const handleNotificationsClick = async () => {
    setShowNotifications(true);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
    if (token) fetchUnreadCount();
  };

  // Search handlers
  const handleSearchClick = () => {
    if (isLargeScreen) {
      if (searchQuery.trim()) {
        handleSearchSubmit();
      }
    } else {
      setSearchActive((v) => !v);
      if (!searchActive) {
        setTimeout(() => document.getElementById('navbar-search-input')?.focus(), 100);
      } else {
        if (!isDashboardPage) setSearchQuery('');
      }
    }
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!token) {
      alert('Please login to search');
      navigate('/login');
      return;
    }

    if (searchQuery.trim()) {
      setLoading(true);
      try {
        const results = await fetchJSON(
          `${API_ENDPOINTS.USERS}?search=${encodeURIComponent(searchQuery)}`,
          { method: 'GET' },
          token
        );
        navigate('/search', { state: { results, query: searchQuery } });
      } catch (error) {
        console.error('Search error:', error);
        navigate('/search', { state: { results: [], query: searchQuery } });
      } finally {
        setLoading(false);
        if (!isLargeScreen && window.innerWidth < 768) setSearchActive(false);
      }
    }
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  useEffect(() => {
    if (isDashboardPage) {
      const params = new URLSearchParams(location.search);
      setSearchQuery(params.get('q') || '');
    }
  }, [location.search, isDashboardPage]);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, []);

  const renderAvatar = (size = 36, user = userData) => {
    const fallbackInitials = user?.initials || 'U';
    const fallbackColor = user?.avatarColor || 'linear-gradient(135deg, #003A8F, #3b82f6)';

    if (user?.profilePicture && !avatarError) {
      return (
        <img
          src={user.profilePicture}
          alt={user.name}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
          }}
          onError={() => setAvatarError(true)}
        />
      );
    } else {
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: fallbackColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: size * 0.4,
            fontWeight: 'bold',
          }}
        >
          {fallbackInitials}
        </div>
      );
    }
  };
  return (
    <div className={`top-nav ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Left section */}
      <div className="nav-left">
        <div className="app-logo" onClick={() => navigate('/')}>
          {!isLargeScreen && <h1>Mdates</h1>}
        </div>

        {/* Integrated search for large screens */}
        {isLargeScreen && (
          <div className="search-integrated" ref={searchRef}>
            <FaSearch className="search-icon" />
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={loading}
                className="search-input-integrated"
              />
            </form>
            {loading && <div className="search-spinner-small"></div>}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="nav-actions">
        {/* Small screen search toggle & form */}
        {!isLargeScreen && (
          <>
            {!searchActive ? (
              <button
                className="nav-action-btn"
                onClick={handleSearchClick}
                type="button"
                aria-label="Search"
              >
                <FaSearch />
              </button>
            ) : (
              <div className="search-container" ref={searchRef}>
                <form onSubmit={handleSearchSubmit} className="search-active-form">
                  <input
                    id="navbar-search-input"
                    type="text"
                    className="search-input"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="search-submit-btn"
                    aria-label="Submit search"
                  >
                    <FaSearch />
                  </button>
                  {searchQuery && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <FaTimes />
                    </button>
                  )}
                </form>
                {loading && <div className="search-spinner-small" />}
              </div>
            )}
          </>
        )}
{(isLargeScreen || !searchActive) && (
  <button
    className="nav-action-btn"
    onClick={handleNotificationsClick}
    type="button"
    aria-label="Notifications"
  >
    <FaBell />
    {unreadCount > 0 && (
      <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
    )}
  </button>
)}

        {/* Avatar dropdown */}
        <div
          className="navbar-avatar-dropdown-container"
          ref={dropdownRef}
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <div className="navbar-avatar-wrapper">
            {renderAvatar(36)}
            <FaChevronDown
              className="dropdown-arrow"
              style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>

          {showDropdown && (
            <div
              className="navbar-user-dropdown"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <div className="dropdown-user-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {renderAvatar(44)}
                  <div>
                    <h4
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '15px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {userData?.name || 'You'}
                    </h4>
                    <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {userData?.email || 'View your profile'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="dropdown-menu-items">
                <div className="dropdown-menu-item" onClick={handleProfileClick}>
                  <FaUserCircle className="dropdown-icon" style={{ color: 'var(--mubas-blue)' }} />
                  <span>My Profile</span>
                </div>

                <div className="dropdown-menu-item" onClick={handleSettingsNavClick}>
                  <FaCog className="dropdown-icon" />
                  <span>Settings</span>
                </div>

                <div className="dropdown-menu-item" onClick={handleThemeToggle}>
                  <FaMoon className="dropdown-icon" />
                  <span>Dark Mode</span>
                  <div className="toggle-switch-small">
                    <input
                      type="checkbox"
                      id="dark-mode-toggle"
                      checked={document.documentElement.getAttribute('data-theme') === 'dark'}
                      readOnly
                    />
                    <span className="toggle-slider-small"></span>
                  </div>
                </div>

                <div className="dropdown-menu-item" onClick={handleHelpClick}>
                  <FaQuestionCircle className="dropdown-icon" />
                  <span>Help & Support</span>
                </div>

                <div
                  className="dropdown-menu-item"
                  onClick={() => {
                    console.log('Language selector');
                    setShowDropdown(false);
                  }}
                >
                  <FaGlobe className="dropdown-icon" />
                  <span>Language</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      fontWeight: '500',
                    }}
                  >
                    EN
                  </span>
                </div>
              </div>

              <div className="dropdown-menu-item logout-item" onClick={handleLogoutClick}>
                <FaSignOutAlt className="dropdown-icon" />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications panel */}
      {showNotifications && (
        <>
          <div className="notifications-overlay" onClick={closeNotifications} />
          <Notifications onClose={closeNotifications} />
        </>
      )}
    </div>
  );
};

export default Navbar;