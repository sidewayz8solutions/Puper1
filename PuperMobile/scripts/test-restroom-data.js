#!/usr/bin/env node

/**
 * Test Restroom Data Script
 * 
 * This script tests that we can fetch the imported restroom data
 * and that it's compatible with our mobile app
 */

import { restroomService } from '../services/supabase.js';

console.log('🚽 Testing Püper Restroom Data');
console.log('==============================');

async function testRestroomData() {
  try {
    console.log('\n📍 Testing nearby restrooms fetch...');
    
    // Test with New Orleans coordinates (where our sample data is centered)
    const lat = 29.9511;
    const lon = -90.0715;
    const radius = 50000; // 50km radius
    
    console.log(`Searching around (${lat}, ${lon}) within ${radius}m radius...`);
    
    const restrooms = await restroomService.getNearby(lat, lon, radius);
    
    console.log(`✅ Found ${restrooms.length} nearby restrooms`);
    
    if (restrooms.length > 0) {
      console.log('\n📊 Sample restroom data:');
      console.log('========================');
      
      const sample = restrooms[0];
      console.log(`Name: ${sample.name || 'N/A'}`);
      console.log(`Location: ${sample.lat}, ${sample.lon || sample.lng}`);
      console.log(`Distance: ${sample.distance ? Math.round(sample.distance) + 'm' : 'N/A'}`);
      console.log(`Wheelchair Accessible: ${sample.wheelchair_accessible ? 'Yes' : 'No'}`);
      console.log(`Baby Changing: ${sample.baby_changing ? 'Yes' : 'No'}`);
      console.log(`Gender Neutral: ${sample.gender_neutral ? 'Yes' : 'No'}`);
      console.log(`Description: ${sample.description || 'N/A'}`);
      console.log(`Rating: ${sample.rating || 'N/A'}`);
      
      console.log('\n🗺️ Top 5 closest restrooms:');
      console.log('============================');
      restrooms.slice(0, 5).forEach((restroom, index) => {
        const distance = restroom.distance ? Math.round(restroom.distance) + 'm' : 'N/A';
        console.log(`${index + 1}. ${restroom.name} - ${distance}`);
      });
    } else {
      console.log('⚠️ No restrooms found in the specified area');
      console.log('This could mean:');
      console.log('- The import didn\'t work correctly');
      console.log('- There are no restrooms in the search radius');
      console.log('- There\'s an issue with the coordinates');
    }
    
    console.log('\n🔍 Testing fallback method...');
    const fallbackRestrooms = await restroomService.getNearbyFallback(lat, lon, radius);
    console.log(`✅ Fallback method found ${fallbackRestrooms.length} restrooms`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Run the test
testRestroomData();