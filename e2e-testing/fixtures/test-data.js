/**
 * Test data for End-to-End Search Scenarios.
 * Contains known scholarly items for predictable assertions.
 */
module.exports = {
  validDoi: {
    doi: '10.1038/35057062',
    expectedTitle: 'Initial sequencing and analysis of the human genome'
  },
  authorSearch: {
    query: 'Albert Einstein',
    expectedRelevantResult: 'Einstein'
  },
  invalidSearch: {
    query: 'this-is-a-completely-fake-search-query-that-should-yield-no-results-12345',
    expectedMessage: 'No results found' // Placeholder for actual message on empty search
  }
};
