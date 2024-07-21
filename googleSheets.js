const { google } = require('googleapis');
const mongoose = require('mongoose');
const UserOrg = require('./models/userOrg');
const Organization = require('./models/organization');
const User = require('./models/user');
const fs = require('fs');
const path = require('path');

// Load OAuth2 credentials
const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'credentials.json')));

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(__dirname, 'token.json');

// Load or create token
const getOAuth2Client = () => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
};

const authorize = (callback) => {
  const oAuth2Client = getOAuth2Client();
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
};

const getNewToken = (oAuth2Client, callback) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
};

// Write data to Google Sheets
const writeToSheetuserOrg = async (auth) => {
  const sheets = google.sheets({ version: 'v4', auth });

  // Replace with your spreadsheet ID and range
  const spreadsheetId = '1VKnW61Tb0erE8LVE6l9ZoCo8oWhkrcfpt-AWeeFLKQA';
  const range = 'userOrg!A2:Z'; // Adjust range as needed

  // Clear the range
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: range,
  });

  // Connect to MongoDB and fetch data
  await mongoose.connect('mongodb://localhost:27017/test');
  
  const userOrgs = await UserOrg.find().populate('org').populate('users');
  
  const values = [];
  for (const userOrg of userOrgs) {
    const orgName = userOrg.org.name;
    for (const user of userOrg.users) {
      values.push([orgName, user.username, user.email]);
    }
  }

  const resource = {
    values,
  };

  sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource,
  }, (err, result) => {
    if (err) return console.error('API error:', err);
    console.log(`${result.data.updatedCells} cells updated.`);
  });
};

const writeToSheetusers = async (auth) => {
  const sheets = google.sheets({ version: 'v4', auth });

  // Replace with your spreadsheet ID and range
  const spreadsheetId = '1VKnW61Tb0erE8LVE6l9ZoCo8oWhkrcfpt-AWeeFLKQA';
  const range = 'Users!A2:Z'; // Adjust range as needed

  // Clear the range
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: range,
  });

  // Connect to MongoDB and fetch data
  await mongoose.connect('mongodb://localhost:27017/test');
  
  const users = await User.find().populate('username').populate('email').populate('createdBy');
  
  const values = [];
  for (const user of users) {
      values.push([user.username, user.email, user.createdBy.username.toString()]);
  }

  const resource = {
    values,
  };

  sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource,
  }, (err, result) => {
    if (err) return console.error('API error:', err);
    console.log(`${result.data.updatedCells} cells updated.`);
  });
};

const writeToSheetorgs = async (auth) => {
  const sheets = google.sheets({ version: 'v4', auth });

  // Replace with your spreadsheet ID and range
  const spreadsheetId = '1VKnW61Tb0erE8LVE6l9ZoCo8oWhkrcfpt-AWeeFLKQA';
  const range = 'Organizations!A2:Z'; // Adjust range as needed

  // Clear the range
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: range,
  });

  // Connect to MongoDB and fetch data
  await mongoose.connect('mongodb://localhost:27017/test');
  
  const orgs = await Organization.find().populate('name');
  
  const values = [];
  for (const org of orgs) {
      values.push([org.name]);
  }

  const resource = {
    values,
  };

  sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    resource,
  }, (err, result) => {
    if (err) return console.error('API error:', err);
    console.log(`${result.data.updatedCells} cells updated.`);
  });
};

authorize(writeToSheetuserOrg);
authorize(writeToSheetusers);
authorize(writeToSheetorgs);
