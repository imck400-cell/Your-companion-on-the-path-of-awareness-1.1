const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const cfg = require('../firebase-applet-config.json');

const app = initializeApp(cfg);
const db = getFirestore(app, cfg.firestoreDatabaseId);

async function main() {
  const snapshot = await getDocs(collection(db, 'pages'));
  snapshot.forEach(doc => {
    console.log(`ID: ${doc.id}, Slug: ${doc.data().slug}, Title: ${doc.data().title.en}`);
  });
}

main().catch(console.error);
