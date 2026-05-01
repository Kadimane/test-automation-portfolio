/**
 * Page Object Model for the Crossref Metadata Search Page.
 */
class SearchPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Locators
    // Note: These selectors are based on typical search UI patterns. 
    // They may need adjustment if Crossref's DOM structure is different.
    this.searchInput = page.locator('#search-input');
    this.searchButton = page.locator('button[type="submit"], button:has-text("Search"), input[type="submit"]');
    this.resultsList = page.locator('.item-data');
    this.resultItems = page.locator('.item-data');
    this.resultTitles = page.locator('.item-data p.lead');
    this.resultLinks = page.locator('.item-data a[href^="https://doi.org/"]');
    this.resultCountText = page.locator('p:has-text("results")');
  }

  /**
   * Navigates to the search page.
   */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * Performs a search for the given query.
   * @param {string} query 
   */
  async search(query) {
    // Wait for the input to be visible and enter text
    await this.searchInput.waitFor({ state: 'visible' });
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    
    // Wait for network idle or results to load
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Returns the text of the first search result title.
   * @returns {Promise<string>}
   */
  async getFirstResult() {
    await this.resultTitles.first().waitFor({ state: 'visible', timeout: 10000 });
    return this.resultTitles.first().innerText();
  }

  /**
   * Gets the total number of results reported on the page.
   * @returns {Promise<number>}
   */
  async getResultCount() {
    try {
      await this.resultCountText.waitFor({ state: 'visible', timeout: 5000 });
      const text = await this.resultCountText.innerText();
      // Extract numbers from text (e.g., "1-20 of 1500 results")
      const matches = text.match(/of\s+([0-9,]+)/i) || text.match(/([0-9,]+)\s+results/i);
      if (matches && matches[1]) {
        return parseInt(matches[1].replace(/,/g, ''), 10);
      }
      return 0;
    } catch (e) {
      return 0; // Return 0 if count element is not found
    }
  }

  /**
   * Clicks on the search result at the specified zero-based index.
   * @param {number} index 
   */
  async clickResult(index) {
    await this.resultLinks.nth(index).waitFor({ state: 'visible' });
    
    // Some links might open in a new tab, we handle navigation in the spec
    await this.resultLinks.nth(index).click();
  }
}

module.exports = { SearchPage };
