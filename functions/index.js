const functions = require('firebase-functions');
const admin = require('firebase-admin');
const atob = require('atob');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

const PROJECT_ID = 'neurog-206604';
const REGION = 'asia-east1';
const REGISTRY = 'FactoryEightReg';
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.receiveTelemetry = functions.pubsub
  .topic('HeliumData')
  .onPublish(event => {
    const attributes = event.attributes;
    const message = JSON.parse(atob(event.data));

    const deviceId = attributes.deviceId;
    const data = {
      deviceId: deviceId,
      timestamp: Date.now(),
      heartRate: parseFloat(message.heartRate),
      GSR: parseFloat(message.GSR),
      poorQuality: parseFloat(message.poorQuality),
      attention: parseFloat(message.attention),
      meditation: parseFloat(message.meditation)
    };

    return Promise.all([db.collection('health-data').add(data)]);
  });