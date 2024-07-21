
# Fretron Assignment

A brief description of what this project does and who it's for

**Objective:** Develop an Express server with specified APIs and integrate it with a Google Sheets workbook.

**Part 1: Express Server**

- Create APIs: For user creation, organization creation, user-organization relationship management, and user permissions management.

- Implement Middleware: For authorization and validation of incoming requests.

- Deliverables: Source code, server setup instructions, and middleware explanation.

**Part 2: Google Sheets Integration**

- Setup Workbook: Four sheets for users, organizations, user-organization relations, and user creation.

- Integrate with Server: Fetch data from the server and handle user creation directly from the sheet.

- Deliverables: Google Sheets link, scripts, and usage instructions.
## Tech Stack


- **Node.js**: JavaScript runtime for server-side development.
- **Express.js**: Web framework for building APIs and handling server logic.
- **MongoDB**: NoSQL database for storing user and organization data.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Google Sheets API**: For interacting with Google Sheets from the server.
- **Google Apps Script**: For scripting Google Sheets to interact with the Express server.
## Structure

```
Fretron/
├── Middleware/
│   └── auth.js
├── models/
│   ├── organization.js
│   ├── role.js
│   ├── user.js
│   ├── userOrg.js
│   └── userRole.js
├── routes/
│   ├── auth.js
│   ├── organization.js
│   └── userorg.js
├── googlesheets.js
├── server.js
├── credentials.json
└── token.json
Apps Script
```
## File Descriptions

#### Middleware & Its Functions

This code defines middleware functions for authentication and authorization in an Express.js application. Here’s a brief explanation of each part:

**`auth` Middleware:**
   - Verifies the JWT in the `x-auth-token` header, attaches user info to `req.user`, and proceeds if valid.

**`adminAuth` Middleware:**
   - Checks if the authenticated user has the "Admin" role and allows access if they do; otherwise, denies access.
   - Used in creating new user.

**`roleAuth` Middleware:**
   - Ensures the authenticated user has one of the specified roles and allows access if they do; otherwise, denies access.
   - Used in adding user to the organization.


This setup ensures that your application can enforce different levels of access control based on user authentication and role authorization.

#### Models

- **organization.js**: Contains the schema definition for the `Organization` model: `_id` `name` 
- **role.js**: Contains the schema definition for the `Role` model: `_id` `role`
- **user.js**: Contains the schema definition for the `User` model: `_id` `username` `email`  `password` `role_id` `createdBy` 
- **userOrg.js**: Contains the schema definition for the `UserOrg` model, managing relationships between users and organizations: `_id` `org` ```(array of users)```

#### Routes

- **auth.js**: Contains API endpoints related to user authentication.
- **organization.js**: Contains API endpoints for managing organizations.
- **userorg.js**: Contains API endpoints for managing user-organization relationships.

#### Other Files

- **googlesheets.js**: Contains the Google Apps Script for adding data from the Express server to Google Sheets.
- **server.js**: Main entry point for the Express server, sets up middleware, routes, and starts the server.
```
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const organizationRoutes = require('./routes/organization');
const userOrgRoutes = require('./routes/userOrg');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/test'; 
mongoose.connect(MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Organization routes
app.use('/api/organization', organizationRoutes); 

// UserOrg routes
app.use('/api/user-org', userOrgRoutes);

app.use(express.json());

//For Running Fetch Data script from Google Sheets
app.post('/run-script', (req, res) => {
  const { message } = req.body;

  if (message === "Run googleSheets.js") {
    exec('node googleSheets.js', (err, stdout) => {
      if (err) {
        console.error(`Error executing script: ${err}`);
        return res.status(500).send('Error executing script');
      }

      console.log(`Script output: ${stdout}`);
      res.send('Script executed successfully');
    });
  } else {
    res.status(400).send('Invalid request');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

```
- **credentials.json**: Contains OAuth client credentials for authenticating with Google APIs.
- **token.json**: Generated by Google Sheets, contains the OAuth token used for accessing Google Sheets APIs.

#### Extensions

- **Apps Scripts**: Extension used from Google Sheets to make a Dashboard

```
// Adds a custom Menu on the sheet
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
```
## Features and Improvements

