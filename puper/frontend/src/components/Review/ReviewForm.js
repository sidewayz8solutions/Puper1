import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import StarRating from './StarRating';
import Button from '../Common/Button';
import { submitReview } from '../../services/reviews';
import toast from 'react-hot-toast';
import './ReviewForm.css';

const ReviewForm = ({ restroomId, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [ratings, setRatings] = useState({
    cleanliness: 0,
    stocked: 0,
    space: 0,
    accessibility: 0,
    overall: 0
  });
  const [additionalInfo, setAdditionalInfo] = useState({
    numberOfStalls: '',
    openingHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    isOpen24Hours: false
  });
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 3,
    onDrop: acceptedFiles => {
      setPhotos(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
    }
  });

  const onSubmit = async (data) => {
    if (Object.values(ratings).some(r => r === 0)) {
      toast.error('Please rate all categories with toilet ratings');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(ratings).forEach(key => {
        formData.append(`${key}Rating`, ratings[key]);
      });
      formData.append('comment', data.comment);
      formData.append('numberOfStalls', additionalInfo.numberOfStalls);
      formData.append('openingHours', JSON.stringify(additionalInfo.openingHours));
      formData.append('isOpen24Hours', additionalInfo.isOpen24Hours);
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      await submitReview(restroomId, formData);
      toast.success('Review submitted successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = {
    cleanliness: 'How Clean?',
    stocked: 'Well Stocked?',
    space: 'Spacious?',
    accessibility: 'Accessible?',
    overall: 'Overall Rating'
  };

  return (
    <motion.form
      className="review-form"
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>🚽 Rate this Restroom with Toilets! 🚽</h3>

      <div className="rating-categories">
        {Object.keys(ratings).map(category => (
          <div key={category} className="rating-category">
            <label>{ratingLabels[category]}</label>
            <StarRating
              value={ratings[category]}
              onChange={(value) => setRatings({...ratings, [category]: value})}
            />
            <span className="toilet-count">
              {ratings[category]} toilet{ratings[category] !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Additional Information Section */}
      <div className="additional-info-section">
        <h4>📋 Additional Information</h4>

        <div className="form-group">
          <label>Number of Stalls</label>
          <input
            type="number"
            min="1"
            max="20"
            value={additionalInfo.numberOfStalls}
            onChange={(e) => setAdditionalInfo({
              ...additionalInfo,
              numberOfStalls: e.target.value
            })}
            placeholder="How many stalls?"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={additionalInfo.isOpen24Hours}
              onChange={(e) => setAdditionalInfo({
                ...additionalInfo,
                isOpen24Hours: e.target.checked
              })}
            />
            Open 24 Hours
          </label>
        </div>

        {!additionalInfo.isOpen24Hours && (
          <div className="hours-section">
            <h5>Opening Hours</h5>
            <div className="hours-grid">
              {Object.keys(additionalInfo.openingHours).map(day => (
                <div key={day} className="hour-input">
                  <label>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                  <input
                    type="text"
                    placeholder="e.g., 9:00 AM - 5:00 PM"
                    value={additionalInfo.openingHours[day]}
                    onChange={(e) => setAdditionalInfo({
                      ...additionalInfo,
                      openingHours: {
                        ...additionalInfo.openingHours,
                        [day]: e.target.value
                      }
                    })}
                    className="form-input"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Comments (Optional)</label>
        <textarea
          {...register('comment', { maxLength: 500 })}
          placeholder="Share your experience..."
          className="form-textarea"
        />
        {errors.comment && <span className="error">Max 500 characters</span>}
      </div>

      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drop photos here or click to select (max 3)</p>
      </div>

      <div className="photo-previews">
        {photos.map((file, index) => (
          <img key={index} src={file.preview} alt="Preview" className="photo-preview" />
        ))}
      </div>

      <Button type="submit" loading={submitting} className="submit-btn">
        Submit Review
      </Button>
    </motion.form>
  );
};

export default ReviewForm;
