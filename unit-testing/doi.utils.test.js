const {
  isValidDOI,
  normalizeDOI,
  extractPrefix,
  formatCitation,
  sanitizeMetadata
} = require('./utils/doi.utils');

describe('DOI Utils', () => {
  describe('isValidDOI', () => {
    it('should return true for a valid clean DOI', () => {
      expect(isValidDOI('10.1000/182')).toBe(true);
      expect(isValidDOI('10.1371/journal.pbio.0020449')).toBe(true);
    });

    it('should return true for a valid full URL DOI', () => {
      expect(isValidDOI('https://doi.org/10.1000/182')).toBe(true);
      expect(isValidDOI('http://dx.doi.org/10.1000/182')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(isValidDOI('11.1000/182')).toBe(false); // Does not start with 10.
      expect(isValidDOI('10.1000')).toBe(false); // Missing suffix
      expect(isValidDOI('not-a-doi')).toBe(false);
      expect(isValidDOI(null)).toBe(false);
      expect(isValidDOI(undefined)).toBe(false);
    });
  });

  describe('normalizeDOI', () => {
    it('should strip URLs and return the clean DOI', () => {
      expect(normalizeDOI('https://doi.org/10.1000/182')).toBe('10.1000/182');
      expect(normalizeDOI('http://dx.doi.org/10.1371/journal.pbio.0020449')).toBe('10.1371/journal.pbio.0020449');
    });

    it('should return the lowercase DOI', () => {
      expect(normalizeDOI('10.1000/ABC')).toBe('10.1000/abc');
    });

    it('should return null for invalid DOIs', () => {
      expect(normalizeDOI('invalid-doi')).toBeNull();
      expect(normalizeDOI(null)).toBeNull();
    });
  });

  describe('extractPrefix', () => {
    it('should return the correct registrant prefix', () => {
      expect(extractPrefix('10.1000/182')).toBe('10.1000');
      expect(extractPrefix('https://doi.org/10.1371/journal.pbio.0020449')).toBe('10.1371');
      expect(extractPrefix('10.1038/nature01234')).toBe('10.1038');
    });

    it('should return null if DOI is invalid', () => {
      expect(extractPrefix('invalid-doi')).toBeNull();
    });
  });

  describe('formatCitation', () => {
    it('should format a Crossref work object into an APA citation', () => {
      const work = {
        title: ['The structure of DNA'],
        author: [{ family: 'Watson', given: 'James' }, { family: 'Crick', given: 'Francis' }],
        issued: { 'date-parts': [[1953]] },
        publisher: 'Nature Publishing Group',
        DOI: '10.1038/171737a0'
      };
      
      const citation = formatCitation(work);
      expect(citation).toBe('Watson, J., Crick, F. (1953). The structure of DNA. Nature Publishing Group. https://doi.org/10.1038/171737a0');
    });

    it('should handle missing authors gracefully', () => {
      const work = {
        title: ['Unknown Origin'],
        issued: { 'date-parts': [[2020]] }
      };
      expect(formatCitation(work)).toContain('Unknown Author (2020). Unknown Origin.');
    });

    it('should handle missing dates gracefully', () => {
      const work = {
        title: ['No Date Article'],
        author: [{ family: 'Smith', given: 'John' }]
      };
      expect(formatCitation(work)).toContain('Smith, J. (n.d.). No Date Article.');
    });

    it('should return an empty string for invalid input', () => {
      expect(formatCitation(null)).toBe('');
      expect(formatCitation(undefined)).toBe('');
      expect(formatCitation('not-an-object')).toBe('');
    });
  });

  describe('sanitizeMetadata', () => {
    it('should remove null and undefined fields', () => {
      const input = {
        title: 'Valid Title',
        author: null,
        year: 2023,
        subtitle: undefined
      };
      
      const expected = {
        title: 'Valid Title',
        year: 2023
      };
      
      expect(sanitizeMetadata(input)).toEqual(expected);
    });

    it('should process nested objects', () => {
      const input = {
        meta: {
          valid: true,
          invalid: null
        },
        items: [1, 2, null]
      };
      
      const expected = {
        meta: {
          valid: true
        },
        items: [1, 2, null] // We are ignoring arrays based on implementation, so they stay untouched
      };
      
      expect(sanitizeMetadata(input)).toEqual(expected);
    });

    it('should return the same object if no keys are null or undefined', () => {
      const input = { a: 1, b: 2 };
      expect(sanitizeMetadata(input)).toEqual(input);
    });

    it('should return input as is if not an object', () => {
      expect(sanitizeMetadata('string')).toBe('string');
      expect(sanitizeMetadata(null)).toBeNull();
    });
  });
});
