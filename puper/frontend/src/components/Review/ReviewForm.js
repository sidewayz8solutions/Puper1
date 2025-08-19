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
    lighting: 0,
    supplies: 0,
    safety: 0,
    accessibility: 0
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
      toast.error('Please rate all categories');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(ratings).forEach(key => {
        formData.append(`${key}Rating`, ratings[key]);
      });
      formData.append('comment', data.comment);
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

  return (
    <motion.form 
      className="review-form"
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>Rate this Restroom</h3>
      
      <div className="rating-categories">
        {Object.keys(ratings).map(category => (
          <div key={category} className="rating-category">
            <label>{category.charAt(0).toUpperCase() + category.slice(1)}</label>
            <StarRating
              value={ratings[category]}
              onChange={(value) => setRatings({...ratings, [category]: value})}
            />
          </div>
        ))}
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
