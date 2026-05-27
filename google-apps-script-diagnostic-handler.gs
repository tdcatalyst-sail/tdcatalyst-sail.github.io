// ============================================================
// TDcatalyst — Enhanced Diagnostic Submission Handler
// Captures: Primary + secondary archetypes, all normalized scores,
// full response history, and analytics aggregation
// ============================================================

const PARENT_ID = '0AMKqT8DT5gnSUk9PVA';
const SUBFOLDER_NAME = 'diagnostic results';
const SUBMISSIONS_SHEET = 'TDcatalyst — Diagnostic Submissions';
const TZ = 'America/Los_Angeles';

function getTargetFolder() {
  const parent = DriveApp.getFolderById(PARENT_ID);
  const iter = parent.getFoldersByName(SUBFOLDER_NAME);
  if (iter.hasNext()) return iter.next();
  return parent.createFolder(SUBFOLDER_NAME);
}

function ensureSubmissionsSheet(folder) {
  const expectedHeaders = [
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

  const iter = folder.getFilesByName(SUBMISSIONS_SHEET);
  if (iter.hasNext()) {
    const file = iter.next();
    const ss = SpreadsheetApp.open(file);
    const sheet = ss.getActiveSheet();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // If headers don't match, delete and recreate
    if (headers.length !== expectedHeaders.length || headers.join('|') !== expectedHeaders.join('|')) {
      Drive.Files.remove(file.getId());
      return createSubmissionsSheet(folder, expectedHeaders);
    }
    return ss;
  }

  return createSubmissionsSheet(folder, expectedHeaders);
}

function createSubmissionsSheet(folder, headers) {
  const ss = SpreadsheetApp.create(SUBMISSIONS_SHEET);
  DriveApp.getFileById(ss.getId()).moveTo(folder);
  const sheet = ss.getActiveSheet();
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
  return ss;
}


function createSubmissionDocument(data, folder) {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, TZ, 'yyyy-MM-dd');

  const company = (data.company || 'Unknown company').substring(0, 60);
  const name = (data.name || 'Anonymous').substring(0, 60);
  const archetype = data.archetype || 'Unknown';
  const secondary = data.secondaryArchetype ? ' / ' + data.secondaryArchetype : '';

  const docTitle = dateStr + ' — ' + company + ' / ' + name + ' — ' + archetype + secondary;
  const doc = DocumentApp.create(docTitle);
  const body = doc.getBody();

  // Clear default paragraph
  body.clear();

  // Header
  body.appendParagraph('AI Adoption Stall Diagnostic — Submission').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(Utilities.formatDate(now, TZ, "yyyy-MM-dd 'at' HH:mm 'PT'")).setItalic(true);
  body.appendParagraph('');

  // Result
  body.appendParagraph('Diagnosis').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph('Primary Archetype: ' + archetype).setBold(true);
  if (data.signal) body.appendParagraph('Signal: ' + data.signal).setItalic(true);
  if (data.secondaryArchetype) {
    body.appendParagraph('Secondary Pattern: ' + data.secondaryArchetype).setItalic(true);
  }
  body.appendParagraph('');

  // Score Breakdown
  if (data.scores) {
    body.appendParagraph('Score Analysis').setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const archetypes = ['Seam', 'UP', 'OM', 'Sensing'];
    archetypes.forEach(function (arch) {
      const score = data.scores[arch];
      if (score !== undefined) {
        const pct = (score * 100).toFixed(1);
        body.appendListItem(arch + ': ' + pct + '%').setGlyphType(DocumentApp.GlyphType.BULLET);
      }
    });
    body.appendParagraph('');
  }

  // Contact
  body.appendParagraph('Contact Information').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph('Name: ' + (data.name || '(not provided)'));
  body.appendParagraph('Email: ' + (data.email || '(not provided)'));
  body.appendParagraph('Company: ' + (data.company || '(not provided)'));
  body.appendParagraph('Department / Role: ' + (data.department || '(not provided)'));
  body.appendParagraph('');

  // Session & Metadata
  body.appendParagraph('Session Data').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph('Session ID: ' + (data.sessionId || 'N/A')).setFontSize(10);
  if (data.userAgent) body.appendParagraph('User Agent: ' + data.userAgent).setFontSize(10);
  if (data.referrer) body.appendParagraph('Referrer: ' + data.referrer).setFontSize(10);
  body.appendParagraph('');

  // Answers
  body.appendParagraph('Full Response History').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  if (data.answers && data.answers.length) {
    (data.answers || []).forEach(function (a, i) {
      const qNum = 'Q' + (i + 1);
      body.appendParagraph(qNum + '. ' + (a.question || 'Unknown')).setBold(true);
      if (a.section) body.appendParagraph('Section: ' + a.section).setItalic(true);
      if (a.selected && a.selected.length) {
        a.selected.forEach(function (s) {
          body.appendListItem(s).setGlyphType(DocumentApp.GlyphType.BULLET);
        });
      } else {
        body.appendParagraph('(no selection)').setItalic(true);
      }
      body.appendParagraph('');
    });
  }

  doc.saveAndClose();
  return doc;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const folder = getTargetFolder();
    const now = new Date();

    // Clean up any old analytics sheet
    const analyticsIter = folder.getFilesByName('TDcatalyst — Analytics');
    if (analyticsIter.hasNext()) {
      Drive.Files.remove(analyticsIter.next().getId());
    }

    // Ensure submissions sheet exists
    const submissionsSheet = ensureSubmissionsSheet(folder);

    // Create submission document
    const doc = createSubmissionDocument(data, folder);
    DriveApp.getFileById(doc.getId()).moveTo(folder);

    // Append to submissions sheet
    const sheet = submissionsSheet.getActiveSheet();
    const seam = data.scores ? (data.scores.Seam || 0) : 0;
    const up = data.scores ? (data.scores.UP || 0) : 0;
    const om = data.scores ? (data.scores.OM || 0) : 0;
    const sensing = data.scores ? (data.scores.Sensing || 0) : 0;

    const row = [
      now,                                  // Timestamp
      data.sessionId || '',                 // Session ID
      data.name || '',                      // Name
      data.email || '',                     // Email
      data.company || '',                   // Company
      data.department || '',                // Department
      data.archetype || '',                 // Primary Archetype
      data.secondaryArchetype || '',        // Secondary Archetype
      (seam * 100).toFixed(1),              // Seam Score
      (up * 100).toFixed(1),                // UP Score
      (om * 100).toFixed(1),                // OM Score
      (sensing * 100).toFixed(1),           // Sensing Score
      data.userAgent || '',                 // User Agent
      data.referrer || '',                  // Referrer
      doc.getUrl()                          // Submission Doc URL
    ];
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('TDcatalyst diagnostic submission endpoint. POST only.');
}
