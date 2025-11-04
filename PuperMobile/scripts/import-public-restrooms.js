#!/usr/bin/env node

/**
 * Import Public Restrooms Script
 * 
 * This script will:
 * 1. Delete all existing restrooms from the database
 * 2. Fetch public restroom data from APIs
 * 3. Import the new data into our Supabase database
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration (same as mobile app)
const supabaseUrl = 'https://qunaiicjcelvdunluwqh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bmFpaWNqY2VsdmR1bmx1d3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NjA4NjEsImV4cCI6MjA2OTMzNjg2MX0.rFXwY95lvcXZEds7f16KodwhfnGHQBp7GsV4WTFQHjI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Yelp Fusion API - Business search API that can find restaurants/cafes with restrooms
const YELP_API_BASE = 'https://api.yelp.com/v3/businesses/search';
const YELP_API_KEY = process.env.YELP_API_KEY || 'YOUR_YELP_API_KEY_HERE'; // Would need to be set

// OpenStreetMap Overpass API - For additional public restroom data
const OSM_OVERPASS_BASE = 'https://overpass-api.de/api/interpreter';

console.log('🚽 Püper Public Restroom Import Script');
console.log('=====================================');

/**
 * Delete all existing restrooms from the database
 */
async function deleteAllRestrooms() {
  console.log('\n🗑️ Deleting all existing restrooms...');
  
  try {
    // First, delete all reviews (foreign key constraint)
    const { error: reviewsError } = await supabase
      .from('reviews')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible UUID)
    
    if (reviewsError) {
      console.error('Error deleting reviews:', reviewsError);
    } else {
      console.log('✅ All reviews deleted');
    }
    
    // Then delete all restrooms
    const { error: restroomsError } = await supabase
      .from('restrooms')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible UUID)
    
    if (restroomsError) {
      console.error('Error deleting restrooms:', restroomsError);
      throw restroomsError;
    }
    
    console.log('✅ All existing restrooms deleted successfully');
  } catch (error) {
    console.error('❌ Failed to delete existing restrooms:', error);
    throw error;
  }
}

/**
 * Fetch businesses from Yelp Fusion API
 * We'll search for restaurants, cafes, and stores that likely have public restrooms
 */
async function fetchYelpBusinesses(options = {}) {
  console.log('\n🍽️ Fetching businesses from Yelp Fusion API...');

  if (!YELP_API_KEY || YELP_API_KEY === 'YOUR_YELP_API_KEY_HERE') {
    console.log('⚠️ No Yelp API key provided, skipping Yelp integration');
    console.log('ℹ️ To use Yelp API, set YELP_API_KEY environment variable');
    return [];
  }

  const {
    term = 'restaurants OR cafes OR coffee OR fast food OR grocery',
    location = 'New Orleans, LA',
    latitude = null,
    longitude = null,
    radius = 40000, // 40km in meters
    limit = 50,
    offset = 0
  } = options;

  const params = new URLSearchParams();

  if (term) params.append('term', term);
  if (location) params.append('location', location);
  if (latitude && longitude) {
    params.append('latitude', latitude.toString());
    params.append('longitude', longitude.toString());
  }
  if (radius) params.append('radius', radius.toString());
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const url = `${YELP_API_BASE}?${params}`;
  console.log(`Requesting: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${YELP_API_KEY}`,
        'User-Agent': 'Puper App Import Script'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Yelp API Error (${response.status}):`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.businesses?.length || 0} businesses from Yelp API`);
    return data.businesses || [];
  } catch (error) {
    console.error('❌ Failed to fetch from Yelp API:', error.message);
    return [];
  }
}

/**
 * Fetch public restrooms from OpenStreetMap Overpass API
 * This provides additional public restroom data with accessibility info
 */
