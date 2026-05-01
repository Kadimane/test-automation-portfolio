# Crossref Test Automation Portfolio 🚀

[![CI/CD Pipeline](https://img.shields.io/github/actions/workflow/status/kadimane/test-automation-portfolio/test.yml?branch=main&label=Build&style=for-the-badge)](https://github.com/kadimane/test-automation-portfolio/actions)
[![Test Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen.svg?style=for-the-badge)](#test-coverage)
[![Node.js Version](https://img.shields.io/badge/Node.js-18.x-blue.svg?style=for-the-badge)](https://nodejs.org/)

## Project Overview

This repository demonstrates a robust, scalable, and maintainable test automation architecture designed specifically for the scholarly metadata domain. Built with **Crossref** as the primary target, this project validates core functionalities across different layers of the technology stack—from low-level DOI manipulation utilities to external API integrations and end-to-end user workflows on `search.crossref.org`.

The goal of this architecture is to provide high confidence in system stability, rapid feedback to developers, and clear documentation of system behavior through automated tests.

---

## Table of Contents
1. [Architecture & Strategy](#architecture--strategy)
2. [Testing Decisions](#testing-decisions)
3. [Setup Instructions](#setup-instructions)
4. [Test Coverage](#test-coverage)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Next Steps](#next-steps)

---

## Architecture & Strategy

A mature quality engineering practice requires a layered approach. I adopted the Test Pyramid strategy for this project to balance execution speed, isolation, and confidence.

1. **Unit Testing Layer (Jest)**: 
   Fast, deterministic tests validating the core business logic of scholarly metadata utilities (e.g., DOI format validation, normalizers). This layer is designed to catch logic errors instantly without external dependencies.
2. **API Testing Layer (Jest + Axios/Supertest)**: 
   Integration tests validating the `api.crossref.org` REST API. These tests ensure the contract between the system and its clients remains intact. Custom utilities manage retries with exponential backoff and precise response time measurements.
3. **E2E UI Testing Layer (Playwright)**: 
   Browser-based tests validating the user journey on `search.crossref.org`. Built using the Page Object Model (POM) pattern to ensure the tests remain resilient to UI changes. Tests run concurrently on Chromium and Firefox.

---

## Testing Decisions

### What Was Tested
- **DOI Utilities**: Normalization, validation, and metadata sanitization. *Why?* DOIs are the foundational entity of Crossref. Errors here cascade throughout the system.
- **Core API Endpoints** (`/works`, `/members`, `/types`): *Why?* These endpoints handle the vast majority of consumer traffic. Validating data structure, HTTP response codes, and latency ensures SLA compliance.
- **Search UI Workflows**: Searching for known DOIs, author lookups, and edge-case handling (empty searches). *Why?* This represents the primary human interaction point with the metadata graph.

### What Wasn't Tested (And Why)
- **Content Negotiation**: We bypassed testing alternative representation formats (e.g., XML, BibTeX) in this MVP to focus on the primary JSON API surface.
- **Deep DOM Validation**: E2E tests avoid relying on deeply nested CSS selectors. Instead, we use semantic locators and ARIA labels. *Why?* Deep DOM assertions make tests brittle.
- **Rate Limiting / Load Testing**: Not executed against the production Crossref API to avoid unnecessary load. A localized mock or staging environment would be required for this.

---

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (v9 or higher)

### Installation
Clone the repository and install dependencies:
\`\`\`bash
git clone https://github.com/kadimane/test-automation-portfolio.git
cd test-automation-portfolio
npm install
\`\`\`

Install Playwright browsers (for E2E tests):
\`\`\`bash
npx playwright install --with-deps
\`\`\`

### Running Tests
Execute the entire suite:
\`\`\`bash
npm run test:all
\`\`\`

Or run specific layers:
- **Unit Tests**: \`npm run test:unit\`
- **API Tests**: \`npm run test:api\`
- **E2E Tests**: \`npm run test:e2e\`

Generate coverage report:
\`\`\`bash
npm run test:coverage
\`\`\`

---

## Test Coverage

The unit test suite is built to exceed standard coverage metrics, ensuring all logical branches of our utility functions are validated.

| Module / Component | Statements | Branches | Functions | Lines |
|--------------------|------------|----------|-----------|-------|
| `doi.utils.js`     | 100%       | 94%      | 100%      | 100%  |
| `api.helper.js`    | 90%        | 85%      | 100%      | 90%   |
| **Overall**        | **95%**    | **89%**  | **100%**  | **95%**|

*Note: Coverage is generated dynamically via Istanbul (Jest).*

---

## CI/CD Pipeline

Continuous Integration is managed via GitHub Actions (`.github/workflows/test.yml`). 

The pipeline guarantees that no broken code is merged into `main`. It features:
- **Parallel Execution**: Unit, API, and E2E jobs run simultaneously, drastically reducing pipeline duration.
- **Cross-Browser Verification**: Playwright automatically tests against both Chrome and Firefox within the pipeline.
- **Artifact Generation**: HTML reports for E2E tests and coverage reports are automatically uploaded to the workflow summary.
- **PR Summaries**: A dedicated summary job aggregates the results and posts them directly to pull requests.

---

## Next Steps

Given more time and resources, I would expand this architecture to include:
1. **API Mocking**: Introduce `msw` (Mock Service Worker) for the API tests to validate client behavior during network failures and edge cases without hitting real endpoints.
2. **Visual Regression Testing**: Integrate Playwright's visual comparisons to detect unintended CSS or layout changes on the search page.
3. **Accessibility (a11y) Audits**: Integrate `@axe-core/playwright` to automatically fail the build if severe WCAG violations are introduced.
4. **Performance Testing**: Add a k6 suite to baseline API performance under sustained load.
