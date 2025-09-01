import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Small helper
const $ = (id) => document.getElementById(id);

function bindAuthButtons() {
  const signupBtn = $("signup");
  const loginBtn = $("login");
  const logoutBtn = $("logout");

  if (!signupBtn || !loginBtn || !logoutBtn) {
    console.error("Auth buttons not found. Check index.html IDs.");
    return;
  }

  signupBtn.addEventListener("click", async () => {
    const email = $("email").value.trim();
    const password = $("password").value;
    if (!email || !password) return alert("Please enter email and password.");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      alert(err.message || "Signup failed.");
    }
  });

  loginBtn.addEventListener("click", async () => {
    const email = $("email").value.trim();
    const password = $("password").value;
    if (!email || !password) return alert("Please enter email and password.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      alert(err.message || "Login failed.");
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
      alert(err.message || "Logout failed.");
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  const loginScreen = $("login-screen");
  const appScreen = $("app-screen");

  if (!loginScreen || !appScreen) {
    console.error("Screens not found. Check index.html IDs.");
    return;
  }

  if (user) {
    $("user-email").innerText = user.email;
    loginScreen.style.display = "none";
    appScreen.style.display = "block";
    await loadAllData(user.uid);
  } else {
    loginScreen.style.display = "block";
    appScreen.style.display = "none";
  }
});

// ---- Data logic (same as your working version) ----

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
  let data = docSnap.exists() ? (docSnap.data().items || []) : [];

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
  const data = docSnap.exists() ? (docSnap.data().items || []) : [];
  loadItems(category, data);
}

function loadItems(category, items) {
  const list = document.getElementById(`${category}-list`);
  if (!list) return;
  list.innerHTML = "";

  items.forEach((item, index) => {
    const li = document.createElement("li");

    // Text span
    const textSpan = document.createElement("span");
    textSpan.textContent = item;

    // Edit functionality
    editBtn.onclick = () => {
      const newValue = prompt("Edit item:", item);
      if (newValue && newValue.trim() !== "") {
        const updatedItems = items.map((i, idx) => (idx === index ? newValue.trim() : i));
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        loadItems(); // reload list with updated value
      }
    };

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "✖";
    delBtn.style.marginLeft = "10px";
    delBtn.style.backgroundColor = "#e74c3c"; // red
    delBtn.style.color = "white";
    delBtn.style.border = "none";
    delBtn.style.borderRadius = "50%";
    delBtn.style.width = "24px";
    delBtn.style.height = "24px";
    delBtn.style.cursor = "pointer";
    delBtn.style.fontSize = "14px";
    delBtn.style.lineHeight = "20px";
    delBtn.style.textAlign = "center";
    delBtn.style.padding = "0";
    delBtn.title = "Delete item";
    
    // Hover effect
    delBtn.onmouseover = () => { delBtn.style.backgroundColor = "#c0392b"; };
    delBtn.onmouseout = () => { delBtn.style.backgroundColor = "#e74c3c"; };

    delBtn.onclick = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, category, user.uid);
      const docSnap = await getDoc(docRef);
      let data = docSnap.exists() ? (docSnap.data().items || []) : [];

      data.splice(index, 1); // remove item
      await setDoc(docRef, { items: data });

      loadItems(category, data);
    };

    li.appendChild(textSpan);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}


// Ensure bindings are set even if someone moves the script tag again
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindAuthButtons);
} else {
  bindAuthButtons();
}




