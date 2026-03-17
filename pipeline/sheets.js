/**
 * sheets.js — Google Sheets integration for LOWEND NYC pipeline
 * 
 * Handles reading/writing to the editorial pipeline sheet.
 */

const { google } = require('googleapis');
const path = require('path');

// Pipeline statuses
const STATUS = {
  IDEA: 'IDEA',
  APPROVED: 'APPROVED',
  WRITING: 'WRITING',
  DRAFT_READY: 'DRAFT_READY',
  EDITING: 'EDITING',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  REVISION: 'REVISION',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  DENIED: 'DENIED',
};

// Column mapping (A=0, B=1, etc.)
const COLUMNS = {
  STATUS: 0,        // A
  TOPIC: 1,         // B
  ANGLE: 2,         // C
  TEMPLATE: 3,      // D
  WRITER: 4,        // E
  DRAFT_DUE: 5,     // F
  EDITOR: 6,        // G
  DRAFT_LINK: 7,    // H
  YOUR_NOTES: 8,    // I
  PUBLISH_DATE: 9,  // J
  SLUG: 10,         // K
  PRIORITY: 11,     // L
  GENRE: 12,        // M
  CREATED: 13,      // N
  UPDATED: 14,      // O
};

const HEADER_ROW = [
  'Status', 'Topic', 'Angle', 'Template', 'Writer',
  'Draft Due', 'Editor', 'Draft Link', 'Your Notes',
  'Publish Date', 'Slug', 'Priority', 'Genre',
  'Created', 'Updated'
];

class SheetsClient {
  constructor(credentialsPath, sheetId) {
    this.sheetId = sheetId;
    this.credentialsPath = credentialsPath;
    this.sheets = null;
    this.sheetName = 'Pipeline';
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
        // Create the Pipeline sheet
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
        range: `${this.sheetName}!A1:O1`,
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
      range: `${this.sheetName}!A2:O1000`,
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => ({
      rowNumber: index + 2, // 1-indexed, skip header
      status: row[COLUMNS.STATUS] || '',
      topic: row[COLUMNS.TOPIC] || '',
      angle: row[COLUMNS.ANGLE] || '',
      template: row[COLUMNS.TEMPLATE] || '',
      writer: row[COLUMNS.WRITER] || '',
      draftDue: row[COLUMNS.DRAFT_DUE] || '',
      editor: row[COLUMNS.EDITOR] || '',
      draftLink: row[COLUMNS.DRAFT_LINK] || '',
      yourNotes: row[COLUMNS.YOUR_NOTES] || '',
      publishDate: row[COLUMNS.PUBLISH_DATE] || '',
      slug: row[COLUMNS.SLUG] || '',
      priority: row[COLUMNS.PRIORITY] || 'Normal',
      genre: row[COLUMNS.GENRE] || '',
      created: row[COLUMNS.CREATED] || '',
      updated: row[COLUMNS.UPDATED] || '',
    }));
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
    await this.updateCell(rowNumber, COLUMNS.UPDATED, now);
    console.log(`Row ${rowNumber}: Status → ${newStatus}`);
  }

  /**
   * Add a new topic
   */
  async addTopic(topic, angle, template, genre, priority = 'Normal') {
    const now = new Date().toISOString();
    const slug = topic.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.sheetId,
      range: `${this.sheetName}!A:O`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          STATUS.IDEA,    // Status
          topic,          // Topic
          angle,          // Angle
          template,       // Template
          '',             // Writer
          '',             // Draft Due
          '',             // Editor
          '',             // Draft Link
          '',             // Your Notes
          '',             // Publish Date
          slug,           // Slug
          priority,       // Priority
          genre,          // Genre
          now,            // Created
          now,            // Updated
        ]]
      }
    });

    console.log(`Added topic: "${topic}" (${slug})`);
  }

  /**
   * Update draft link
   */
  async setDraftLink(rowNumber, link) {
    await this.updateCell(rowNumber, COLUMNS.DRAFT_LINK, link);
  }

  /**
   * Set writer
   */
  async setWriter(rowNumber, writer) {
    await this.updateCell(rowNumber, COLUMNS.WRITER, writer);
  }

  /**
   * Set editor
   */
  async setEditor(rowNumber, editor) {
    await this.updateCell(rowNumber, COLUMNS.EDITOR, editor);
  }

  /**
   * Get articles ready to publish today
   */
  async getReadyToPublish() {
    const today = new Date().toISOString().split('T')[0];
    const rows = await this.getRowsByStatus(STATUS.SCHEDULED);
    return rows.filter(row => row.publishDate <= today);
  }
}

module.exports = { SheetsClient, STATUS, COLUMNS, HEADER_ROW };
