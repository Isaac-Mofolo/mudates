import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaBriefcase,
  FaCheckCircle,
  FaArrowRight,
} from 'react-icons/fa';
import './styles/UserCard.css';

const UserCard = ({
  user,
  onClick,                
  onLike,
  onMessage,
  onViewProfile,          
  showDistance = true,
  isLiked = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const defaultUser = {
    id: 0,
    name: 'User',
    age: 25,
    job: 'Not specified',
    bio: 'Looking for connections',
    distance: 'Nearby',
    initials: 'U',
    compatibility: null,
    interests: [],
    image: null,
    verified: false,
    jobIcon: null,
  };

  const userData = { ...defaultUser, ...user };

  

  const handleViewProfileClick = (e) => {
    e.stopPropagation();
    if (onViewProfile) {
      onViewProfile(userData);
    } else {
      
      navigate(`/user/${userData.id}`);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (onLike) {
      onLike(userData.id);
    }
  };

  const handleChat = (e) => {
    e.stopPropagation();
    if (onMessage) {
      onMessage(userData);
    }
  };

  const formatDistance = (distance) => {
    if (!distance) return '';
    if (typeof distance === 'number') {
      return distance < 1
        ? `${Math.round(distance * 1000)} m`
        : `${distance.toFixed(1)} km`;
    }
    return distance;
  };

  return (
    <div
      className={`user-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}             
    >
      {/* Image Section */}
      <div className="user-image">
        {userData.image ? (
          <img src={userData.image} alt={userData.name} />
        ) : (
          <div className="avatar-placeholder">{userData.initials}</div>
        )}

        {/* Overlay badges */}
        <div className="user-meta">
          {userData.compatibility && (
            <span className="math-badge">
              <FaHeart /> {userData.compatibility}% Match
            </span>
          )}
        </div>

        {/* Quick action icons on hover */}
        {isHovered && (
          <div className="quick-actions">
            <button
              className={`quick-action-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              title={isLiked ? 'Liked' : 'Like'}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
            </button>
            <button className="quick-action-btn" onClick={handleChat} title="Chat">
              <FaRegComment />
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="user-info">
        <div className="user-header">
          <div className="user-name">
            <h5>
              {userData.name} <span className="user-age">{userData.age}</span>
              {showDistance && userData.distance && (
                <span className="distance-badge">
                  ({formatDistance(userData.distance)})
                </span>
              )}
              {userData.verified && (
                <span className="verified-badge">
                  <FaCheckCircle />
                </span>
              )}
            </h5>
            <p className="user-job">
              <FaBriefcase /> {userData.job}
            </p>
          </div>
        </div>
        {userData.interests && userData.interests.length > 0 && (
          <div className="user-interests">
            {userData.interests.slice(0, 3).map((interest, index) => (
              <span key={index} className="interest-tag">
                {interest}
              </span>
            ))}
          </div>
        )}

        
        <button className="view-profile-btn" onClick={handleViewProfileClick}>
          View Profile <FaArrowRight className="btn-icon" />
        </button>
      </div>
    </div>
  );
};

UserCard.defaultProps = {
  user: {},
  onClick: null,
  onLike: null,
  onMessage: null,
  onViewProfile: null,
  showDistance: true,
  isLiked: false,
};

export default UserCard;