import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RestroomCard from './RestroomCard';
import Loading from '../Common/Loading';
import './RestroomList.css';

const RestroomList = ({ restrooms, loading, onSelect }) => {
  if (loading) {
    return <Loading />;
  }

  return (
    <motion.div 
      className="restroom-list"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <div className="restroom-list-header">
        <h3>Nearby Restrooms ({restrooms?.length || 0})</h3>
      </div>
      
      <div className="restroom-list-content">
        <AnimatePresence>
          {restrooms?.map((restroom, index) => (
            <motion.div
              key={restroom.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <RestroomCard 
                restroom={restroom} 
                onClick={() => onSelect(restroom)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RestroomList;
