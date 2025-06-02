const { getDatabase } = require('firebase-admin/database');
const { getApps, applicationDefault, cert, initializeApp } = require('firebase-admin/app');

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { id, ...updateData } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    await db.ref(id).update(updateData);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 