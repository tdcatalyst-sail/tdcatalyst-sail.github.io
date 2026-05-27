// ============================================================
// TDcatalyst — Diagnostic Submission Handler (Fresh Build)
// Captures: All diagnostic data, scores, contact info
// Manages: Submissions sheet, Google Docs, cleanup
// ============================================================

const PARENT_FOLDER_ID = '0AMKqT8DT5gnSUk9PVA';
const RESULTS_FOLDER_NAME = 'diagnostic results';
const SUBMISSIONS_SHEET_NAME = 'TDcatalyst — Diagnostic Submissions';
const TZ = 'America/Los_Angeles';

const COLUMN_HEADERS = [
  'Timestamp',
  'Session ID',
  'Name',
  'Email',
  'Company',
  'Department',
  'Primary Archetype',
  'Secondary Archetype',
  'Seam Score',
  'UP Score',
  'OM Score',
  'Sensing Score',
  'User Agent',
  'Referrer',
  'Submission Doc URL'
];

function getResultsFolder() {
  try {
    const parent = DriveApp.getFolderById(PARENT_FOLDER_ID);
    const folders = parent.getFoldersByName(RESULTS_FOLDER_NAME);
    if (folders.hasNext()) {
      return folders.next();
    }
    return parent.createFolder(RESULTS_FOLDER_NAME);
  } catch (e) {
    throw new Error('Failed to access results folder: ' + e.message);
  }
}

function cleanupAnalyticsSheets(folder) {
  try {
    const files = folder.getFilesByName('TDcatalyst — Analytics');
    while (files.hasNext()) {
      DriveApp.getFileById(files.next().getId()).setTrashed(true);
    }
  } catch (e) {
    Logger.log('Warning: Could not clean up analytics sheets: ' + e.message);
  }
}

function getOrCreateSubmissionsSheet(folder) {
  try {
    // Look for existing sheet
    const files = folder.getFilesByName(SUBMISSIONS_SHEET_NAME);

    if (files.hasNext()) {
      const file = files.next();
      const ss = SpreadsheetApp.open(file);
      const sheet = ss.getActiveSheet();

      // Verify headers are correct
      const lastCol = sheet.getLastColumn();
      if (lastCol > 0) {
        const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

        // If headers match exactly, return this sheet
        if (headerRow.length === COLUMN_HEADERS.length &&
            headerRow.every((h, i) => h === COLUMN_HEADERS[i])) {
          return ss;
        }
      }

      // Headers don't match - trash the old one and create new
      DriveApp.getFileById(file.getId()).setTrashed(true);
    }

    // Create new sheet with correct headers
    const ss = SpreadsheetApp.create(SUBMISSIONS_SHEET_NAME);
    const file = DriveApp.getFileById(ss.getId());
    file.moveTo(folder);

    const sheet = ss.getActiveSheet();
    sheet.appendRow(COLUMN_HEADERS);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, COLUMN_HEADERS.length);

    return ss;
  } catch (e) {
    throw new Error('Failed to setup submissions sheet: ' + e.message);
  }
}

