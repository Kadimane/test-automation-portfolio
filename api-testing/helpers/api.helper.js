/**
 * API Test Helper Functions
 */

/**
 * Validates that a Crossref work object contains all required fields.
 * Required fields: DOI, title, author, publisher, type.
 * 
 * @param {Object} work - The Crossref work object to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateWorkObject(work) {
  if (!work || typeof work !== 'object') return false;
  
  const requiredFields = ['DOI', 'title', 'author', 'publisher', 'type'];
  return requiredFields.every(field => field in work && work[field] !== undefined && work[field] !== null);
}

/**
 * Measures the execution time of an API request and asserts it is within a threshold.
 * 
 * @param {Function} apiCall - An async function that makes the API call
 * @param {number} maxMs - Maximum allowed response time in milliseconds
 * @returns {Promise<Object>} The API response
 * @throws {Error} If the response time exceeds the threshold
 */
async function measureResponseTime(apiCall, maxMs) {
  const start = performance.now();
  const response = await apiCall();
  const end = performance.now();
  
  const duration = end - start;
  if (duration > maxMs) {
    throw new Error(`Response time ${duration.toFixed(2)}ms exceeded threshold of ${maxMs}ms`);
  }
  
  // Attach duration to response for further assertions if needed
  response.__duration = duration;
  return response;
}

/**
 * Retries a failed API call with exponential backoff.
 * 
 * @param {Function} apiCall - An async function that makes the API call
 * @param {number} maxRetries - Maximum number of retries (default 3)
 * @param {number} baseDelay - Base delay in ms for backoff calculation (default 1000)
 * @returns {Promise<Object>} The successful response
 * @throws {Error} The final error after all retries fail
 */
async function retryWithBackoff(apiCall, maxRetries = 3, baseDelay = 1000) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Custom Jest matchers to be added in setup or beforeAll.
 * Checks if a string is a valid DOI format.
 */
const customMatchers = {
  toBeValidDOI(received) {
    const doiRegex = /^10\.[0-9]{4,}(?:\.[0-9]+)*\/(?:(?!["&\'<>])\S)+$/i;
    const pass = typeof received === 'string' && doiRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid DOI`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid DOI starting with 10.`,
        pass: false,
      };
    }
  }
};

module.exports = {
  validateWorkObject,
  measureResponseTime,
  retryWithBackoff,
  customMatchers
};
