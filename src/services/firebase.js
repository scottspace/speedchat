import firebase from 'firebase';

const config = {
    apiKey: "AIzaSyDqRC0gALhK7QWENDwCQqMgub7vlw736W4",
    authDomain: "octochat-772ff.firebaseapp.com",
    databaseURL: "https://octochat-772ff.firebaseio.com",
    projectId: "octochat-772ff"
};

firebase.initializeApp(config);
export const auth = firebase.auth;
export const db = firebase.database();
const fs = firebase.firestore();
export const usersRef = fs.collection('users'); 