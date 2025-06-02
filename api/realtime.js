const { initializeApp, getApps, applicationDefault, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

if (!getApps().length) {
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  } else {
    credential = applicationDefault();
  }
  initializeApp({
    credential,
    databaseURL: 'https://fbb-fullfilment-default-rtdb.firebaseio.com',
  });
}
const db = getDatabase();

module.exports = async (req, res) => {
  try {
    // Ganti 'your_path' dengan path data yang ingin diambil, misal 'fallout'
    const ref = db.ref('data');
    ref.once('value', (snapshot) => {
      res.status(200).json(snapshot.val());
    }, (error) => {
      res.status(500).json({ error: error.message });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 