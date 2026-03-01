// components/layout/MainPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from '../dashboard/Dashboard';
import Messages from '../messages/Messages';
import Chat from '../messages/Chat';
import Modal from '../common/Modal';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './styles/MainPage.css';

const MainPage = () => {
  const navigate = useNavigate();
  const isLargeScreen = useMediaQuery('(min-width: 1025px)');
  const isSmallScreen = useMediaQuery('(max-width: 768px)'); // 👈 new breakpoint

  // Popup state – now includes initial messages and conversation data
  const [popupConversation, setPopupConversation] = useState(null);

  const handleSelectConversation = (conversationId, userData) => {
    setPopupConversation({
      id: conversationId,
      user: userData,
      initialConversation: userData?._conversationData || null,
      initialMessages: userData?._initialMessages || [],
    });
  };

  const handleClosePopup = () => {
    setPopupConversation(null);
  };

  const handleConversationCreated = (newId) => {
    setPopupConversation((prev) => ({ ...prev, id: String(newId) }));
  };

  const handleOpenMessages = () => {
    navigate('/messages'); // Assumes you have a route for full messages view
  };

  return (
    <Layout>
      <div className="main-page-container">
        <div className="main-page-content">
          <div className="dashboard-section">
            <Dashboard />
          </div>

          {/* Hide messages section on small screens */}
          {!isSmallScreen && (
            <div className="messages-section">
              <Messages onSelectConversation={handleSelectConversation} />
            </div>
          )}
        </div>
      </div>


      <Modal isOpen={!!popupConversation} onClose={handleClosePopup}>
        {popupConversation && (
          <Chat
            conversationId={popupConversation.id}
            user={popupConversation.user}
            onBack={handleClosePopup}
            embedded={true}
            onConversationCreated={handleConversationCreated}
            initialConversation={popupConversation.initialConversation}
            initialMessages={popupConversation.initialMessages}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default MainPage;