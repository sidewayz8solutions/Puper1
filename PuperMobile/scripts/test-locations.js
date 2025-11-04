#!/usr/bin/env node

/**
 * Test Restroom Search at Various Locations
 */

import { restroomService } from '../services/supabase.js';

console.log('🌍 Testing Restroom Search at Various Locations');
console.log('===============================================');

async function testLocations() {
  const testCases = [
    { name: "New York City", lat: 40.7128, lon: -74.0060 },
    { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
    { name: "Chicago", lat: 41.8781, lon: -87.6298 },
    { name: "Miami", lat: 25.7617, lon: -80.1918 },
    { name: "New Orleans", lat: 29.9511, lon: -90.0715 },
    { name: "Orlando (near one of our restrooms)", lat: 28.2488, lon: -81.3127 }
  ];
  
  for (const location of testCases) {
    console.log(`\n📍 Testing ${location.name} (${location.lat}, ${location.lon})`);
    console.log('='.repeat(50));
    
    try {
      // Use a larger radius to catch more restrooms
      const restrooms = await restroomService.getNearbyFallback(location.lat, location.lon, 100000); // 100km
      console.log(`✅ Found ${restrooms.length} restrooms within 100km`);
      
      if (restrooms.length > 0) {
        console.log('\nTop 3 closest:');
        restrooms.slice(0, 3).forEach((r, i) => {
          const distance = r.distance ? `${(r.distance / 1000).toFixed(1)}km` : 'N/A';
          console.log(`  ${i+1}. ${r.name} - ${distance}`);
        });
      }
    } catch (error) {
      console.error(`❌ Error testing ${location.name}:`, error.message);
    }
  }
  
  // Also test with a very large radius to see what's available globally
  console.log(`\n🌎 Global search (very large radius)`);
  console.log('='.repeat(50));
  
  try {
    const globalRestrooms = await restroomService.getNearbyFallback(0, 0, 20000000); // 20,000km (covers whole earth)
    console.log(`✅ Found ${globalRestrooms.length} restrooms globally`);
    
    if (globalRestrooms.length > 0) {
      console.log('\nSample locations:');
      globalRestrooms.slice(0, 5).forEach((r, i) => {
        console.log(`  ${i+1}. ${r.name} at ${r.lat}, ${r.lon}`);
      });
    }
  } catch (error) {
    console.error('❌ Error in global search:', error.message);
  }
}

testLocations();