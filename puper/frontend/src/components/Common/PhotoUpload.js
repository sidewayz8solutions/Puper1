import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCamera, 
  FaTimes, 
  FaUpload, 
  FaImage, 
  FaTrash,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import authService from '../../services/auth';
import './PhotoUpload.css';

const PhotoUpload = ({ 
  restroomId, 
  onUploadComplete, 
  onUploadError,
  maxPhotos = 5,
  existingPhotos = []
}) => {
  const [photos, setPhotos] = useState(existingPhotos || []);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      onUploadError?.('Please select valid image files (max 5MB each)');
      return;
    }

    if (photos.length + validFiles.length > maxPhotos) {
      onUploadError?.(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const { url, error } = await authService.uploadRestroomPhoto(
          restroomId, 
          file, 
          authService.getCurrentUser()?.id
        );

        if (error) throw new Error(error);

        return {
          id: Date.now() + Math.random(),
          url,
          filename: file.name,
          uploadedAt: new Date().toISOString(),
          uploadedBy: authService.getCurrentUser()?.id
        };
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      const newPhotos = [...photos, ...uploadedPhotos];
      setPhotos(newPhotos);
      onUploadComplete?.(newPhotos);
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const removePhoto = (photoId) => {
    const newPhotos = photos.filter(photo => photo.id !== photoId);
    setPhotos(newPhotos);
    onUploadComplete?.(newPhotos);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="photo-upload">
      <div className="photo-upload-header">
        <h3>Restroom Photos</h3>
        <p>Upload photos to support your rating (max {maxPhotos} photos)</p>
      </div>

      {/* Upload Area */}
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        <div className="upload-content">
          {uploading ? (
            <div className="upload-loading">
              <div className="loading-spinner" />
              <p>Uploading photos...</p>
            </div>
          ) : (
            <>
              <FaCamera className="upload-icon" />
              <p className="upload-text">
                {dragActive ? 'Drop photos here' : 'Click or drag photos here'}
              </p>
              <p className="upload-hint">
                Supports JPG, PNG, GIF (max 5MB each)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      <AnimatePresence>
        {photos.length > 0 && (
          <motion.div
            className="photo-grid"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                className="photo-item"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="photo-wrapper">
                  <img
                    src={photo.url}
                    alt={`Restroom photo ${index + 1}`}
                    className="photo-image"
                  />
                  <button
                    className="remove-photo"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(photo.id);
                    }}
                    title="Remove photo"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="photo-info">
                  <p className="photo-filename">{photo.filename}</p>
                  <p className="photo-date">
                    {new Date(photo.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Guidelines */}
      <div className="upload-guidelines">
        <h4>Photo Guidelines</h4>
        <ul>
          <li>
            <FaCheckCircle className="guideline-icon" />
            Show the overall cleanliness and condition
          </li>
          <li>
            <FaCheckCircle className="guideline-icon" />
            Include amenities like soap, paper towels, etc.
          </li>
          <li>
            <FaCheckCircle className="guideline-icon" />
            Avoid photos of people or private areas
          </li>
          <li>
            <FaExclamationCircle className="guideline-icon warning" />
            Photos help other users make informed decisions
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoUpload;
