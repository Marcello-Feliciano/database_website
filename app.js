import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signupBtn = document.getElementById("signup");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");

signupBtn.onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password).catch(console.error);
};

loginBtn.onclick = () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password).catch(console.error);
};

logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, async (user) => {
  const loginScreen = document.getElementById("login-screen");
  const appScreen = document.getElementById("app-screen");

  if (user) {
    document.getElementById("user-email").innerText = user.email;
    loginScreen.style.display = "none";
    appScreen.style.display = "block";
    await loadAllData(user.uid);
  } else {
    loginScreen.style.display = "block";
    appScreen.style.display = "none";
  }
});



window.addItem = async (category) => {
  const user = auth.currentUser;
  if (!user) return;

  const input = document.getElementById(`new-${category}`);
  if (!input) {
    console.error(`Input element #new-${category} not found`);
    return;
  }
  const value = input.value.trim();
  if (!value) return;

  const docRef = doc(db, category, user.uid);
  const docSnap = await getDoc(docRef);
  let data = docSnap.exists() ? docSnap.data().items : [];

  data.push(value);

  await setDoc(docRef, { items: data });
  input.value = "";
  loadItems(category, data);
};

async function loadAllData(uid) {
  await loadCategory("games", uid);
  await loadCategory("movies", uid);
  await loadCategory("books", uid);
  await loadCategory("comics", uid);
}

async function loadCategory(category, uid) {
  const docRef = doc(db, category, uid);
  const docSnap = await getDoc(docRef);
  const data = docSnap.exists() ? docSnap.data().items : [];
  loadItems(category, data);
}

function loadItems(category, items) {
  const list = document.getElementById(`${category}-list`);
  list.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}



