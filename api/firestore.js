const { initializeApp, getApps, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

if (!getApps().length) {
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  } else {
    credential = applicationDefault();
  }
  initializeApp({
    credential,
    // projectId: 'fbb-fullfilment', // tambahkan jika perlu
  });
}
const db = getFirestore();

module.exports = async (req, res) => {
  try {
    const snapshot = await db.collection('house_keeping').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
