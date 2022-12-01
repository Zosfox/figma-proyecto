
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: 'AIzaSyCcexOShH5jjP-wEjp079Vpp3hOVEAg2iY',
  authDomain: 'proyecto-figma.firebaseapp.com',
  projectId: 'proyecto-figma',
  storageBucket: 'proyecto-figma.appspot.com',
  messagingSenderId: '316746621766',
  appId: '1:316746621766:web:75731fac8448e9b7f0fb47'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export{
    db
}