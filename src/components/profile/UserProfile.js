import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FaUser,
  FaImages,
  FaComment,
  FaHeart,
  FaStar,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import UserAvatar from '../common/UserAvatar';
import Loading from '../common/Loading';
import './styles/Profile.css';

const extractAllImages = (user) => {
  const urls = [];
  if (Array.isArray(user?.photos)) {
    urls.push(...user.photos.map((p) => p?.image_url).filter(Boolean));
  }
  if (Array.isArray(user?.images)) {
    urls.push(...user.images);
  }
  const single = user?.profile_image || user?.profile_picture || user?.image;
  if (single) urls.push(single);
  const unique = Array.from(new Set(urls.filter(Boolean)));

  if (unique.length === 0) {
    
    return [
      {
        id: 'fallback',
        color: 'linear-gradient(135deg, #003A8F, #60a5fa)',
        isGradient: true,
      },
    ];
  }

  return unique.map((url) => ({ url, id: url }));
};

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState('details'); 
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  useEffect(() => {
    if (user) {
      setImages(extractAllImages(user));
      setLoading(false);
      return;
    }

    const loadUserProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/users/${userId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Profile not found');
        const data = await res.json();
        setUser(data);
        setImages(extractAllImages(data));
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Profile not found');
        setUser(null);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, user]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Escape') closePhotoViewer();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex]);

  const handleStartConversation = async () => {
    if (!user) return;
    navigate('/messages/new', { state: { user } });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const openPhotoViewer = (index) => setSelectedPhotoIndex(index);
  const closePhotoViewer = () => setSelectedPhotoIndex(null);
  const goToNext = () => {
    setSelectedPhotoIndex((prev) => (prev + 1) % images.length);
  };
  const goToPrev = () => {
    setSelectedPhotoIndex((prev) =>
      prev - 1 < 0 ? images.length - 1 : prev - 1
    );
  };

  const renderDetailsTab = () => (
    <div className="profile-tab-content">
      {/* BIO */}
      <div className="profile-bio-section">
        <h3>About Me</h3>
        <p className="bio-text">
          {user.bio || "This user hasn't added a bio yet."}
        </p>
      </div>

      {/* DETAILS */}
      <div className="profile-details-section">
        <h3>Details</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Age</span>
            <span className="detail-value">{user.age || '—'}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Gender</span>
            <span className="detail-value">{user.gender || '—'}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Location</span>
            <span className="detail-value">{user.location || '—'}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Occupation</span>
            <span className="detail-value">{user.job || '—'}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Relationship Goal</span>
            <span className="detail-value">
              {user.relationshipGoal || '—'}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Personality</span>
            <span className="detail-value">
              {user.personality || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* INTERESTS */}
      {user.interests && user.interests.length > 0 && (
        <div className="profile-interests-section">
          <h3>Interests</h3>
          <div className="interests-grid">
            {user.interests.map((interest, index) => (
              <div key={index} className="interest-item">
                {interest}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPhotosTab = () => (
    <div className="photos-tab-content">
      <div className="photos-grid">
        {images.map((img, index) => (
          <div
            key={img.id || index}
            className={`photo-item ${img.url ? 'clickable' : ''}`}
            onClick={img.url ? () => openPhotoViewer(index) : undefined}
          >
            <div
              className="photo-preview"
              style={
                img.isGradient
                  ? { background: img.color }
                  : {
                      backgroundImage: `url(${img.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
              }
            >
              {index === 0 && (
                <div className="primary-badge">
                  <FaStar /> Primary
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="photos-info">
          <p>No photos available.</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="profile-page">
        <Loading message="Loading profile..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <h2>Profile not found</h2>
          <p>The user profile could not be loaded.</p>
          <button className="back-btn" onClick={handleBackClick}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page user-profile">
      {/* HEADER */}
      <div className="profile-header">
        <div className="header-left">
          <div className="profile-avatar-large">
            <UserAvatar user={user} size={80} />
          </div>

          <div className="profile-info">
            <h1>
              {user.name}
              {user.age ? `, ${user.age}` : ''}
            </h1>
            <p>
              {user.job || '—'} · {user.location || '—'}
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-primary icon-only"
            onClick={handleStartConversation}
            aria-label="Start chat"
          >
            <FaComment />
          </button>
          <button
            className="btn btn-secondary icon-only"
            onClick={() => alert('Like functionality goes here')}
            aria-label="Like this user"
          >
            <FaHeart />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="profile-tabs">
        <div className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <FaUser /> Details
          </button>
          <button
            className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            <FaImages /> Photos ({images.length})
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'details' ? renderDetailsTab() : renderPhotosTab()}
        </div>
      </div>

      {/* PHOTO VIEWER MODAL */}
      {selectedPhotoIndex !== null && images[selectedPhotoIndex]?.url && (
        <div className="photo-viewer-overlay" onClick={closePhotoViewer}>
          <div
            className="photo-viewer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="photo-viewer-close"
              onClick={closePhotoViewer}
              aria-label="Close viewer"
            >
              <FaTimes />
            </button>
            <button
              className="photo-viewer-nav prev"
              onClick={goToPrev}
              aria-label="Previous photo"
            >
              <FaChevronLeft />
            </button>
            <img
              src={images[selectedPhotoIndex].url}
              alt={`User photo ${selectedPhotoIndex + 1}`}
            />
            <button
              className="photo-viewer-nav next"
              onClick={goToNext}
              aria-label="Next photo"
            >
              <FaChevronRight />
            </button>
            <div className="photo-counter">
              {selectedPhotoIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;