#### **Dashboard Integration**: 
Instead of just allowing user creation from the Create User Sheet, a comprehensive dashboard was created. This dashboard enables control over all actions directly within Google Sheets, streamlining the management of users, organizations, and their relationships.
#### **Custom Menu in Google Sheets**: 
Added a custom menu in Google Sheets to execute actions like:
                
`User`
  - Create User
  - Fetch Data from Express Server
  - Login
 `Organization`
  - Create Organization
  - Add User to Organization
#### **Enhanced User Management**: 
The dashboard provides an intuitive interface for managing user creation, updating user details, and managing user roles and permissions.
#### **Authorization Middleware**: 
Robust authorization middleware ensures that only users with the necessary permissions can perform certain actions, enhancing security.
#### **Error Handling**: 
Improved error handling mechanisms to provide clear and actionable error messages, helping users understand and rectify issues promptly.


## API References

#### 1. **User Signup**
   - **Endpoint:** `api/auth/signup`
   - **Method:** `POST`
   - **Description:** Creates a new user.
   - **Request Body:**
     ```json
     {
       "username": "string",
       "email": "string",
       "password": "string",
       "role": ObjectID
     }
     ```
   - **Response:**
     ```json
     {
       "msg": 'User already exists'
     }
     ```
      ```json
     {
       "msg": 'Invalid role'
     }
     ```
      ```json
     {
       "msg": 'User registered successfully'
     }
     ```

#### 2. **User Login**
   - **Endpoint:** `api/auth/login`
   - **Method:** `POST`
   - **Description:** Authenticates a user and returns a token.
   - **Request Body:**
     ```json
     {
       "email": "string",
       "password": "string"
     }
     ```
   - **Response:**
   
     ```json
     {
       {"token": token}
     }
     ```
      ```json
     {
       "msg": 'Invalid credentials'
     }
     ```

#### 3. **Create Organization**
   - **Endpoint:** `api/organization/create`
   - **Method:** `POST`
   - **Description:** Creates a new organization.
   - **Request Body:**
     ```json
     {
       "name": "string"
     }
     ```
   - **Response:**
     ```json
     {
       "msg": 'Organization created successfully'
     }
     ```

#### 4. **Add User to Organization**
   - **Endpoint:** `api/user-org/add-user-org`
   - **Method:** `POST`
   - **Description:** Adds a user to an organization.
   - **Request Body:**
     ```json
     {
       "userId": "string",
       "organizationId": "string"
     }
     ```
   - **Response:**
     ```json
     {
       "msg": 'Organization not found'
     }
     ```
      ```json
     {
       "msg": 'User not found'
     }
     ```
      ```json
     {
       "msg": 'User added to organization successfully'
     }
     ```
      ```json
     {
       "msg": 'User already in organization'
     }
     ```
## Usage Instructions

**Start the Server:**
   - Run the following command to start the server:
     ```bash
     node server.js
     ```
**Make the Port Public:**
   - Ensure that port 3000 is accessible publicly. You can do this by using VS Code’s port forwarding feature.

- *Note:* The public URL is hardcoded in the script.

**Access the Google Sheets:**
   - Open the Google Sheets document using the following link:
     [Google Sheets Document](https://docs.google.com/spreadsheets/d/1VKnW61Tb0erE8LVE6l9ZoCo8oWhkrcfpt-AWeeFLKQA/edit?usp=sharin)

**Play:**
   - You can now interact with the dashboard and control actions directly through the Google Sheets interface.



## References

[ChatGPT](https://chatgpt.com/share/0eb6b542-9983-4dae-9996-037febb65d08) : For Help in Projects

[YouTube](https://youtu.be/7H_QH9nipNs?si=GFdT4dUwRLPcRvxd) : Express JS

[Web](https://tutorial.techaltum.com/nodejs.html) : For NodeJS

[Youtube](https://youtu.be/S20PCL9e_ks?si=Kv7S5PcnnzV3uvMp) : JWT Token for Authentication (Middleware)

[Instagram](https://www.instagram.com/reel/C9HyOC6NQ8P/) : For Readme File

[YouTube](https://www.youtube.com/watch?v=Rtpu2cWz7W8) : Readme.so Tutorial