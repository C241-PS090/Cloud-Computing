const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('diabetic-sense'); // Ganti dengan nama bucket Anda

module.exports = { bucket };
