const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  createdBy:{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('User', UserSchema);
