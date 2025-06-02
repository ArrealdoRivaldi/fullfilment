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
  const { method, query } = req;
  if (method === 'GET' && query.last_updated) {
    try {
      const ref = db.ref('last_updated');
      ref.once('value', (snapshot) => {
        res.status(200).json({ last_updated: snapshot.val() });
      }, (error) => {
        res.status(500).json({ error: error.message });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
    return;
  }
  if (method === 'GET') {
    try {
      const ref = db.ref();
      ref.once('value', (snapshot) => {
        res.status(200).json(snapshot.val());
      }, (error) => {
        res.status(500).json({ error: error.message });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (method === 'PUT') {
    try {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      const { id, ...updateData } = body;
      if (typeof id === 'undefined') return res.status(400).json({ error: 'Missing id' });
      await db.ref(id).update(updateData);
      await db.ref('last_updated').set(Date.now());
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 