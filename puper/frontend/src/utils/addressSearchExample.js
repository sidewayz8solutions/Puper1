/**
 * Example usage of the address search functionality
 * This demonstrates how to search for establishments and restrooms by address
 */

import { 
  searchAddressForRestrooms, 
  searchEstablishmentsByAddress, 
  searchRestroomsAtEstablishment 
} from '../services/restrooms';

/**
 * Search for establishments and restrooms at a specific address
 * @param {string} address - The address to search (e.g., "123 Main Street, New York, NY")
 * @param {string} establishmentQuery - Optional query to filter establishments (e.g., "restaurant", "gas station")
 * @returns {Promise<Object>} Search results with establishments and restroom information
 */
export const searchAddressByExample = async (address, establishmentQuery = '') => {
  try {
    console.log(`🔍 Searching for establishments at: ${address}`);
    
    const result = await searchAddressForRestrooms(address, establishmentQuery);
    
    console.log('✅ Search Results:', {
      searchLocation: result.searchLocation,
      totalEstablishments: result.totalEstablishments,
      establishmentsWithRestrooms: result.establishmentsWithRestrooms,
      establishments: result.establishments.map(est => ({
        name: est.name,
        address: est.address,
        hasRestrooms: est.hasRestrooms,
        restroomCount: est.restrooms.length,
        rating: est.rating
      }))
    });
    
    return result;
  } catch (error) {
    console.error('❌ Address search failed:', error);
    throw error;
  }
};

/**
 * Example usage scenarios
 */
export const exampleUsages = {
  // Search for restaurants at a specific address
  searchRestaurants: (address) => searchAddressByExample(address, 'restaurant'),
  
  // Search for gas stations at a specific address
  searchGasStations: (address) => searchAddressByExample(address, 'gas station'),
  
  // Search for shopping centers at a specific address
  searchShopping: (address) => searchAddressByExample(address, 'shopping mall store'),
  
  // Search for all establishments at an address
  searchAll: (address) => searchAddressByExample(address, ''),
  
  // Search for specific establishment types
  searchByType: (address, type) => searchAddressByExample(address, type)
};

/**
 * Test the address search functionality
 * Call this function to test with sample addresses
 */
export const testAddressSearch = async () => {
  const testAddresses = [
    "Times Square, New York, NY",
    "1600 Pennsylvania Avenue, Washington, DC",
    "Hollywood Boulevard, Los Angeles, CA",
    "Michigan Avenue, Chicago, IL"
  ];
  
  for (const address of testAddresses) {
    try {
      console.log(`\n🧪 Testing address: ${address}`);
      const result = await searchAddressByExample(address, 'restaurant');
      console.log(`Found ${result.totalEstablishments} establishments, ${result.establishmentsWithRestrooms} with restrooms`);
    } catch (error) {
      console.error(`Failed to search ${address}:`, error.message);
    }
  }
};

// Export the main function for use in components
export default searchAddressByExample;
