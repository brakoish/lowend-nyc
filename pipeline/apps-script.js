/**
 * apps-script.js — Google Apps Script for LOWEND NYC Pipeline
 * 
 * Paste this into your Google Sheet:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this code
 * 4. Save and run setup()
 * 5. Set up triggers for onEdit and dailyCheck
 * 
 * This provides in-sheet automation:
 * - Dropdown menus for Status, Template, Priority
 * - Automatic timestamps
 * - Slug generation
 * - Color coding by status
 * - Notification triggers
 */

// ─── Configuration ───

const DISCORD_WEBHOOK = 'YOUR_DISCORD_WEBHOOK_URL'; // Replace with yours
const PIPELINE_SHEET = 'Pipeline';

// ─── Setup ───

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PIPELINE_SHEET);
  
  if (!sheet) {
    sheet = ss.insertSheet(PIPELINE_SHEET);
  }
  
  // Set headers
  const headers = [
    'Status', 'Topic', 'Angle', 'Template', 'Writer',
    'Draft Due', 'Editor', 'Draft Link', 'Your Notes',
    'Publish Date', 'Slug', 'Priority', 'Genre',
    'Created', 'Updated'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#0A0A0A')
    .setFontColor('#FF2B2B')
    .setFontFamily('Helvetica')
    .setFontSize(10);
  
  // Set column widths
  sheet.setColumnWidth(1, 140);  // Status
  sheet.setColumnWidth(2, 300);  // Topic
  sheet.setColumnWidth(3, 200);  // Angle
  sheet.setColumnWidth(4, 130);  // Template
  sheet.setColumnWidth(5, 100);  // Writer
  sheet.setColumnWidth(6, 100);  // Draft Due
  sheet.setColumnWidth(7, 100);  // Editor
  sheet.setColumnWidth(8, 200);  // Draft Link
  sheet.setColumnWidth(9, 200);  // Your Notes
  sheet.setColumnWidth(10, 100); // Publish Date
  sheet.setColumnWidth(11, 150); // Slug
  sheet.setColumnWidth(12, 80);  // Priority
  sheet.setColumnWidth(13, 150); // Genre
  sheet.setColumnWidth(14, 130); // Created
  sheet.setColumnWidth(15, 130); // Updated
  
  // Add data validation (dropdowns)
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'IDEA', 'APPROVED', 'WRITING', 'DRAFT_READY',
      'EDITING', 'PENDING_APPROVAL', 'REVISION',
      'SCHEDULED', 'PUBLISHED', 'DENIED'
    ], true)
    .setAllowInvalid(false)
    .build();
  
  const templateRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      'artist-profile', 'event-preview', 'venue-spotlight',
      'scene-analysis', 'list-format', 'hot-take', 'editorial'
    ], true)
    .setAllowInvalid(false)
    .build();
  
  const priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['High', 'Normal', 'Low'], true)
    .setAllowInvalid(false)
    .build();
  
  // Apply to column ranges (rows 2-100)
  sheet.getRange(2, 1, 99, 1).setDataValidation(statusRule);   // Status
  sheet.getRange(2, 4, 99, 1).setDataValidation(templateRule);  // Template
  sheet.getRange(2, 12, 99, 1).setDataValidation(priorityRule); // Priority
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Set date format for Draft Due and Publish Date
  sheet.getRange(2, 6, 99, 1).setNumberFormat('yyyy-mm-dd');
  sheet.getRange(2, 10, 99, 1).setNumberFormat('yyyy-mm-dd');
  
  Logger.log('Setup complete!');
  SpreadsheetApp.getUi().alert('Pipeline sheet setup complete!');
}

// ─── Triggers ───

/**
 * Runs when any cell is edited
 * Handles: auto-timestamps, slug generation, color coding, notifications
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  if (sheet.getName() !== PIPELINE_SHEET) return;
  
  const row = e.range.getRow();
  const col = e.range.getColumn();
  
  if (row === 1) return; // Skip header
  
  const now = new Date().toISOString();
  
  // Always update "Updated" timestamp (column 15)
  sheet.getRange(row, 15).setValue(now);
  
  // If "Created" is empty, set it (column 14)
  if (!sheet.getRange(row, 14).getValue()) {
    sheet.getRange(row, 14).setValue(now);
  }
  
  // If Topic changed and Slug is empty, auto-generate slug
  if (col === 2) { // Topic column
    const topic = e.value || '';
    const slug = topic.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    if (!sheet.getRange(row, 11).getValue()) {
      sheet.getRange(row, 11).setValue(slug);
    }
  }
  
  // If Status changed, handle transitions
  if (col === 1) {
    const newStatus = e.value;
    colorCodeRow(sheet, row, newStatus);
    
    // Send Discord notification for key transitions
    if (newStatus === 'APPROVED') {
      const topic = sheet.getRange(row, 2).getValue();
      sendDiscordNotification(`✅ **Topic Approved**: ${topic}\nRow #${row} — Writer agent will be spawned.`);
    }
    
    if (newStatus === 'PENDING_APPROVAL') {
      const topic = sheet.getRange(row, 2).getValue();
      const slug = sheet.getRange(row, 11).getValue();
      sendDiscordNotification(`📄 **Draft Ready for Review**: ${topic}\nSlug: ${slug} | Row #${row}`);
    }
    
    if (newStatus === 'PUBLISHED') {
      const topic = sheet.getRange(row, 2).getValue();
      const slug = sheet.getRange(row, 11).getValue();
      sendDiscordNotification(`🚀 **Published**: ${topic}\nhttps://lowend-nyc.vercel.app/articles/${slug}`);
    }
  }
}

/**
 * Color code a row based on status
 */
