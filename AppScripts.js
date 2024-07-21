function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('User')
        .addItem('Refresh', 'triggerScript')
        .addItem('Create', 'processCreateUser')
        .addItem('Login', 'processLogin')
        .addToUi();
    ui.createMenu('Organization')
        .addItem('Create', 'processCreateOrganization')
        .addItem('Add User to Org', 'processAddUserOrg')
        .addToUi();
  }
  
  function triggerScript() {
    var url = 'https://rbbv4wvz-3000.inc1.devtunnels.ms/run-script'; 
    var payload = {
      message: "Run googleSheets.js"
    };
  
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true // This will prevent the script from stopping on an HTTP error and allow logging of the response
    };
  
    try {
      var response = UrlFetchApp.fetch(url, options);
      Logger.log(response.getContentText());
    } catch (e) {
      Logger.log('Request failed: ' + e.message);
    }
  }
  
  function processCreateUser() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Create User');
    var data = sheet.getRange('A3:E3').getValues()[0];
    
    var username = data[0];
    var email = data[1];
    var password = data[2];
    var roleId = data[3];
    var token = data[4];
  
    var payload = {
      username: username,
      email: email,
      password: password,
      roleId: roleId
    };
  
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-auth-token': token
      },
      payload: JSON.stringify(payload)
    };
  
    try {
      var response = UrlFetchApp.fetch('https://rbbv4wvz-3000.inc1.devtunnels.ms/api/auth/signup', options);
      var responseText = response.getContentText();
      
      // Write response to the sheet
      sheet.getRange('F3').setValue(responseText);
    } catch (e) {
      var errorText = 'Error: ' + e.message;
      
      // Write error to the sheet
      sheet.getRange('F3').setValue(errorText);
    }
  }
  
  function processLogin() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Create User');
    var data = sheet.getRange('A15:B15').getValues()[0];
    
    var email = data[0];
    var password = data[1];
  
    var payload = {
      email: email,
      password: password
    };
  
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    };
  
    try {
      var response = UrlFetchApp.fetch('https://rbbv4wvz-3000.inc1.devtunnels.ms/api/auth/login', options);
      var responseText = response.getContentText();
      
      // Write response to the sheet
      sheet.getRange('F15').setValue(responseText);
    } catch (e) {
      var errorText = 'Error: ' + e.message;
      
      // Write error to the sheet
      sheet.getRange('F15').setValue(errorText);
    }
  }
  
  function processCreateOrganization() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Create User');
    var data = sheet.getRange('A7:E7').getValues()[0];
    
    var name = data[0];
    var token = data[4];
  
    var payload = {
      name: name
    };
  
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-auth-token': token
      },
      payload: JSON.stringify(payload)
    };
  
    try {
      var response = UrlFetchApp.fetch('https://rbbv4wvz-3000.inc1.devtunnels.ms/api/organization/create', options);
      var responseText = response.getContentText();
      
      // Write response to the sheet
      sheet.getRange('F7').setValue(responseText);
    } catch (e) {
      var errorText = 'Error: ' + e.message;
      
      // Write error to the sheet
      sheet.getRange('F7').setValue(errorText);
    }
  }
  
  
  function processLogin() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Create User');
    var data = sheet.getRange('A15:B15').getValues()[0];
    
    var email = data[0];
    var password = data[1];
  
    var payload = {
      email: email,
      password: password
    };
  
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    };
  
    try {
      var response = UrlFetchApp.fetch('https://rbbv4wvz-3000.inc1.devtunnels.ms/api/auth/login', options);
      var responseText = response.getContentText();
      
      // Write response to the sheet
      sheet.getRange('F15').setValue(responseText);
    } catch (e) {
      var errorText = 'Error: ' + e.message;
      
      // Write error to the sheet
      sheet.getRange('F15').setValue(errorText);
    }
  }
  
  function processAddUserOrg() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Create User');
    var data = sheet.getRange('A11:E11').getValues()[0];
    
    var orgName = data[0];
    var username = data[1];
    var token = data[4];
  
  
    var payload = {
      orgName: orgName,
      username: username
    };
  
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-auth-token': token
      },
      payload: JSON.stringify(payload)
    };
  
    try {
      var response = UrlFetchApp.fetch('https://rbbv4wvz-3000.inc1.devtunnels.ms/api/user-org/add-user-org', options);
      var responseText = response.getContentText();
      
      // Write response to the sheet
      sheet.getRange('F11').setValue(responseText);
    } catch (e) {
      var errorText = 'Error: ' + e.message;
      
      // Write error to the sheet
      sheet.getRange('F11').setValue(errorText);
    }
  }