async function fetchOSMRestrooms(options = {}) {
  console.log('\n🗺️ Fetching public restrooms from OpenStreetMap...');

  const {
    latitude = 29.9511,
    longitude = -90.0715,
    radius = 5000, // 5km radius in meters
    limit = 100
  } = options;

  // Convert radius from meters to degrees (rough approximation)
  const radiusDegrees = radius / 111000;

  // Overpass QL query to find amenities tagged as toilets
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="toilets"](around:${radius},${latitude},${longitude});
      way["amenity"="toilets"](around:${radius},${latitude},${longitude});
      relation["amenity"="toilets"](around:${radius},${latitude},${longitude});
    );
    out center meta;
  `;

  try {
    const response = await fetch(OSM_OVERPASS_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Puper App Import Script'
      },
      body: new URLSearchParams({ data: query.trim() })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OSM API Error (${response.status}):`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Fetched ${data.elements?.length || 0} restrooms from OSM`);

    // Transform OSM data to our format
    return (data.elements || [])
      .filter(element => element.type === 'node' || element.center) // Only nodes or ways with center
      .map(element => {
        const coords = element.type === 'node'
          ? { lat: element.lat, lon: element.lon }
          : element.center;

        return {
          name: element.tags?.name || 'Public Restroom',
          description: element.tags?.description || element.tags?.note || null,
          lat: coords.lat,
          lon: coords.lon,
          wheelchair_accessible: element.tags?.wheelchair === 'yes',
          baby_changing: element.tags?.changing_table === 'yes' || element.tags?.diaper === 'yes',
          gender_neutral: element.tags?.unisex === 'yes',
          opening_hours: element.tags?.opening_hours,
          fee: element.tags?.fee === 'yes',
          created_at: new Date().toISOString()
        };
      })
      .filter(restroom =>
        !isNaN(restroom.lat) && !isNaN(restroom.lon) &&
        Math.abs(restroom.lat) <= 90 && Math.abs(restroom.lon) <= 180
      )
      .slice(0, limit); // Limit results

  } catch (error) {
    console.error('❌ Failed to fetch from OSM API:', error.message);
    return [];
  }
}

/**
 * Transform Yelp API business data to our restroom database schema
 * We'll assume businesses like restaurants/cafes have restrooms
 */
function transformYelpData(yelpData) {
  return yelpData.map(business => ({
    name: `${business.name} (Restroom)`,
    description: `${business.categories?.map(c => c.title).join(', ') || 'Business restroom'} - ${business.location?.address1 || ''}`,
    lat: parseFloat(business.coordinates?.latitude),
    lon: parseFloat(business.coordinates?.longitude),
    wheelchair_accessible: true, // Assume most businesses are accessible
    baby_changing: business.categories?.some(c => c.alias?.includes('restaurant') || c.alias?.includes('cafe')) || false,
    gender_neutral: false, // Default assumption
    created_at: new Date().toISOString()
  })).filter(restroom =>
    // Filter out businesses without valid coordinates
    !isNaN(restroom.lat) &&
    !isNaN(restroom.lon) &&
    Math.abs(restroom.lat) <= 90 &&
    Math.abs(restroom.lon) <= 180
  );
}

/**
 * Create sample restroom data for testing and fallback
 */
function createSampleRestrooms() {
  console.log('🎯 Creating sample restroom data...');
  
  const samples = [
    {
      name: "Starbucks - French Quarter",
      latitude: "29.9574",
      longitude: "-90.0644",
      accessible: true,
      unisex: false,
      changing_table: true,
      comment: "Clean restroom, customer use only",
      street: "334 Royal St",
      city: "New Orleans",
      state: "LA"
    },
    {
      name: "Jackson Square Public Restrooms",
      latitude: "29.9565",
      longitude: "-90.0629",
      accessible: true,
      unisex: true,
      changing_table: false,
      comment: "Public restrooms near the cathedral",
      street: "Jackson Square",
      city: "New Orleans",
      state: "LA"
    },
    {
      name: "Cafe Du Monde",
      latitude: "29.9573",
      longitude: "-90.0609",
      accessible: false,
      unisex: false,
      changing_table: false,
      comment: "Small restroom, customer use",
      street: "800 Decatur St",
      city: "New Orleans",
      state: "LA"
    },
    {
      name: "Louisiana State Museum",
      latitude: "29.9582",
      longitude: "-90.0634",
      accessible: true,
      unisex: true,
      changing_table: true,
      comment: "Museum visitor restrooms",
      street: "751 Chartres St",
      city: "New Orleans",
      state: "LA"
    },
    {
      name: "McDonald's - Canal Street",
      latitude: "29.9529",
      longitude: "-90.0692",
      accessible: true,
      unisex: false,
      changing_table: true,
      comment: "Fast food restaurant restrooms",
      street: "140 St Charles Ave",
      city: "New Orleans",
      state: "LA"
    },
    {
      name: "Audubon Aquarium",
      latitude: "29.9490",
      longitude: "-90.0628",
      accessible: true,
      unisex: true,
      changing_table: true,
      comment: "Large, clean facility restrooms",
      street: "1 Canal St",
      city: "New Orleans",
      state: "LA"
    },
    {
      name: "Public Library - Main Branch",
      latitude: "29.9467",
      longitude: "-90.0709",
      accessible: true,
      unisex: false,
      changing_table: false,
      comment: "Library public restrooms",
      street: "219 Loyola Ave",
      city: "New Orleans",
      state: "LA"
    },
    {
      name: "Whole Foods - Broad Street",
      latitude: "29.9715",
      longitude: "-90.0852",
      accessible: true,
      unisex: false,
      changing_table: true,
      comment: "Grocery store customer restrooms",
      street: "200 Broad St",
      city: "New Orleans",
      state: "LA"
    }
  ];
  
  console.log(`✅ Created ${samples.length} sample restrooms`);
  return samples;
}

/**
 * Fetch restrooms from Google Places API (if API key is available)
 */
async function fetchGooglePlacesRestrooms(location = { lat: 29.9511, lng: -90.0715 }, radius = 50000) {
  console.log('\n🗺️ Attempting to fetch from Google Places API...');
  
  // For now, we'll skip Google Places since it requires an API key
  // Users can add their own Google Places API key if they want
  console.log('ℹ️ Google Places integration skipped (requires API key)');
  console.log('ℹ️ You can add Google Places API integration by setting GOOGLE_PLACES_API_KEY');
  
  return [];
}

/**
 * Import restrooms into Supabase database
 */
async function importRestrooms(restrooms) {
  console.log(`\n💾 Importing ${restrooms.length} restrooms into database...`);
  
  if (restrooms.length === 0) {
    console.log('⚠️ No restrooms to import');
    return;
  }
  
  try {
    // Import in batches of 50 to avoid hitting limits
    const batchSize = 50;
    let imported = 0;
    
    for (let i = 0; i < restrooms.length; i += batchSize) {
      const batch = restrooms.slice(i, i + batchSize);
      
      console.log(`Importing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(restrooms.length/batchSize)}...`);
      
      const { data, error } = await supabase
        .from('restrooms')
        .insert(batch)
        .select('id');
      
      if (error) {
        console.error('Error importing batch:', error);
        // Continue with next batch instead of failing completely
        continue;
      }
      
      imported += batch.length;
      console.log(`✅ Imported batch of ${batch.length} restrooms (${imported}/${restrooms.length} total)`);
      
      // Small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`🎉 Successfully imported ${imported} restrooms!`);
  } catch (error) {
    console.error('❌ Failed to import restrooms:', error);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('Starting public restroom import process...\n');
    
    // Step 1: Delete existing restrooms
    await deleteAllRestrooms();
    
    // Step 2: Fetch public restroom data
    console.log('\n📡 Fetching public restroom data...');

    // Try to fetch from Yelp API for businesses that likely have restrooms
    let yelpBusinesses = await fetchYelpBusinesses({
      term: 'restaurants OR cafes OR coffee OR fast food OR grocery',
      location: 'New Orleans, LA',
      limit: 50
    });

    // If no Yelp data, try other major cities
    if (yelpBusinesses.length === 0) {
      console.log('⚠️ No data from Yelp API for New Orleans, trying other cities...');
      const cities = ['Los Angeles, CA', 'Chicago, IL', 'Miami, FL', 'Orlando, FL'];
      for (const city of cities) {
        yelpBusinesses = await fetchYelpBusinesses({
          term: 'restaurants OR cafes OR coffee OR fast food OR grocery',
          location: city,
          limit: 50
        });
        if (yelpBusinesses.length > 0) break;
      }
    }

    // If still no results, create some sample data
    if (yelpBusinesses.length === 0) {
      console.log('⚠️ No data from Yelp API, creating sample restrooms...');
      const sampleData = createSampleRestrooms();
      // Use sample data directly in our format
      yelpBusinesses = sampleData.map(sample => ({
        name: sample.name.replace(' (Restroom)', ''),
        coordinates: {
          latitude: sample.latitude,
          longitude: sample.longitude
        },
        categories: [{ title: 'Restaurant' }],
        location: { address1: sample.street || '' }
      }));
    }

    // Try to fetch additional data from OpenStreetMap
    const osmRestrooms = await fetchOSMRestrooms({
      latitude: 29.9511,
      longitude: -90.0715,
      radius: 10000, // 10km radius
      limit: 50
    });

    const googleRestrooms = await fetchGooglePlacesRestrooms();

    // Step 3: Transform and combine data
    console.log('\n🔄 Processing and transforming data...');
    const transformedYelpData = transformYelpData(yelpBusinesses);
    const transformedOSMData = osmRestrooms; // Already in our format
    const transformedGoogleData = []; // Empty for now

    const allRestrooms = [...transformedYelpData, ...transformedOSMData, ...transformedGoogleData];
    
    console.log(`📊 Total restrooms to import: ${allRestrooms.length}`);
    
    // Step 4: Import into database
    if (allRestrooms.length > 0) {
      await importRestrooms(allRestrooms);
      
      // Step 5: Verify import
      console.log('\n🔍 Verifying import...');
      const { count, error } = await supabase
        .from('restrooms')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error verifying import:', error);
      } else {
        console.log(`✅ Database now contains ${count} restrooms`);
      }
    }
    
    console.log('\n🎉 Import process completed successfully!');
    console.log('🚽 Your app should now show public restrooms on the map!');
    
  } catch (error) {
    console.error('\n❌ Import process failed:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  deleteAllRestrooms,
  fetchYelpBusinesses,
  fetchOSMRestrooms,
  importRestrooms,
  transformYelpData
};