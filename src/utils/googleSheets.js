// Google Sheets Integration for Safisha Hub
// This file handles sending data to Google Sheets via Google Apps Script Web App

const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL || '';

/**
 * Send car wash entry data to Google Sheets
 * @param {Object} entry - The car wash entry data
 * @returns {Promise} - Promise that resolves when data is sent successfully
 */
export async function sendToGoogleSheets(entry) {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn('Google Script URL not configured. Data will only be stored locally.');
    return Promise.resolve();
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'addEntry',
        data: {
          timestamp: entry.time,
          customerName: entry.name,
          phoneNumber: entry.phone,
          location: entry.location,
          vehicleModel: entry.carModel,
          vehicleRegNo: entry.numberPlate,
          serviceMan: entry.attendant1,
          assistant: entry.attendant2,
          serviceType: entry.service,
          paymentMethod: entry.payment,
          amount: entry.amount,
          notes: entry.notes,
          priority: entry.priority,
          entryId: entry.id
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('Data successfully sent to Google Sheets');
      return result;
    } else {
      throw new Error(result.error || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Error sending data to Google Sheets:', error);
    throw error;
  }
}

/**
 * Get all entries from Google Sheets (for syncing)
 * @returns {Promise<Array>} - Promise that resolves to array of entries
 */
export async function getEntriesFromGoogleSheets() {
  if (!GOOGLE_SCRIPT_URL) {
    return [];
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getEntries'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      throw new Error(result.error || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return [];
  }
}

/**
 * Sync local data with Google Sheets
 * This function can be called periodically to ensure data consistency
 * @param {Array} localEntries - Local entries to sync
 * @returns {Promise} - Promise that resolves when sync is complete
 */
export async function syncWithGoogleSheets(localEntries) {
  try {
    // Get remote entries
    const remoteEntries = await getEntriesFromGoogleSheets();

    // Find entries that exist locally but not remotely
    const remoteIds = remoteEntries.map(entry => entry.entryId);
    
    const entriesToUpload = localEntries.filter(entry => 
      !remoteIds.includes(entry.id)
    );

    // Upload missing entries
    for (const entry of entriesToUpload) {
      await sendToGoogleSheets(entry);
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Synced ${entriesToUpload.length} entries to Google Sheets`);
    
    return {
      uploaded: entriesToUpload.length,
      total: localEntries.length
    };
  } catch (error) {
    console.error('Error syncing with Google Sheets:', error);
    throw error;
  }
}

// Google Apps Script Code Template
// Copy this code to your Google Apps Script project:
/*
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'addEntry') {
      return addEntry(data.data);
    } else if (data.action === 'getEntries') {
      return getEntries();
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: 'Invalid action'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addEntry(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 14).setValues([[
      'Timestamp', 'Customer Name', 'Phone Number', 'Location', 
      'Vehicle Model', 'Vehicle Reg No', 'Service Man', 'Assistant',
      'Service Type', 'Payment Method', 'Amount', 'Notes', 'Priority', 'Entry ID'
    ]]);
  }
  
  // Add the new entry
  sheet.appendRow([
    data.timestamp,
    data.customerName,
    data.phoneNumber,
    data.location,
    data.vehicleModel,
    data.vehicleRegNo,
    data.serviceMan,
    data.assistant,
    data.serviceType,
    data.paymentMethod,
    data.amount,
    data.notes,
    data.priority,
    data.entryId
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getEntries() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return ContentService
      .createTextOutput(JSON.stringify({success: true, data: []}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const entries = data.slice(1).map(row => ({
    timestamp: row[0],
    customerName: row[1],
    phoneNumber: row[2],
    location: row[3],
    vehicleModel: row[4],
    vehicleRegNo: row[5],
    serviceMan: row[6],
    assistant: row[7],
    serviceType: row[8],
    paymentMethod: row[9],
    amount: row[10],
    notes: row[11],
    priority: row[12],
    entryId: row[13]
  }));
  
  return ContentService
    .createTextOutput(JSON.stringify({success: true, data: entries}))
    .setMimeType(ContentService.MimeType.JSON);
}
*/
