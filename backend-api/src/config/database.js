require('dotenv').config();
const { Firestore, FieldValue } = require('@google-cloud/firestore');
const firestore = new Firestore();

module.exports = { firestore, FieldValue };