function createSubmissionDoc(data, folder) {
  try {
    const now = new Date();
    const dateStr = Utilities.formatDate(now, TZ, 'yyyy-MM-dd');

    const company = (data.company || 'Anonymous').substring(0, 60);
    const name = (data.name || 'Anonymous').substring(0, 60);
    const archetype = data.archetype || 'Unknown';
    const secondary = data.secondaryArchetype ? ' + ' + data.secondaryArchetype : '';

    const docTitle = `${dateStr} — ${company} / ${name} — ${archetype}${secondary}`;
    const doc = DocumentApp.create(docTitle);
    const body = doc.getBody();

    body.clear();

    // Header
    body.appendParagraph('AI Adoption Stall Diagnostic — Submission')
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph(Utilities.formatDate(now, TZ, "yyyy-MM-dd 'at' HH:mm 'PT'"))
      .setItalic(true);
    body.appendParagraph('');

    // Diagnosis
    body.appendParagraph('Diagnosis')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('Primary Archetype: ' + archetype).setBold(true);
    if (data.signal) {
      body.appendParagraph('Signal: ' + data.signal).setItalic(true);
    }
    if (data.secondaryArchetype) {
      body.appendParagraph('Secondary Pattern: ' + data.secondaryArchetype).setItalic(true);
    }
    body.appendParagraph('');

    // Score Analysis
    if (data.scores) {
      body.appendParagraph('Score Analysis')
        .setHeading(DocumentApp.ParagraphHeading.HEADING2);
      const archetypes = ['Seam', 'UP', 'OM', 'Sensing'];
      archetypes.forEach(function(arch) {
        const score = data.scores[arch];
        if (score !== undefined) {
          const pct = (score * 100).toFixed(1);
          body.appendListItem(arch + ': ' + pct + '%')
            .setGlyphType(DocumentApp.GlyphType.BULLET);
        }
      });
      body.appendParagraph('');
    }

    // Contact Information
    body.appendParagraph('Contact Information')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph('Name: ' + (data.name || '(not provided)'));
    body.appendParagraph('Email: ' + (data.email || '(not provided)'));
    body.appendParagraph('Company: ' + (data.company || '(not provided)'));
    body.appendParagraph('Department: ' + (data.department || '(not provided)'));
    body.appendParagraph('');

    // Session Data
    body.appendParagraph('Session Data')
      .setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendParagraph('Session ID: ' + (data.sessionId || 'N/A')).setFontSize(10);
    if (data.userAgent) {
      body.appendParagraph('User Agent: ' + data.userAgent).setFontSize(10);
    }
    if (data.referrer) {
      body.appendParagraph('Referrer: ' + data.referrer).setFontSize(10);
    }
    body.appendParagraph('');

    // Answers
    if (data.answers && data.answers.length > 0) {
      body.appendParagraph('Full Response History')
        .setHeading(DocumentApp.ParagraphHeading.HEADING2);
      data.answers.forEach(function(a, i) {
        const qNum = 'Q' + (i + 1);
        body.appendParagraph(qNum + '. ' + (a.question || 'Unknown')).setBold(true);
        if (a.section) {
          body.appendParagraph('Section: ' + a.section).setItalic(true);
        }
        if (a.selected && a.selected.length > 0) {
          a.selected.forEach(function(s) {
            body.appendListItem(s).setGlyphType(DocumentApp.GlyphType.BULLET);
          });
        } else {
          body.appendParagraph('(no selection)').setItalic(true);
        }
        body.appendParagraph('');
      });
    }

    doc.saveAndClose();

    // Move to results folder
    DriveApp.getFileById(doc.getId()).moveTo(folder);

    return doc;
  } catch (e) {
    throw new Error('Failed to create submission doc: ' + e.message);
  }
}

function appendSubmissionRow(sheet, data) {
  try {
    const now = new Date();
    const seam = data.scores ? (data.scores.Seam || 0) : 0;
    const up = data.scores ? (data.scores.UP || 0) : 0;
    const om = data.scores ? (data.scores.OM || 0) : 0;
    const sensing = data.scores ? (data.scores.Sensing || 0) : 0;

    // Build row in exact column order
    const row = [
      now,                                  // 1. Timestamp
      data.sessionId || '',                 // 2. Session ID
      data.name || '',                      // 3. Name
      data.email || '',                     // 4. Email
      data.company || '',                   // 5. Company
      data.department || '',                // 6. Department
      data.archetype || '',                 // 7. Primary Archetype
      data.secondaryArchetype || '',        // 8. Secondary Archetype
      (seam * 100).toFixed(1),              // 9. Seam Score
      (up * 100).toFixed(1),                // 10. UP Score
      (om * 100).toFixed(1),                // 11. OM Score
      (sensing * 100).toFixed(1),           // 12. Sensing Score
      data.userAgent || '',                 // 13. User Agent
      data.referrer || '',                  // 14. Referrer
      ''                                    // 15. Submission Doc URL (will add below)
    ];

    sheet.appendRow(row);
  } catch (e) {
    throw new Error('Failed to append submission row: ' + e.message);
  }
}

function updateDocLink(sheet, docUrl) {
  try {
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 15).setValue(docUrl);  // Column 15 is the doc URL column
  } catch (e) {
    throw new Error('Failed to update doc link: ' + e.message);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const folder = getResultsFolder();

    // Clean up any stray analytics sheets
    cleanupAnalyticsSheets(folder);

    // Get/create submissions sheet with correct structure
    const ss = getOrCreateSubmissionsSheet(folder);
    const sheet = ss.getActiveSheet();

    // Create submission document
    const doc = createSubmissionDoc(data, folder);

    // Append row to sheet
    appendSubmissionRow(sheet, data);

    // Update the doc URL in the last row
    updateDocLink(sheet, doc.getUrl());

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('Error in doPost: ' + err.message);
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('TDcatalyst diagnostic submission endpoint. POST only.');
}
