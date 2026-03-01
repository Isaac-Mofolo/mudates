import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { API_ENDPOINTS, fetchJSON, fetchFormData } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

import {
  FaCamera,
  FaBriefcase,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaArrowRight,
  FaArrowLeft,
  FaCheck,
  FaSpinner,
  FaHeart,
  FaRocket,
  FaTimes
} from 'react-icons/fa';
import './styles/Profile.css';

// Helper function to create a cropped image as a File
const createCroppedImage = async (imageSrc, cropArea) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Desired output size (square). Adjust as needed.
  const size = 500;
  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', 0.95);
  });
};

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });

// List of Malawian schools
const MALAWI_SCHOOLS = [
  "University of Malawi",
  "Malawi University of Business and Applied Sciences (MUBAS)",
  "Lilongwe University of Agriculture and Natural Resources (LUANAR)",
  "Mzuzu University",
  "Malawi University of Science and Technology (MUST)",
  "Catholic University of Malawi",
  "University of Livingstonia",
  "African Bible College",
  "Malawi College of Health Sciences",
  "DMI St. John the Baptist University",
  "Other"
];

const ProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Crop modal state
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Student/Employed fields
  const [occupationType, setOccupationType] = useState(null); // 'student' or 'employed'
  const [school, setSchool] = useState('');
  const [schoolOther, setSchoolOther] = useState('');
  const [workplace, setWorkplace] = useState('');

  const [basicInfo, setBasicInfo] = useState({
    bio: '',
    education: '',
    location: '',
    avatar: null,
    avatarPreview: null
  });

  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  const [personality, setPersonality] = useState('');
  // Relationship goals is now a single string (radio), not an array
  const [relationshipGoal, setRelationshipGoal] = useState('');

  const { user } = useAuth();

  const [preferences, setPreferences] = useState(() => {
    let initialLookingFor = [];
    if (user?.gender === 'male') {
      initialLookingFor = ['women'];
    } else if (user?.gender === 'female') {
      initialLookingFor = ['men'];
    } else {
      initialLookingFor = ['men', 'women'];
    }
    return {
      ageRange: { min: 25, max: 40 },
      maxDistance: 30,
      lookingFor: initialLookingFor,
      notifications: true,
      discoverable: true
    };
  });

  const navigate = useNavigate();
  const { updateUser, token } = useAuth();

  const progressPercentage = ((currentStep - 1) / 2) * 100;

  const stepConfig = {
    1: {
      title: 'Tell Us About Yourself',
      description: "Let's start with the basics to create your profile"
    },
    2: {
      title: 'Your Interests & Goals',
      description: 'What are you passionate about and what are you looking for?'
    },
    3: {
      title: 'Your Preferences',
      description: 'Set your preferences for potential matches'
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBasicInfo({
        ...basicInfo,
        avatar: file,
        avatarPreview: reader.result
      });
      setShowCropModal(true);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      if (!croppedAreaPixels) return;

      const croppedFile = await createCroppedImage(
        basicInfo.avatarPreview,
        croppedAreaPixels
      );

      const croppedPreview = URL.createObjectURL(croppedFile);
      setBasicInfo(prev => ({
        ...prev,
        avatar: croppedFile,
        avatarPreview: croppedPreview
      }));

      setShowCropModal(false);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (err) {
      console.error('Cropping failed:', err);
      setError('Failed to crop image. Please try again.');
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setBasicInfo(prev => ({ ...prev, avatar: null, avatarPreview: null }));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleBioChange = (e) => {
    setBasicInfo({
      ...basicInfo,
      bio: e.target.value
    });
  };

  const handleInterestInput = (e) => {
    setNewInterest(e.target.value);
  };

  const handleInterestKeyDown = (e) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      e.preventDefault();
      const trimmedInterest = newInterest.trim().toLowerCase();
      if (!interests.includes(trimmedInterest) && interests.length < 20) {
        setInterests([...interests, trimmedInterest]);
        setNewInterest('');
      }
    }
  };

  const removeInterest = (interestToRemove) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  // Relationship goal is now set directly (radio)
  const handleRelationshipGoalChange = (goal) => {
    setRelationshipGoal(goal);
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences({
      ...preferences,
      [key]: value
    });
  };

  const handleLookingForChange = (value) => {
    const current = [...preferences.lookingFor];
    if (current.includes(value)) {
      handlePreferenceChange('lookingFor', current.filter(item => item !== value));
    } else {
      handlePreferenceChange('lookingFor', [...current, value]);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipProfileSetup = () => {
    navigate('/');
  };

  const completeProfile = async () => {
    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }
    if (!basicInfo.bio.trim()) {
      setError('Please add a bio about yourself');
      return;
    }
    if (!occupationType) {
      setError('Please indicate whether you are a student or employed');
      return;
    }
    if (occupationType === 'student' && !school) {
      setError('Please select your school');
      return;
    }
    if (occupationType === 'student' && school === 'Other' && !schoolOther.trim()) {
      setError('Please enter your school name');
      return;
    }
    if (occupationType === 'employed' && !workplace.trim()) {
      setError('Please enter your workplace');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build occupation string
      let occupationValue = '';
      if (occupationType === 'student') {
        const schoolName = school === 'Other' ? schoolOther.trim() : school;
        occupationValue = `Student at ${schoolName}`;
      } else if (occupationType === 'employed') {
        occupationValue = workplace.trim();
      }
      const profileData = {
        age: user.age,          
        gender: user.gender,    
        bio: basicInfo.bio.trim(),
        occupation: occupationValue,
        education: basicInfo.education?.trim() || '',
        location: basicInfo.location?.trim() || '',
        interests,
        personality,
        relationship_goal: relationshipGoal, 
        age_min: preferences.ageRange.min,
        age_max: preferences.ageRange.max,
        max_distance: preferences.maxDistance,
        looking_for: preferences.lookingFor,
        notifications: preferences.notifications,
        discoverable: preferences.discoverable,
        profile_complete: true,
      };

      console.log('Submitting profile data:', profileData); // Debug log

      const profileResponse = await fetchJSON(
        API_ENDPOINTS.PROFILE,
        {
          method: 'PUT',
          body: JSON.stringify(profileData),
        },
        token
      );

      // 2. If there's an avatar, upload it
      if (basicInfo.avatar) {
        const photoFormData = new FormData();
        photoFormData.append('image', basicInfo.avatar);
        
        await fetchFormData(
          API_ENDPOINTS.UPLOAD_PHOTO,
          photoFormData,
          { method: 'POST' },
          token
        );
      }

      // 3. Update auth context
      const finalUserData = profileResponse.user || profileResponse;
      updateUser(finalUserData);

      setCurrentStep(4);
    } catch (error) {
      console.error('Profile setup error:', error);
      // Show the actual error message from the backend if available
      setError(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startExploring = () => {
    navigate('/');
  };

  // Step 1 renderer
  const renderStep1 = () => (
    <div className="form-step active">
      {error && (
        <div className="form-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Profile Photo</label>
        <div className="avatar-upload">
          <div className="avatar-preview">
            {basicInfo.avatarPreview ? (
              <img src={basicInfo.avatarPreview} alt="Profile preview" />
            ) : (
              <span>Y</span>
            )}
          </div>
          <input
            type="file"
            id="avatarUpload"
            className="hidden-file-input"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={loading || showCropModal}
          />
          <button
            type="button"
            className="avatar-upload-button"
            onClick={() => document.getElementById('avatarUpload').click()}
            disabled={loading || showCropModal}
          >
            <FaCamera />
            {basicInfo.avatarPreview ? 'Change Photo' : 'Upload Photo'}
          </button>
        </div>
        <div className="form-hint">Upload a clear photo of yourself for better matches (Max 5MB)</div>
      </div>

      <div className="form-group">
        <label className="form-label">I am a...</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="radio"
              name="occupationType"
              value="student"
              checked={occupationType === 'student'}
              onChange={() => {
                setOccupationType('student');
                setSchool('');
                setSchoolOther('');
                setWorkplace('');
              }}
              disabled={loading}
            />
            <span>Student</span>
          </label>
          <label className="checkbox-label">
            <input
              type="radio"
              name="occupationType"
              value="employed"
              checked={occupationType === 'employed'}
              onChange={() => {
                setOccupationType('employed');
                setSchool('');
                setSchoolOther('');
                setWorkplace('');
              }}
              disabled={loading}
            />
            <span>Employed</span>
          </label>
        </div>
      </div>

      {occupationType === 'student' && (
        <div className="form-group">
          <label className="form-label">School / University</label>
          <select
            className="form-input"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            disabled={loading}
          >
            <option value="">Select your institution</option>
            {MALAWI_SCHOOLS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {school === 'Other' && (
            <input
              type="text"
              className="form-input"
              placeholder="Enter your school name"
              value={schoolOther}
              onChange={(e) => setSchoolOther(e.target.value)}
              disabled={loading}
              style={{ marginTop: '10px' }}
            />
          )}
        </div>
      )}

      {occupationType === 'employed' && (
        <div className="form-group">
          <label className="form-label">Workplace</label>
          <div className="input-with-icon">
            <FaBriefcase className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Where do you work?"
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="profileBio">Bio *</label>
        <textarea
          id="profileBio"
          className="form-textarea"
          placeholder="Tell others about yourself, your interests, and what you're looking for..."
          maxLength="500"
          value={basicInfo.bio}
          onChange={handleBioChange}
          disabled={loading}
          required
        />
        <div className="form-hint">{basicInfo.bio.length}/500 characters</div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="profileLocation">Location</label>
        <div className="input-with-icon">
          <FaMapMarkerAlt className="input-icon" />
          <input
            type="text"
            id="profileLocation"
            className="form-input"
            placeholder="City, Country"
            value={basicInfo.location}
            onChange={(e) => setBasicInfo({...basicInfo, location: e.target.value})}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="auth-button secondary"
          onClick={skipProfileSetup}
          disabled={loading}
        >
          Skip for now
        </button>
        <button
          type="button"
          className="auth-button"
          onClick={nextStep}
          disabled={loading || !basicInfo.bio.trim() || !occupationType}
        >
          Continue <FaArrowRight />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      {error && (
        <div className="form-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Your Interests</label>
        <div className="form-hint">Add interests that describe you (e.g., hiking, photography, cooking)</div>
        <div className="tags-input-container">
          {interests.map((interest, index) => (
            <span key={index} className="tag">
              {interest}
              <button
                type="button"
                className="tag-remove"
                onClick={() => removeInterest(interest)}
                disabled={loading}
              >
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            className="tags-input"
            placeholder="Type an interest and press Enter"
            value={newInterest}
            onChange={handleInterestInput}
            onKeyDown={handleInterestKeyDown}
            disabled={loading || interests.length >= 20}
          />
        </div>
        <div className="checkbox-group">
          {['hiking', 'photography', 'cooking', 'reading', 'travel', 'music', 'fitness', 'art'].map((interest) => (
            <label key={interest} className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                value={interest}
                checked={interests.includes(interest)}
                onChange={(e) => {
                  if (e.target.checked && interests.length < 20) {
                    setInterests([...interests, interest]);
                  } else if (!e.target.checked) {
                    removeInterest(interest);
                  }
                }}
                disabled={loading}
              />
              <span>{interest.charAt(0).toUpperCase() + interest.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Personality Type</label>
        <div className="checkbox-group">
          {['introvert', 'extrovert', 'ambivert'].map((type) => (
            <label key={type} className="checkbox-label">
              <input
                type="radio"
                name="personality"
                className="checkbox-input"
                value={type}
                checked={personality === type}
                onChange={(e) => setPersonality(e.target.value)}
                disabled={loading}
              />
              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Relationship Goal</label>
        <div className="checkbox-group">
          {['long-term', 'casual', 'friendship', 'marriage'].map((goal) => (
            <label key={goal} className="checkbox-label">
              <input
                type="radio"
                name="relationshipGoal"
                className="checkbox-input"
                value={goal}
                checked={relationshipGoal === goal}
                onChange={() => handleRelationshipGoalChange(goal)}
                disabled={loading}
              />
              <span>
                {goal === 'long-term' ? 'Long-term relationship' :
                 goal === 'friendship' ? 'New friends' :
                 goal.charAt(0).toUpperCase() + goal.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="auth-button secondary"
          onClick={prevStep}
          disabled={loading}
        >
          <FaArrowLeft /> Back
        </button>
        <button
          type="button"
          className="auth-button"
          onClick={nextStep}
          disabled={loading}
        >
          Continue <FaArrowRight />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      {error && (
        <div className="form-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Age Range of Potential Matches</label>
        <div className="range-container">
          <input
            type="range"
            min="18"
            max="60"
            value={preferences.ageRange.min}
            className="range-slider"
            onChange={(e) => handlePreferenceChange('ageRange', {
              ...preferences.ageRange,
              min: parseInt(e.target.value)
            })}
            disabled={loading}
          />
          <input
            type="range"
            min="18"
            max="60"
            value={preferences.ageRange.max}
            className="range-slider"
            onChange={(e) => handlePreferenceChange('ageRange', {
              ...preferences.ageRange,
              max: parseInt(e.target.value)
            })}
            disabled={loading}
          />
          <div className="range-values">
            <span>{preferences.ageRange.min}</span>
            <span>{preferences.ageRange.max}</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Maximum Distance (km)</label>
        <div className="range-container">
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={preferences.maxDistance}
            className="range-slider"
            onChange={(e) => handlePreferenceChange('maxDistance', parseInt(e.target.value))}
            disabled={loading}
          />
          <div className="range-values">
            <span>5 km</span>
            <span>{preferences.maxDistance} km</span>
            <span>100 km</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Looking For</label>
        <div className="checkbox-group">
          {['men', 'women'].map((gender) => (
            <label key={gender} className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                value={gender}
                checked={preferences.lookingFor.includes(gender)}
                onChange={() => handleLookingForChange(gender)}
                disabled={loading}
              />
              <span>{gender === 'men' ? 'Men' : 'Women'}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            className="checkbox-input"
            checked={preferences.notifications}
            onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
            disabled={loading}
          />
          <span>Send me match notifications</span>
        </label>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="auth-button secondary"
          onClick={prevStep}
          disabled={loading}
        >
          <FaArrowLeft /> Back
        </button>
        <button
          type="button"
          className="auth-button"
          onClick={completeProfile}
          disabled={loading}
        >
          {loading ? (
            <FaSpinner className="fa-spin" />
          ) : (
            <FaCheck />
          )}
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </div>
    </div>
  );

  const renderWelcomeScreen = () => (
    <div className="welcome-screen">
      <div className="welcome-icon">
        <FaHeart />
      </div>
      <h1>Welcome to Mdates!</h1>
      <p>Your profile is complete and you're ready to start your journey to find meaningful connections.</p>
      <button
        className="auth-button"
        onClick={startExploring}
      >
        <FaRocket /> Start Exploring
      </button>
    </div>
  );

  // Main render
  return (
    <div className="app-container">
      {/* Crop Modal */}
      {showCropModal && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <div className="crop-modal-header">
              <h3>Crop your profile picture</h3>
              <button className="crop-modal-close" onClick={handleCropCancel}>
                <FaTimes />
              </button>
            </div>
            <div className="crop-container">
              <Cropper
                image={basicInfo.avatarPreview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round" 
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="crop-controls">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="zoom-slider"
              />
              <div className="crop-actions">
                <button className="auth-button secondary" onClick={handleCropCancel}>
                  Cancel
                </button>
                <button className="auth-button" onClick={handleCropSave}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 4 ? (
        renderWelcomeScreen()
      ) : (
        <div className="auth-page" id="profileCreationPage">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">M</div>
              <h1>Mdates</h1>
            </div>
            <div className="progress-steps">
              <div className="progress-line"></div>
              <div
                className="progress-line-filled"
                style={{ width: `${progressPercentage}%` }}
              ></div>

              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`step ${step < currentStep ? 'completed' : ''} ${step === currentStep ? 'active' : ''}`}
                >
                  <div className="step-circle">
                    {step < currentStep ? '✓' : step}
                  </div>
                  <div className="step-label">
                    {step === 1 ? 'Basic Info' : step === 2 ? 'Interests' : 'Preferences'}
                  </div>
                </div>
              ))}
            </div>

            <h2>{stepConfig[currentStep].title}</h2>
            <p>{stepConfig[currentStep].description}</p>
          </div>

          <form className="auth-form">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileSetup;