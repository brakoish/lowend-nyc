#!/usr/bin/env node
/**
 * format-sheet.js — Apply formatting to the LOWEND NYC Pipeline sheet
 * 
 * Adds: dropdowns, colors, column widths, frozen rows, conditional formatting
 */

const dotenvPath = require('path').join(__dirname, '.env');
try { require('dotenv').config({ path: dotenvPath }); } catch(e) {}

const { google } = require('googleapis');
const path = require('path');
const env = globalThis.process.env || {};

async function formatSheet() {
  const credPath = (env.GOOGLE_CREDENTIALS_PATH || '').replace('~', env.HOME);
  const sheetId = env.GOOGLE_SHEET_ID;
  
  const auth = new google.auth.GoogleAuth({
    keyFile: credPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });
  
  // Get the Pipeline sheet ID
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const pipelineSheet = spreadsheet.data.sheets.find(s => s.properties.title === 'Pipeline');
  if (!pipelineSheet) {
    console.log('Pipeline sheet not found');
    return;
  }
  const tabId = pipelineSheet.properties.sheetId;
  
  console.log('Formatting Pipeline sheet...\n');
  
  const requests = [];
  
  // ─── Column Widths ───
  const columnWidths = [
    { col: 0, width: 160 },  // Status
    { col: 1, width: 320 },  // Topic
    { col: 2, width: 220 },  // Angle
    { col: 3, width: 140 },  // Template
    { col: 4, width: 120 },  // Writer
    { col: 5, width: 110 },  // Draft Due
    { col: 6, width: 120 },  // Editor
    { col: 7, width: 220 },  // Draft Link
    { col: 8, width: 220 },  // Your Notes
    { col: 9, width: 110 },  // Publish Date
    { col: 10, width: 180 }, // Slug
    { col: 11, width: 90 },  // Priority
    { col: 12, width: 160 }, // Genre
    { col: 13, width: 140 }, // Created
    { col: 14, width: 140 }, // Updated
  ];
  
  for (const { col, width } of columnWidths) {
    requests.push({
      updateDimensionProperties: {
        range: { sheetId: tabId, dimension: 'COLUMNS', startIndex: col, endIndex: col + 1 },
        properties: { pixelSize: width },
        fields: 'pixelSize',
      },
    });
  }
  
  // ─── Freeze Header Row ───
  requests.push({
    updateSheetProperties: {
      properties: { sheetId: tabId, gridProperties: { frozenRowCount: 1 } },
      fields: 'gridProperties.frozenRowCount',
    },
  });
  
  // ─── Header Row Formatting ───
  requests.push({
    repeatCell: {
      range: { sheetId: tabId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 15 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.04, green: 0.04, blue: 0.04 },
          textFormat: {
            foregroundColor: { red: 1, green: 0.17, blue: 0.17 },
            bold: true,
            fontFamily: 'Arial',
            fontSize: 10,
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          padding: { top: 6, bottom: 6, left: 8, right: 8 },
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)',
    },
  });
  
  // ─── Header Row Height ───
  requests.push({
    updateDimensionProperties: {
      range: { sheetId: tabId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 36 },
      fields: 'pixelSize',
    },
  });
  
  // ─── Data Row Default Formatting ───
  requests.push({
    repeatCell: {
      range: { sheetId: tabId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: 15 },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.08, green: 0.08, blue: 0.08 },
          textFormat: {
            foregroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
            fontFamily: 'Arial',
            fontSize: 10,
          },
          verticalAlignment: 'MIDDLE',
          padding: { top: 4, bottom: 4, left: 6, right: 6 },
          wrapStrategy: 'CLIP',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,verticalAlignment,padding,wrapStrategy)',
    },
  });
  
  // ─── Data Validation: Status Dropdown ───
  requests.push({
    setDataValidation: {
      range: { sheetId: tabId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: 1 },
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: [
            { userEnteredValue: 'IDEA' },
            { userEnteredValue: 'APPROVED' },
            { userEnteredValue: 'WRITING' },
            { userEnteredValue: 'DRAFT_READY' },
            { userEnteredValue: 'EDITING' },
            { userEnteredValue: 'PENDING_APPROVAL' },
            { userEnteredValue: 'REVISION' },
            { userEnteredValue: 'SCHEDULED' },
            { userEnteredValue: 'PUBLISHED' },
            { userEnteredValue: 'DENIED' },
          ],
        },
        showCustomUi: true,
        strict: true,
      },
    },
  });
  
  // ─── Data Validation: Template Dropdown ───
  requests.push({
    setDataValidation: {
      range: { sheetId: tabId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 3, endColumnIndex: 4 },
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: [
            { userEnteredValue: 'artist-profile' },
            { userEnteredValue: 'event-preview' },
            { userEnteredValue: 'venue-spotlight' },
            { userEnteredValue: 'scene-analysis' },
            { userEnteredValue: 'list-format' },
            { userEnteredValue: 'hot-take' },
            { userEnteredValue: 'editorial' },
            { userEnteredValue: 'event-recap' },
          ],
        },
        showCustomUi: true,
        strict: true,
      },
    },
  });
  
  // ─── Data Validation: Priority Dropdown ───
  requests.push({
    setDataValidation: {
      range: { sheetId: tabId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 11, endColumnIndex: 12 },
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: [
            { userEnteredValue: 'High' },
            { userEnteredValue: 'Normal' },
            { userEnteredValue: 'Low' },
          ],
        },
        showCustomUi: true,
        strict: true,
      },
    },
  });
  
  // ─── Conditional Formatting: Status Colors ───
  const statusColors = [
    { status: 'IDEA',               bg: { red: 0.1, green: 0.1, blue: 0.18 }, fg: { red: 0.64, green: 0.64, blue: 0.64 } },
    { status: 'APPROVED',           bg: { red: 0.09, green: 0.13, blue: 0.24 }, fg: { red: 1, green: 1, blue: 1 } },
    { status: 'WRITING',            bg: { red: 0.06, green: 0.2, blue: 0.38 }, fg: { red: 1, green: 1, blue: 1 } },
    { status: 'DRAFT_READY',        bg: { red: 0.33, green: 0.2, blue: 0.51 }, fg: { red: 1, green: 1, blue: 1 } },
    { status: 'EDITING',            bg: { red: 0.91, green: 0.27, blue: 0.38 }, fg: { red: 1, green: 1, blue: 1 } },
    { status: 'PENDING_APPROVAL',   bg: { red: 1, green: 0.42, blue: 0.21 }, fg: { red: 1, green: 1, blue: 1 } },
    { status: 'REVISION',           bg: { red: 1, green: 0.27, blue: 0 }, fg: { red: 1, green: 1, blue: 1 } },
    { status: 'SCHEDULED',          bg: { red: 0.18, green: 0.42, blue: 0.31 }, fg: { red: 1, green: 1, blue: 1 } },
    { status: 'PUBLISHED',          bg: { red: 0.11, green: 0.26, blue: 0.2 }, fg: { red: 0.64, green: 0.64, blue: 0.64 } },
    { status: 'DENIED',             bg: { red: 0.24, green: 0, blue: 0 }, fg: { red: 0.4, green: 0.4, blue: 0.4 } },
  ];
  
  for (const { status, bg, fg } of statusColors) {
    requests.push({
      addConditionalFormatRule: {
        rule: {
          ranges: [{ sheetId: tabId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: 15 }],
          booleanRule: {
            condition: {
              type: 'CUSTOM_FORMULA',
              values: [{ userEnteredValue: `=$A2="${status}"` }],
            },
            format: {
              backgroundColor: bg,
              textFormat: { foregroundColor: fg },
            },
          },
        },
        index: 0,
      },
    });
  }
  
  // ─── Status Column Bold + Centered ───
  requests.push({
    repeatCell: {
      range: { sheetId: tabId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: 1 },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true, fontSize: 9, fontFamily: 'Arial' },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat(textFormat,horizontalAlignment)',
    },
  });
  
  // ─── Topic Column Bold ───
  requests.push({
    repeatCell: {
      range: { sheetId: tabId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 1, endColumnIndex: 2 },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true, fontSize: 10 },
        },
      },
      fields: 'userEnteredFormat(textFormat)',
    },
  });
  
  // ─── Date Columns: Number Format ───
  requests.push({
    repeatCell: {
      range: { sheetId: tabId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 5, endColumnIndex: 6 },
      cell: { userEnteredFormat: { numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' } } },
      fields: 'userEnteredFormat.numberFormat',
    },
  });
  requests.push({
    repeatCell: {
      range: { sheetId: tabId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 9, endColumnIndex: 10 },
      cell: { userEnteredFormat: { numberFormat: { type: 'DATE', pattern: 'yyyy-mm-dd' } } },
      fields: 'userEnteredFormat.numberFormat',
    },
  });
  
  // ─── Slug Column: Monospace Font ───
  requests.push({
    repeatCell: {
      range: { sheetId: tabId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 10, endColumnIndex: 11 },
      cell: {
        userEnteredFormat: {
          textFormat: { fontFamily: 'Roboto Mono', fontSize: 9 },
        },
      },
      fields: 'userEnteredFormat(textFormat)',
    },
  });
  
  // ─── Gridlines: Darker borders ───
  requests.push({
    updateBorders: {
      range: { sheetId: tabId, startRowIndex: 0, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: 15 },
      top: { style: 'SOLID', width: 1, color: { red: 0.2, green: 0.2, blue: 0.2 } },
      bottom: { style: 'SOLID', width: 1, color: { red: 0.2, green: 0.2, blue: 0.2 } },
      left: { style: 'SOLID', width: 1, color: { red: 0.15, green: 0.15, blue: 0.15 } },
      right: { style: 'SOLID', width: 1, color: { red: 0.15, green: 0.15, blue: 0.15 } },
      innerHorizontal: { style: 'SOLID', width: 1, color: { red: 0.15, green: 0.15, blue: 0.15 } },
      innerVertical: { style: 'SOLID', width: 1, color: { red: 0.12, green: 0.12, blue: 0.12 } },
    },
  });
  
  // ─── Sheet Tab Color (Red) ───
  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId: tabId,
        tabColor: { red: 1, green: 0.17, blue: 0.17 },
      },
      fields: 'tabColor',
    },
  });
  
  // Execute all formatting
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: { requests },
  });
  
  console.log('✅ Formatting applied:');
  console.log('  • Dark theme (black/red/white)');
  console.log('  • Column widths optimized');
  console.log('  • Header row: frozen, styled');
  console.log('  • Status dropdown (10 statuses)');
  console.log('  • Template dropdown (8 templates)');
  console.log('  • Priority dropdown (High/Normal/Low)');
  console.log('  • Conditional row colors by status');
  console.log('  • Date formatting on due/publish columns');
  console.log('  • Monospace font on slug column');
  console.log('  • Bold topic and status columns');
  console.log('  • Dark gridlines');
  console.log('  • Red tab color');
}

formatSheet().catch(err => {
  console.error('Error:', err.message);
});
