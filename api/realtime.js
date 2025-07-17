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
        // Filter by NOP if provided
        const nop = (query.nop || '').trim().toLowerCase();
        let filteredData = data;
        if (nop && nop !== 'kalimantan') {
          filteredData = {};
          Object.entries(data).forEach(([key, item]) => {
            if ((item.branch || '').trim().toLowerCase() === nop) {
              filteredData[key] = item;
            }
          });
        }
        res.status(200).json(filteredData);
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
      // Only update pic_dept if provided
      if (typeof updateData.pic_dept === 'undefined') delete updateData.pic_dept;
      await db.ref(id).update(updateData);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Catch error:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (method === 'POST' && req.url.includes('update-status-hk')) {
    // Batch update status_hk berdasarkan order_id
    try {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      const { data } = body;
      if (!Array.isArray(data)) return res.status(400).json({ success: false, error: 'Data harus array' });
      const ref = db.ref();
      const snapshot = await ref.once('value');
      const allData = snapshot.val();
      let updated = 0, failed = 0, errors = [];
      for (const row of data) {
        if (!row.order_id || typeof row.status_hk === 'undefined') {
          failed++;
          errors.push(`order_id/status_hk kosong`);
          continue;
        }
        // Cari key child yang order_id-nya cocok
        const key = Object.keys(allData).find(k => allData[k] && allData[k].order_id == row.order_id);
        if (key) {
          try {
            const updateObj = { status_hk: row.status_hk, update_ts: new Date().toISOString() };
            if (typeof row.pic_dept !== 'undefined') updateObj.pic_dept = row.pic_dept;
            await db.ref(key).update(updateObj);
            updated++;
          } catch (e) {
            failed++;
            errors.push(`order_id ${row.order_id}: ${e.message}`);
          }
        } else {
          failed++;
          errors.push(`order_id ${row.order_id} tidak ditemukan`);
        }
      }
      res.status(200).json({ success: true, updated, failed, errors });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}; 