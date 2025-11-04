#!/usr/bin/env node

/**
 * Simple Database Test
 * 
 * This script directly queries the database to see what's there
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration (same as mobile app)
const supabaseUrl = 'https://qunaiicjcelvdunluwqh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bmFpaWNqY2VsdmR1bmx1d3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NjA4NjEsImV4cCI6MjA2OTMzNjg2MX0.rFXwY95lvcXZEds7f16KodwhfnGHQBp7GsV4WTFQHjI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Testing Direct Database Access');
console.log('==================================');

async function testDatabase() {
  try {
    console.log('\n📊 Checking total restrooms count...');
    const { count, error: countError } = await supabase
      .from('restrooms')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting restrooms:', countError);
    } else {
      console.log(`✅ Total restrooms in database: ${count}`);
    }
    
    console.log('\n📋 Fetching first 5 restrooms...');
    const { data: restrooms, error } = await supabase
      .from('restrooms')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error fetching restrooms:', error);
    } else {
      console.log(`✅ Fetched ${restrooms.length} sample restrooms`);
      
      restrooms.forEach((restroom, index) => {
        console.log(`\n${index + 1}. ${restroom.name}`);
        console.log(`   Location: ${restroom.lat}, ${restroom.lon}`);
        console.log(`   Accessible: ${restroom.wheelchair_accessible}`);
        console.log(`   Baby Changing: ${restroom.baby_changing}`);
        console.log(`   Gender Neutral: ${restroom.gender_neutral}`);
        console.log(`   Rating: ${restroom.rating}`);
        console.log(`   Created: ${restroom.created_at}`);
      });
    }
    
    console.log('\n🌍 Testing basic geographic filter...');
    // Simple lat/lon filter around New Orleans
    const { data: nearbyRestrooms, error: nearbyError } = await supabase
      .from('restrooms')
      .select('name, lat, lon')
      .gte('lat', 29.0)
      .lte('lat', 31.0)
      .gte('lon', -91.0)
      .lte('lon', -89.0)
      .limit(10);
    
    if (nearbyError) {
      console.error('Error with geographic filter:', nearbyError);
    } else {
      console.log(`✅ Found ${nearbyRestrooms.length} restrooms in New Orleans area`);
      nearbyRestrooms.forEach(r => {
        console.log(`  - ${r.name} at ${r.lat}, ${r.lon}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();