// Firebase config & initialization
const firebaseConfig = {
  apiKey: "AIzaSyCjBlPnJSlEq18tJett5ZdOAcMl2yPvlOE",
  authDomain: "fbb-fullfilment.firebaseapp.com",
  databaseURL: "https://fbb-fullfilment-default-rtdb.firebaseio.com",
  projectId: "fbb-fullfilment",
  storageBucket: "fbb-fullfilment.firebasestorage.app",
  messagingSenderId: "842233083514",
  appId: "1:842233083514:web:beb0ce0ac38fc5825eedc3",
  measurementId: "G-9RPL0LSY4Q"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const firestore = firebase.firestore();

// Export for use in other scripts
window._firebase = { auth, firestore }; 