import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_ENDPOINTS, fetchJSON } from '../config/api';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://mudates.tiguleni.com';

export const useBadgeCounts = () => {
  const { token, isAuthenticated, user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingMatches, setPendingMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mountedRef = useRef(false);
  const intervalRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch unread messages count
  const fetchUnreadMessages = useCallback(async () => {
    if (!token || !mountedRef.current) return;

    try {
      const data = await fetchJSON(API_ENDPOINTS.CHAT_CONVERSATIONS, { 
        method: 'GET' 
      }, token);
      
      const totalUnread = Array.isArray(data)
        ? data.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
        : 0;

      if (mountedRef.current) {
        setUnreadMessages(totalUnread);
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
      if (mountedRef.current) {
        setError('Failed to load message counts');
      }
    }
  }, [token]);

  // Fetch pending matches count
  const fetchPendingMatches = useCallback(async () => {
    if (!token || !mountedRef.current) return;

    try {
      const data = await fetchJSON(API_ENDPOINTS.MATCHES, { 
        method: 'GET' 
      }, token);
      
      const pending = Array.isArray(data)
        ? data.filter((match) => !match.viewed || match.is_new).length
        : 0;

      if (mountedRef.current) {
        setPendingMatches(pending);
      }
    } catch (error) {
      console.error('Error fetching pending matches:', error);
      if (mountedRef.current) {
        setError('Failed to load match counts');
      }
    }
  }, [token]);

  // Fetch both counts
  const fetchCounts = useCallback(async (showLoading = false) => {
    if (!token || !user || !mountedRef.current) return;

    if (showLoading) {
      setIsLoading(true);
    }

    try {
      await Promise.all([fetchUnreadMessages(), fetchPendingMatches()]);
    } catch (error) {
      console.error('Error fetching counts:', error);
      if (mountedRef.current) {
        setError('Failed to load notification counts');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [token, user, fetchUnreadMessages, fetchPendingMatches]);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!token) return;
    
    try {
      // Call API to mark all messages as read
      await fetchJSON(API_ENDPOINTS.MARK_MESSAGES_READ, { 
        method: 'POST' 
      }, token);
      
      // Update local state
      setUnreadMessages(0);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [token]);

  // Mark matches as viewed
  const markMatchesAsViewed = useCallback(async () => {
    if (!token) return;
    
    try {
      // Call API to mark matches as viewed
      await fetchJSON(API_ENDPOINTS.MARK_MATCHES_VIEWED, { 
        method: 'POST' 
      }, token);
      
      // Update local state
      setPendingMatches(0);
    } catch (error) {
      console.error('Error marking matches as viewed:', error);
    }
  }, [token]);

  // Clear specific badge
  const clearBadge = useCallback((type) => {
    switch (type) {
      case 'messages':
        setUnreadMessages(0);
        markMessagesAsRead();
        break;
      case 'matches':
        setPendingMatches(0);
        markMatchesAsViewed();
        break;
      default:
        break;
    }
  }, [markMessagesAsRead, markMatchesAsViewed]);

  // Clear all badges
  const clearAllBadges = useCallback(() => {
    setUnreadMessages(0);
    setPendingMatches(0);
    
    // Call APIs to mark all as read/viewed
    Promise.all([markMessagesAsRead(), markMatchesAsViewed()]).catch(console.error);
  }, [markMessagesAsRead, markMatchesAsViewed]);

  // Mount/unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initial load and periodic refresh
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Initial fetch without loading spinner
    fetchCounts(false);

    // Set up periodic refresh (every 5 minutes)
    intervalRef.current = setInterval(() => {
      fetchCounts(false);
    }, 300000); // 5 minutes

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, token, fetchCounts]);

  // WebSocket connection for real-time updates
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
      console.log('[Badge Hook] WebSocket connected:', socket.id);
    });

    socket.on('connected', () => {
      // Refresh counts once when connected
      fetchCounts(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Badge Hook] WebSocket error:', err?.message || err);
    });

    // Listen for conversation updates
    socket.on('conversation_updated', (data) => {
      console.log('[Badge Hook] Conversation updated:', data);
      fetchUnreadMessages(); // Refresh unread count
    });

    // Listen for new messages
    socket.on('new_message', (message) => {
      console.log('[Badge Hook] New message:', message);
      // Increment unread count for the conversation
      if (mountedRef.current) {
        setUnreadMessages(prev => prev + 1);
      }
    });

    // Listen for match updates
    socket.on('new_match', (match) => {
      console.log('[Badge Hook] New match:', match);
      // Increment pending matches
      if (mountedRef.current) {
        setPendingMatches(prev => prev + 1);
      }
    });

    // Listen for match viewed event
    socket.on('match_viewed', () => {
      // Decrement pending matches
      if (mountedRef.current) {
        setPendingMatches(prev => Math.max(0, prev - 1));
      }
    });

    // Listen for messages read event
    socket.on('messages_read', (conversationId) => {
      // We'll refetch to get accurate count
      fetchUnreadMessages();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token, fetchCounts, fetchUnreadMessages]);

  // Manual refresh function
  const refreshBadges = useCallback(async () => {
    await fetchCounts(true);
  }, [fetchCounts]);

  return {
    // State
    unreadMessages,
    pendingMatches,
    isLoading,
    error,
    totalBadges: unreadMessages + pendingMatches,
    
    // Actions
    refreshBadges,
    fetchUnreadMessages,
    fetchPendingMatches,
    clearBadge,
    clearAllBadges,
    markMessagesAsRead,
    markMatchesAsViewed,
    
    // Helper functions
    hasUnreadMessages: unreadMessages > 0,
    hasPendingMatches: pendingMatches > 0,
    hasAnyBadges: unreadMessages > 0 || pendingMatches > 0,
  };
};