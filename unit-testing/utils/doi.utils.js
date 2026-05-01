/**
 * Validates if a given string is a valid DOI format.
 * Expects format like "10.1000/182" or "https://doi.org/10.1000/182"
 * @param {string} doi - The DOI string to validate
 * @returns {boolean} True if valid DOI, false otherwise
 */
function isValidDOI(doi) {
  if (!doi || typeof doi !== 'string') return false;
  const doiRegex = /(?:https?:\/\/)?(?:dx\.)?doi\.org\/(10\.[0-9]{4,}(?:\.[0-9]+)*\/(?:(?!["&\'<>])\S)+)|^(10\.[0-9]{4,}(?:\.[0-9]+)*\/(?:(?!["&\'<>])\S)+)$/i;
  return doiRegex.test(doi);
}

/**
 * Normalizes a DOI by stripping URLs and returning the clean DOI prefix/suffix.
 * @param {string} doi - The DOI string to normalize
 * @returns {string|null} The normalized DOI or null if invalid
 */
function normalizeDOI(doi) {
  if (!isValidDOI(doi)) return null;
  const match = doi.match(/10\.[0-9]{4,}(?:\.[0-9]+)*\/(?:(?!["&\'<>])\S)+/i);
  return match ? match[0].toLowerCase() : null;
}

/**
 * Extracts the registrant prefix from a DOI.
 * @param {string} doi - The DOI string
 * @returns {string|null} The prefix (e.g. "10.1000") or null if invalid
 */
function extractPrefix(doi) {
  const normalized = normalizeDOI(doi);
  if (!normalized) return null;
  return normalized.split('/')[0];
}

/**
 * Formats a given Crossref work object into an APA citation string.
 * @param {Object} work - Crossref work metadata object
 * @returns {string} Formatted APA citation string
 */
function formatCitation(work) {
  if (!work || typeof work !== 'object') return '';
  
  const authors = work.author 
    ? work.author.map(a => `${a.family}, ${a.given ? a.given.charAt(0) + '.' : ''}`).join(', ')
    : 'Unknown Author';
  
  const year = work.issued && work.issued['date-parts'] && work.issued['date-parts'][0][0] 
    ? work.issued['date-parts'][0][0] 
    : 'n.d.';
  
  const title = work.title ? work.title[0] : 'Untitled';
  const publisher = work.publisher || 'Unknown Publisher';
  const doi = work.DOI ? `https://doi.org/${work.DOI}` : '';

  return `${authors} (${year}). ${title}. ${publisher}. ${doi}`.trim();
}

/**
 * Removes null or undefined fields from a metadata object.
 * @param {Object} metadata - The metadata object to sanitize
 * @returns {Object} Sanitized object
 */
function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return metadata;
  
  return Object.entries(metadata).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = typeof value === 'object' && !Array.isArray(value) ? sanitizeMetadata(value) : value;
    }
    return acc;
  }, {});
}

module.exports = {
  isValidDOI,
  normalizeDOI,
  extractPrefix,
  formatCitation,
  sanitizeMetadata
};