function colorCodeRow(sheet, row, status) {
  const colors = {
    'IDEA':               '#1a1a2e',
    'APPROVED':           '#16213e',
    'WRITING':            '#0f3460',
    'DRAFT_READY':        '#533483',
    'EDITING':            '#e94560',
    'PENDING_APPROVAL':   '#ff6b35',
    'REVISION':           '#ff4500',
    'SCHEDULED':          '#2d6a4f',
    'PUBLISHED':          '#1b4332',
    'DENIED':             '#3d0000',
  };
  
  const textColors = {
    'IDEA':               '#a3a3a3',
    'APPROVED':           '#ffffff',
    'WRITING':            '#ffffff',
    'DRAFT_READY':        '#ffffff',
    'EDITING':            '#ffffff',
    'PENDING_APPROVAL':   '#ffffff',
    'REVISION':           '#ffffff',
    'SCHEDULED':          '#ffffff',
    'PUBLISHED':          '#a3a3a3',
    'DENIED':             '#666666',
  };
  
  const bgColor = colors[status] || '#1a1a1a';
  const textColor = textColors[status] || '#ffffff';
  
  sheet.getRange(row, 1, 1, 15)
    .setBackground(bgColor)
    .setFontColor(textColor);
}

// ─── Discord Integration ───

function sendDiscordNotification(message) {
  if (!DISCORD_WEBHOOK || DISCORD_WEBHOOK === 'YOUR_DISCORD_WEBHOOK_URL') {
    Logger.log('Discord webhook not configured: ' + message);
    return;
  }
  
  try {
    const payload = {
      username: 'LOWEND NYC Pipeline',
      content: message,
    };
    
    UrlFetchApp.fetch(DISCORD_WEBHOOK, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
    });
  } catch (error) {
    Logger.log('Discord notification failed: ' + error.message);
  }
}

// ─── Daily Check (Set up as time-driven trigger) ───

function dailyCheck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PIPELINE_SHEET);
  
  if (!sheet) return;
  
  const data = sheet.getDataRange().getValues();
  const stats = {
    ideas: 0,
    writing: 0,
    pendingApproval: 0,
    scheduled: 0,
    published: 0,
  };
  
  // Skip header (row 0)
  for (let i = 1; i < data.length; i++) {
    const status = data[i][0];
    switch (status) {
      case 'IDEA': stats.ideas++; break;
      case 'WRITING': stats.writing++; break;
      case 'PENDING_APPROVAL': stats.pendingApproval++; break;
      case 'SCHEDULED': stats.scheduled++; break;
      case 'PUBLISHED': stats.published++; break;
    }
  }
  
  // Check for overdue drafts
  const today = new Date();
  let overdue = 0;
  for (let i = 1; i < data.length; i++) {
    const status = data[i][0];
    const draftDue = data[i][5];
    
    if ((status === 'WRITING' || status === 'EDITING') && draftDue) {
      const dueDate = new Date(draftDue);
      if (dueDate < today) {
        overdue++;
      }
    }
  }
  
  let summary = `📊 **Daily Pipeline Summary**\n`;
  summary += `Ideas: ${stats.ideas} | Writing: ${stats.writing} | Pending Review: ${stats.pendingApproval}\n`;
  summary += `Scheduled: ${stats.scheduled} | Published: ${stats.published}`;
  
  if (overdue > 0) {
    summary += `\n⚠️ **${overdue} overdue draft(s)**`;
  }
  
  if (stats.pendingApproval > 0) {
    summary += `\n🔔 **${stats.pendingApproval} article(s) awaiting your review**`;
  }
  
  sendDiscordNotification(summary);
}

// ─── Utility Functions ───

/**
 * Add a new topic from a menu
 */
function addTopicFromMenu() {
  const ui = SpreadsheetApp.getUi();
  
  const topicResponse = ui.prompt('New Topic', 'Enter the article topic:', ui.ButtonSet.OK_CANCEL);
  if (topicResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const angleResponse = ui.prompt('Angle', 'What angle/approach?', ui.ButtonSet.OK_CANCEL);
  if (angleResponse.getSelectedButton() !== ui.Button.OK) return;
  
  const topic = topicResponse.getResponseText();
  const angle = angleResponse.getResponseText();
  const now = new Date().toISOString();
  const slug = topic.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 50);
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PIPELINE_SHEET);
  sheet.appendRow([
    'IDEA', topic, angle, '', '', '', '', '', '', '', slug, 'Normal', '', now, now
  ]);
  
  colorCodeRow(sheet, sheet.getLastRow(), 'IDEA');
  sendDiscordNotification(`📝 **New Topic**: ${topic}\nAngle: ${angle}`);
  
  ui.alert('Topic added!');
}

/**
 * Create custom menu
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('LOWEND NYC')
    .addItem('Add New Topic', 'addTopicFromMenu')
    .addItem('Send Daily Summary', 'dailyCheck')
    .addItem('Setup Sheet', 'setup')
    .addToUi();
}
