/**
 * sheets.js — Google Sheets integration for LOWEND NYC pipeline (New Pipeline format)
 * 
 * Handles reading/writing to the editorial pipeline sheet.
 * Updated for "New Pipeline" tab structure.
 */

const { google } = require('googleapis');
const path = require('path');

// Pipeline statuses (workflow states) - matching Google Sheet values
const STATUS = {
  IDEA: 'IDEA_PROPOSED',
  IDEA_PROPOSED: 'IDEA_PROPOSED',
  RESEARCHING: 'RESEARCHING',
  RESEARCH_DONE: 'RESEARCH_DONE',
  WRITING: 'WRITING',
  DRAFT_READY: 'DRAFT_COMPLETE',
  DRAFT_COMPLETE: 'DRAFT_COMPLETE',
  EDITING: 'EDITING',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  REVISION: 'REVISION',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  DENIED: 'DENIED',
};

// Column mapping for New Pipeline tab
// Headers: id, headline, angle, type, source, status, priority, event_date, venue, artists, 
//          research_notes, image_status, image_urls, draft_link, created_at, updated_at, 
//          edmtrain_link, carousel_status
const COLUMNS = {
  ID: 0,              // A - slug/id
  HEADLINE: 1,        // B - article headline/topic
  ANGLE: 2,           // C - angle/notes
  TYPE: 3,            // D - template type (artist-profile, event-preview, etc.)
  SOURCE: 4,          // E - source (scout, manual, etc.)
  STATUS: 5,          // F - workflow status
  PRIORITY: 6,        // G - priority (high, normal, low)
  EVENT_DATE: 7,      // H - event date
  VENUE: 8,           // I - venue name
  ARTISTS: 9,         // J - artists (comma separated)
  RESEARCH_NOTES: 10, // K - research notes
  IMAGE_STATUS: 11,   // L - image status
  IMAGE_URLS: 12,     // M - image URLs
  DRAFT_LINK: 13,     // N - draft link
  CREATED_AT: 14,     // O - created timestamp
  UPDATED_AT: 15,     // P - updated timestamp
  EDMTRAIN_LINK: 16,  // Q - edmtrain link
  CAROUSEL_STATUS: 17,// R - carousel status
};

const HEADER_ROW = [
  'id', 'headline', 'angle', 'type', 'source', 'status', 'priority', 'event_date',
  'venue', 'artists', 'research_notes', 'image_status', 'image_urls', 'draft_link',
  'created_at', 'updated_at', 'edmtrain_link', 'carousel_status'
];

class SheetsClient {
  constructor(credentialsPath, sheetId) {
    this.sheetId = sheetId;
    this.credentialsPath = credentialsPath;
    this.sheets = null;
    this.sheetName = 'New Pipeline'; // Updated to use new tab
  }

