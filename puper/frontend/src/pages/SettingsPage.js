import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaUser, FaBell, FaLock, FaPalette, FaMapMarkerAlt,
  FaLanguage, FaMoon, FaSun, FaVolumeUp, FaVolumeMute, FaEye, FaEyeSlash
} from 'react-icons/fa';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    // Profile settings
    displayName: 'Toilet Explorer',
    username: 'toiletexplorer',
    email: 'user@example.com',
    bio: 'Helping people find the best restrooms around the world! 🚽',
    
    // Notification settings
    notifications: {
      newRestrooms: true,
      reviews: true,
      nearbyAlerts: false,
      weeklyDigest: true,
      pushNotifications: true
    },
    
    // Privacy settings
    privacy: {
      profileVisibility: 'public', // public, friends, private
      showLocation: true,
      showActivity: true,
      dataSharing: false
    },
    
    // App settings
    app: {
      theme: 'auto', // light, dark, auto
      language: 'en',
      units: 'imperial', // imperial, metric
      mapStyle: 'default',
      autoRefresh: true,
      soundEffects: true
    }
  });

  const [activeSection, setActiveSection] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const updateProfile = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save to backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const SettingSection = ({ title, icon: Icon, children, id }) => (
    <motion.div
      className={`setting-section ${activeSection === id ? 'active' : ''}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="section-header" onClick={() => setActiveSection(id)}>
        <Icon className="section-icon" />
        <h3>{title}</h3>
        <span className="section-arrow">{activeSection === id ? '▼' : '▶'}</span>
      </div>
      {activeSection === id && (
        <div className="section-content">
          {children}
        </div>
      )}
    </motion.div>
  );

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div className="setting-item">
      <div className="setting-info">
        <label className="setting-label">{label}</label>
        {description && <p className="setting-description">{description}</p>}
      </div>
      <div className="toggle-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          id={`toggle-${label}`}
        />
        <label htmlFor={`toggle-${label}`} className="toggle-slider"></label>
      </div>
    </div>
  );

  const SelectOption = ({ value, onChange, options, label, description }) => (
    <div className="setting-item">
      <div className="setting-info">
        <label className="setting-label">{label}</label>
        {description && <p className="setting-description">{description}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="setting-select"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const TextInput = ({ value, onChange, label, type = 'text', placeholder }) => (
    <div className="setting-item">
      <label className="setting-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="setting-input"
      />
    </div>
  );

  return (
    <motion.div
      className="settings-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft />
          </button>
          <h1>Settings</h1>
          <button onClick={handleSave} className="save-button">
            Save
          </button>
        </div>

        {/* Settings Sections */}
        <div className="settings-content">
          <SettingSection
            title="Profile"
            icon={FaUser}
            id="profile"
          >
            <TextInput
              label="Display Name"
              value={settings.displayName}
              onChange={(value) => updateProfile('displayName', value)}
              placeholder="Enter your display name"
            />
            <TextInput
              label="Username"
              value={settings.username}
              onChange={(value) => updateProfile('username', value)}
              placeholder="Enter your username"
            />
            <TextInput
              label="Email"
              value={settings.email}
              onChange={(value) => updateProfile('email', value)}
              type="email"
              placeholder="Enter your email"
            />
            <div className="setting-item">
              <label className="setting-label">Bio</label>
              <textarea
                value={settings.bio}
                onChange={(e) => updateProfile('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                className="setting-textarea"
                rows="3"
              />
            </div>
            <div className="setting-item">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="password-button"
              >
                Change Password
              </button>
              {showPasswordForm && (
                <div className="password-form">
                  <TextInput
                    label="Current Password"
                    type="password"
                    placeholder="Enter current password"
                  />
                  <TextInput
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                  />
                  <TextInput
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>
              )}
            </div>
          </SettingSection>

          <SettingSection
            title="Notifications"
            icon={FaBell}
            id="notifications"
          >
            <ToggleSwitch
              label="New Restrooms"
              description="Get notified when new restrooms are added near you"
              checked={settings.notifications.newRestrooms}
              onChange={(value) => updateSetting('notifications', 'newRestrooms', value)}
            />
            <ToggleSwitch
              label="Reviews & Ratings"
              description="Get notified about new reviews on restrooms you've rated"
              checked={settings.notifications.reviews}
              onChange={(value) => updateSetting('notifications', 'reviews', value)}
            />
            <ToggleSwitch
              label="Nearby Alerts"
              description="Get alerts when you're near highly-rated restrooms"
              checked={settings.notifications.nearbyAlerts}
              onChange={(value) => updateSetting('notifications', 'nearbyAlerts', value)}
            />
            <ToggleSwitch
              label="Weekly Digest"
              description="Receive a weekly summary of your activity"
              checked={settings.notifications.weeklyDigest}
              onChange={(value) => updateSetting('notifications', 'weeklyDigest', value)}
            />
            <ToggleSwitch
              label="Push Notifications"
              description="Allow push notifications on your device"
              checked={settings.notifications.pushNotifications}
              onChange={(value) => updateSetting('notifications', 'pushNotifications', value)}
            />
          </SettingSection>

          <SettingSection
            title="Privacy & Security"
            icon={FaLock}
            id="privacy"
          >
            <SelectOption
              label="Profile Visibility"
              description="Who can see your profile and activity"
              value={settings.privacy.profileVisibility}
              onChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
              options={[
                { value: 'public', label: 'Public' },
                { value: 'friends', label: 'Friends Only' },
                { value: 'private', label: 'Private' }
              ]}
            />
            <ToggleSwitch
              label="Show Location"
              description="Allow others to see your general location"
              checked={settings.privacy.showLocation}
              onChange={(value) => updateSetting('privacy', 'showLocation', value)}
            />
            <ToggleSwitch
              label="Show Activity"
              description="Display your recent reviews and contributions"
              checked={settings.privacy.showActivity}
              onChange={(value) => updateSetting('privacy', 'showActivity', value)}
            />
            <ToggleSwitch
              label="Data Sharing"
              description="Help improve the app by sharing anonymous usage data"
              checked={settings.privacy.dataSharing}
              onChange={(value) => updateSetting('privacy', 'dataSharing', value)}
            />
          </SettingSection>

          <SettingSection
            title="App Preferences"
            icon={FaPalette}
            id="app"
          >
            <SelectOption
              label="Theme"
              description="Choose your preferred theme"
              value={settings.app.theme}
              onChange={(value) => updateSetting('app', 'theme', value)}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'auto', label: 'Auto (System)' }
              ]}
            />
            <SelectOption
              label="Language"
              description="Select your preferred language"
              value={settings.app.language}
              onChange={(value) => updateSetting('app', 'language', value)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'fr', label: 'Français' },
                { value: 'de', label: 'Deutsch' }
              ]}
            />
            <SelectOption
              label="Units"
              description="Choose your preferred measurement units"
              value={settings.app.units}
              onChange={(value) => updateSetting('app', 'units', value)}
              options={[
                { value: 'imperial', label: 'Imperial (miles, feet)' },
                { value: 'metric', label: 'Metric (kilometers, meters)' }
              ]}
            />
            <SelectOption
              label="Map Style"
              description="Choose your preferred map appearance"
              value={settings.app.mapStyle}
              onChange={(value) => updateSetting('app', 'mapStyle', value)}
              options={[
                { value: 'default', label: 'Default' },
                { value: 'satellite', label: 'Satellite' },
                { value: 'terrain', label: 'Terrain' },
                { value: 'dark', label: 'Dark Mode' }
              ]}
            />
            <ToggleSwitch
              label="Auto Refresh"
              description="Automatically refresh restroom data"
              checked={settings.app.autoRefresh}
              onChange={(value) => updateSetting('app', 'autoRefresh', value)}
            />
            <ToggleSwitch
              label="Sound Effects"
              description="Play sounds for app interactions"
              checked={settings.app.soundEffects}
              onChange={(value) => updateSetting('app', 'soundEffects', value)}
            />
          </SettingSection>

          <SettingSection
            title="Location & Maps"
            icon={FaMapMarkerAlt}
            id="location"
          >
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Location Services</label>
                <p className="setting-description">Manage location permissions and accuracy</p>
              </div>
              <button className="location-button">
                Manage Location Settings
              </button>
            </div>
            <ToggleSwitch
              label="High Accuracy Mode"
              description="Use GPS for more precise location tracking"
              checked={true}
              onChange={() => {}}
            />
            <ToggleSwitch
              label="Background Location"
              description="Allow location access when app is in background"
              checked={false}
              onChange={() => {}}
            />
          </SettingSection>
        </div>

        {/* Footer Actions */}
        <div className="settings-footer">
          <button className="danger-button">
            Delete Account
          </button>
          <button className="secondary-button">
            Export Data
          </button>
          <button className="secondary-button">
            Sign Out
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
