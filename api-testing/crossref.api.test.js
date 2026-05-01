const axios = require('axios');
const request = require('supertest');
const { 
  validateWorkObject, 
  measureResponseTime, 
  retryWithBackoff, 
  customMatchers 
} = require('./helpers/api.helper');

// Expect custom matchers
expect.extend(customMatchers);

describe('Crossref API Tests', () => {
  const BASE_URL = 'https://api.crossref.org';
  let apiClient;
  
  const knownDoi = '10.1038/nature01234'; // Known DOI for tests
  const invalidDoi = '10.9999/invalid-doi-12345';

  beforeAll(() => {
    // Set up axios instance as requested
    apiClient = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'User-Agent': 'test-automation-portfolio/1.0 (mailto:test@example.com)'
      }
    });
  });

  describe('GET /works/:doi', () => {
    it('(1) returns correct metadata for a known DOI', async () => {
      // Use retry to avoid flaky tests due to network issues
      const response = await retryWithBackoff(() => apiClient.get(`/works/${knownDoi}`));
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('ok');
      
      const work = response.data.message;
      expect(work.DOI).toBe(knownDoi);
      expect(validateWorkObject(work)).toBe(true);
      expect(work.publisher).toBeDefined();
      expect(work.title).toBeDefined();
    });

    it('(5) invalid DOI returns 404', async () => {
      try {
        await apiClient.get(`/works/${invalidDoi}`);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('GET /works', () => {
    it('(2) GET /works with query parameter returns results with correct structure', async () => {
      // Using Supertest here to demonstrate both as requested
      const response = await request(BASE_URL)
        .get('/works')
        .query({ query: 'machine learning', rows: 5 })
        .set('User-Agent', 'test-automation-portfolio/1.0 (mailto:test@example.com)')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.message.items).toBeInstanceOf(Array);
      expect(response.body.message.items.length).toBeLessThanOrEqual(5);
      
      // Check structure of first item if it exists
      if (response.body.message.items.length > 0) {
        const firstItem = response.body.message.items[0];
        expect(firstItem.DOI).toBeValidDOI();
      }
    });
  });

  describe('GET /members', () => {
    it('(3) returns a list with correct fields', async () => {
      const response = await apiClient.get('/members', { params: { rows: 2 } });
      
      expect(response.status).toBe(200);
      expect(response.data.message.items).toBeInstanceOf(Array);
      
      const members = response.data.message.items;
      if (members.length > 0) {
        const firstMember = members[0];
        // Ensure necessary member fields are present
        expect(firstMember.id).toBeDefined();
        expect(firstMember['primary-name']).toBeDefined();
        expect(firstMember.location).toBeDefined();
      }
    });
  });

  describe('GET /types', () => {
    it('(4) returns all work types', async () => {
      const response = await apiClient.get('/types');
      
      expect(response.status).toBe(200);
      expect(response.data.message.items).toBeInstanceOf(Array);
      
      const types = response.data.message.items;
      expect(types.length).toBeGreaterThan(0);
      
      // Ensure specific common types exist in the results
      const typeIds = types.map(t => t.id);
      expect(typeIds).toContain('journal-article');
      expect(typeIds).toContain('book-chapter');
    });
  });

  describe('Performance & Headers', () => {
    it('(6) response time is under 3000ms', async () => {
      // Measure response time using our custom utility
      const response = await measureResponseTime(
        () => apiClient.get('/works', { params: { rows: 1 } }), 
        3000
      );
      
      expect(response.status).toBe(200);
      expect(response.__duration).toBeLessThan(3000);
    });

    it('(7) response headers contain correct content-type', async () => {
      const response = await apiClient.get('/works', { params: { rows: 1 } });
      
      expect(response.headers['content-type']).toBeDefined();
      expect(response.headers['content-type']).toContain('application/json');
    });
  });
});