  async init() {
    const auth = new google.auth.GoogleAuth({
      keyFile: this.credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    this.sheets = google.sheets({ version: 'v4', auth: authClient });
    return this;
  }

  /**
   * Set up the sheet with headers and formatting
   */
  async setupSheet() {
    try {
      // Check if sheet exists
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.sheetId,
      });

      const sheetExists = response.data.sheets.some(
        s => s.properties.title === this.sheetName
      );

      if (!sheetExists) {
        // Create the New Pipeline sheet
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.sheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: { title: this.sheetName }
              }
            }]
          }
        });
      }

      // Set headers
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: `${this.sheetName}!A1:R1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [HEADER_ROW]
        }
      });

      console.log('Sheet setup complete');
    } catch (error) {
      console.error('Sheet setup error:', error.message);
      throw error;
    }
  }

  /**
   * Get all rows from the pipeline sheet
   */
  async getAllRows() {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: `${this.sheetName}!A2:R1000`,
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => ({
      rowNumber: index + 2, // 1-indexed, skip header
      // Map to old field names for compatibility
      slug: row[COLUMNS.ID] || '',
      topic: row[COLUMNS.HEADLINE] || '',
      headline: row[COLUMNS.HEADLINE] || '',
      angle: row[COLUMNS.ANGLE] || '',
      template: row[COLUMNS.TYPE] || 'event-preview',
      type: row[COLUMNS.TYPE] || 'event-preview',
      source: row[COLUMNS.SOURCE] || '',
      status: row[COLUMNS.STATUS] || row[COLUMNS.ID] || '', // Fallback to ID if status empty
      priority: row[COLUMNS.PRIORITY] || 'Normal',
      eventDate: row[COLUMNS.EVENT_DATE] || '',
      venue: row[COLUMNS.VENUE] || '',
      artists: row[COLUMNS.ARTISTS] || '',
      researchNotes: row[COLUMNS.RESEARCH_NOTES] || '',
      imageStatus: row[COLUMNS.IMAGE_STATUS] || '',
      imageUrls: row[COLUMNS.IMAGE_URLS] || '',
      draftLink: row[COLUMNS.DRAFT_LINK] || '',
      createdAt: row[COLUMNS.CREATED_AT] || '',
      updatedAt: row[COLUMNS.UPDATED_AT] || '',
      edmtrainLink: row[COLUMNS.EDMTRAIN_LINK] || '',
      carouselStatus: row[COLUMNS.CAROUSEL_STATUS] || '',
      // Genre extraction from type or default
      genre: this.inferGenre(row[COLUMNS.TYPE], row[COLUMNS.HEADLINE]),
    }));
  }

  /**
   * Infer genre from type/headline
   */
  inferGenre(type, headline) {
    const headline_lower = (headline || '').toLowerCase();
    const type_lower = (type || '').toLowerCase();
    
    if (headline_lower.includes('techno')) return 'Techno';
    if (headline_lower.includes('house')) return 'House';
    if (headline_lower.includes('garage') || headline_lower.includes('ukg')) return 'UK Garage';
    if (headline_lower.includes('bass')) return 'Bass';
    if (headline_lower.includes('dubstep')) return 'Dubstep';
    if (headline_lower.includes('acid')) return 'Acid Techno';
    if (headline_lower.includes('ambient')) return 'Ambient';
    if (headline_lower.includes('experimental')) return 'Experimental';
    
    if (type_lower.includes('profile')) return 'Electronic';
    if (type_lower.includes('preview')) return 'Electronic';
    if (type_lower.includes('venue')) return 'Electronic';
    
    return 'Electronic';
  }

  /**
   * Get rows filtered by status
   */
  async getRowsByStatus(status) {
    const rows = await this.getAllRows();
    return rows.filter(row => row.status === status);
  }

  /**
   * Update a specific cell
   */
  async updateCell(rowNumber, column, value) {
    const colLetter = String.fromCharCode(65 + column); // A=65
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: `${this.sheetName}!${colLetter}${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[value]]
      }
    });
  }

  /**
   * Update status and timestamp
   */
  async updateStatus(rowNumber, newStatus) {
    const now = new Date().toISOString();
    await this.updateCell(rowNumber, COLUMNS.STATUS, newStatus);
    await this.updateCell(rowNumber, COLUMNS.UPDATED_AT, now);
    console.log(`Row ${rowNumber}: Status → ${newStatus}`);
  }

  /**
   * Update draft link
   */
  async setDraftLink(rowNumber, link) {
    await this.updateCell(rowNumber, COLUMNS.DRAFT_LINK, link);
  }

  /**
   * Set image status
   */
  async setImageStatus(rowNumber, status) {
    await this.updateCell(rowNumber, COLUMNS.IMAGE_STATUS, status);
  }

  /**
   * Set image URLs
   */
  async setImageUrls(rowNumber, urls) {
    await this.updateCell(rowNumber, COLUMNS.IMAGE_URLS, urls);
  }

  /**
   * Set research notes
   */
  async setResearchNotes(rowNumber, notes) {
    await this.updateCell(rowNumber, COLUMNS.RESEARCH_NOTES, notes);
  }

  /**
   * Add a new topic
   */
  async addTopic(headline, angle, type, genre, priority = 'Normal') {
    const now = new Date().toISOString();
    const slug = headline.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.sheetId,
      range: `${this.sheetName}!A:R`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          slug,           // id
          headline,       // headline
          angle,          // angle
          type,           // type
          'manual',       // source
          STATUS.IDEA,    // status
          priority,       // priority
          '',             // event_date
          '',             // venue
          '',             // artists
          '',             // research_notes
          'needed',       // image_status
          '',             // image_urls
          '',             // draft_link
          now,            // created_at
          now,            // updated_at
          '',             // edmtrain_link
          '',             // carousel_status
        ]]
      }
    });

    console.log(`Added topic: "${headline}" (${slug})`);
    return slug;
  }

  /**
   * Get articles ready to publish today
   */
  async getReadyToPublish() {
    const today = new Date().toISOString().split('T')[0];
    const rows = await this.getRowsByStatus(STATUS.SCHEDULED);
    return rows.filter(row => {
      const publishDate = row.eventDate || row.createdAt;
      return publishDate && publishDate <= today;
    });
  }

  /**
   * Update multiple fields at once
   */
  async updateRow(rowNumber, updates) {
    const now = new Date().toISOString();
    
    for (const [field, value] of Object.entries(updates)) {
      const colIndex = COLUMNS[field.toUpperCase()];
      if (colIndex !== undefined) {
        await this.updateCell(rowNumber, colIndex, value);
      }
    }
    
    // Always update timestamp
    await this.updateCell(rowNumber, COLUMNS.UPDATED_AT, now);
  }
}

module.exports = { SheetsClient, STATUS, COLUMNS, HEADER_ROW };
