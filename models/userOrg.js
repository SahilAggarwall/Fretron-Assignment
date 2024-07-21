const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserOrgSchema = new Schema({
  org: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model('UserOrg', UserOrgSchema);
