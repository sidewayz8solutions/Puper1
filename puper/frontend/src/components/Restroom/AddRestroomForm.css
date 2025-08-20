import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FaTimes, FaMapMarkerAlt, FaWheelchair, FaBaby, FaTransgender, FaDollarSign } from 'react-icons/fa';
import { createRestroom } from '../../services/restrooms';
import Button from '../Common/Button';
import toast from 'react-hot-toast';
import './AddRestroomForm.css';

const AddRestroomForm = ({ location, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      lat: location?.lat,
      lon: location?.lon,
      wheelchair_accessible: false,
      baby_changing: false,
      gender_neutral: false,
      requires_fee: false
    }
  });

  const requiresFee = watch('requires_fee');

  // Reverse geocode to get address
  useEffect(() => {
    if (location?.lat && location?.lon) {
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lon},${location.lat}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`)
        .then(res => res.json())
        .then(data => {
          if (data.features?.[0]) {
            setAddress(data.features[0].place_name);
            setValue('address', data.features[0].place_name);
          }
        })
        .catch(err => console.error('Geocoding error:', err));
    }
  }, [location, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Format opening hours
      const openingHours = {};
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
        if (data[`${day}_open`] && data[`${day}_close`]) {
          openingHours[day] = `${data[`${day}_open`]} - ${data[`${day}_close`]}`;
        }
      });

      const restroomData = {
        name: data.name,
        description: data.description,
        address: data.address,
        lat: data.lat,
        lon: data.lon,
        wheelchair_accessible: data.wheelchair_accessible,
        baby_changing: data.baby_changing,
        gender_neutral: data.gender_neutral,
        requires_fee: data.requires_fee,
        price: data.requires_fee ? data.price : null,
        opening_hours: openingHours
      };

      await createRestroom(restroomData);
      toast.success('Restroom added successfully! +25 points earned!');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to add restroom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="add-restroom-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="add-restroom-form"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="form-header">
            <h2>Add New Restroom</h2>
            <button className="close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="form-content">
            {/* Basic Info */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label>Name *</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="e.g., Starbucks on Main St"
                />
                {errors.name && <span className="error">{errors.name.message}</span>}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  {...register('description')}
                  placeholder="Additional details about this restroom..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <div className="address-input">
                  <FaMapMarkerAlt />
                  <input
                    {...register('address')}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Loading address..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    {...register('lat', { required: true })}
                    type="number"
                    step="0.000001"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    {...register('lon', { required: true })}
                    type="number"
                    step="0.000001"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="form-section">
              <h3>Amenities & Features</h3>
              
              <div className="amenities-grid">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('wheelchair_accessible')}
                  />
                  <FaWheelchair />
                  <span>Wheelchair Accessible</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('baby_changing')}
                  />
                  <FaBaby />
                  <span>Baby Changing</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('gender_neutral')}
                  />
                  <FaTransgender />
                  <span>Gender Neutral</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('requires_fee')}
                  />
                  <FaDollarSign />
                  <span>Requires Fee</span>
                </label>
              </div>

              {requiresFee && (
                <div className="form-group">
                  <label>Fee Amount ($)</label>
                  <input
                    {...register('price', { 
                      required: requiresFee ? 'Price is required' : false,
                      min: { value: 0, message: 'Price must be positive' }
                    })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                  {errors.price && <span className="error">{errors.price.message}</span>}
                </div>
              )}
            </div>

            {/* Opening Hours */}
            <div className="form-section">
              <h3>Opening Hours (Optional)</h3>
              
              <div className="hours-grid">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <div key={day} className="hours-row">
                    <label>{day}</label>
                    <div className="hours-inputs">
                      <input
                        {...register(`${day.toLowerCase()}_open`)}
                        type="time"
                        placeholder="Open"
                      />
                      <span>to</span>
                      <input
                        {...register(`${day.toLowerCase()}_close`)}
                        type="time"
                        placeholder="Close"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
              >
                Add Restroom (+25 pts)
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddRestroomForm;