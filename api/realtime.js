const { initializeApp, getApps, applicationDefault, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

if (!getApps().length) {
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  } else {
    credential = applicationDefault();
  }
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://fbb-fullfilment-default-rtdb.firebaseio.com';
  initializeApp({
    credential,
    databaseURL,
  });
}
const db = getDatabase();

module.exports = async (req, res) => {
  const { method, query } = req;
  if (method === 'GET' && query.last_updated) {
    try {
      const ref = db.ref();
      ref.once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data || typeof data !== 'object') {
          res.status(500).json({ error: 'Data not found or invalid format' });
          return;
        }
        let maxUpdateTs = null;
        Object.values(data || {}).forEach(item => {
          if (item && item.update_ts) {
            const ts = new Date(item.update_ts).getTime() || Number(item.update_ts);
            if (!isNaN(ts)) {
              if (maxUpdateTs === null || ts > maxUpdateTs) {
                maxUpdateTs = ts;
              }
            }
          }
        });
        if (maxUpdateTs) {
          res.status(200).json({ last_updated: new Date(maxUpdateTs).toISOString() });
        } else {
          res.status(200).json({ last_updated: null });
        }
      }, (error) => {
        console.error('Firebase error:', error);
        res.status(500).json({ error: error.message });
      });
    } catch (error) {
      console.error('Catch error:', error);
      res.status(500).json({ error: error.message });
    }
    return;
  }
  if (method === 'GET') {
    try {
      const ref = db.ref();
      ref.once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data || typeof data !== 'object') {
          res.status(500).json({ error: 'Data not found or invalid format' });
          return;
        }
        res.status(200).json(data);
      }, (error) => {
        console.error('Firebase error:', error);
        res.status(500).json({ error: error.message });
      });
    } catch (error) {
      console.error('Catch error:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (method === 'PUT') {
    try {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      const { id, ...updateData } = body;
      if (typeof id === 'undefined') return res.status(400).json({ error: 'Missing id' });
      updateData.update_ts = new Date().toISOString();
      await db.ref(id).update(updateData);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Catch error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 