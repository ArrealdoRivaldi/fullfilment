const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCjBlPnJSlEq18tJett5ZdOAcMl2yPvlOE",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "fbb-fullfilment.firebaseapp.com",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://fbb-fullfilment-default-rtdb.firebaseio.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "fbb-fullfilment",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "fbb-fullfilment.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "842233083514",
    appId: process.env.FIREBASE_APP_ID || "1:842233083514:web:beb0ce0ac38fc5825eedc3",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-9RPL0LSY4Q"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
const db = getFirestore(app);

module.exports = async (req, res) => {
  try {
    // Ganti 'house_keeping' dengan nama koleksi Firestore kamu jika berbeda
    const snapshot = await getDocs(collection(db, 'house_keeping'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
