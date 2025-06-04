// Google Apps Script for Safisha Hub
// Copy this entire code to your Google Apps Script project

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Handle different actions
    if (data.action === 'addEntry') {
      return addEntry(data.data);
    } else if (data.action === 'getEntries') {
      return getEntries();
    }
    
    // Return error for invalid action
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: 'Invalid action'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addEntry(data) {
  try {
    // Get the active spreadsheet and sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp', 'Customer Name', 'Phone Number', 'Location', 
        'Vehicle Model', 'Vehicle Reg No', 'Service Man', 'Assistant',
        'Service Type', 'Payment Method', 'Amount', 'Notes', 'Priority', 'Entry ID'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
    }
    
    // Prepare the row data
    const rowData = [
      data.timestamp || new Date().toLocaleString(),
      data.customerName || '',
      data.phoneNumber || '',
      data.location || '',
      data.vehicleModel || '',
      data.vehicleRegNo || '',
      data.serviceMan || '',
      data.assistant || '',
      data.serviceType || '',
      data.paymentMethod || '',
      data.amount || '',
      data.notes || '',
      data.priority || 'Normal',
      data.entryId || ''
    ];
    
    // Add the new entry
    sheet.appendRow(rowData);
    
    // Auto-resize columns for better visibility
    sheet.autoResizeColumns(1, rowData.length);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Entry added successfully',
        rowNumber: sheet.getLastRow()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Failed to add entry: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getEntries() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Return empty array if no data or only headers
    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true, 
          data: []
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Convert rows to objects (skip header row)
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
      .createTextOutput(JSON.stringify({
        success: true,
        data: entries
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Failed to get entries: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function - you can run this to test the script
function testScript() {
  const testData = {
    action: 'addEntry',
    data: {
      timestamp: new Date().toLocaleString(),
      customerName: 'Test Customer',
      phoneNumber: '0712345678',
      location: 'Test Location',
      vehicleModel: 'Toyota Camry',
      vehicleRegNo: 'KCA 123A',
      serviceMan: 'John Kamau',
      assistant: '',
      serviceType: 'Exterior Wash',
      paymentMethod: 'Cash',
      amount: '500',
      notes: 'Test entry',
      priority: 'Normal',
      entryId: 'test_' + Date.now()
    }
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log(result.getContent());
}
