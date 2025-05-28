const { initializeApp, applicationDefault, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
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
