import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
}
 from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// ====== CONFIG ======
const firebaseConfig = {
  apiKey: "AIzaSyBpFQYyFyMQWUHjNuIwMyb8UrT7l92ASao",
  authDomain: "gmbcreviews.firebaseapp.com",
  projectId: "gmbcreviews",
  storageBucket: "gmbcreviews.appspot.com",
  messagingSenderId: "156411101412",
  appId: "1:156411101412:web:dfea6aa2c4b3518a042cf1",
  measurementId: "G-DH9W04ZEWL",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const categories = ["books", "movies", "games", "comics"];
const $ = (id) => document.getElementById(id);

// ====== CREATE UI ======
function createUI() {
  document.body.innerHTML = "";

  // --- Login screen ---
  const loginDiv = document.createElement("div");
  loginDiv.id = "login-screen";

  const emailInput = document.createElement("input");
  emailInput.id = "email";
  emailInput.type = "email";
  emailInput.placeholder = "Email";
  emailInput.autocomplete = "username";

  const passInput = document.createElement("input");
  passInput.id = "password";
  passInput.type = "password";
  passInput.placeholder = "Password";
  passInput.autocomplete = "current-password";

  const signupBtn = document.createElement("button");
  signupBtn.id = "signup-btn";
  signupBtn.textContent = "Sign Up";

  const loginBtn = document.createElement("button");
  loginBtn.id = "login-btn";
  loginBtn.textContent = "Log In";

  loginDiv.append(emailInput, passInput, signupBtn, loginBtn);
  document.body.appendChild(loginDiv);

  // --- App screen ---
  const appDiv = document.createElement("div");
  appDiv.id = "app";
  appDiv.style.display = "none";

  const userEmail = document.createElement("span");
  userEmail.id = "user-email";

  const logoutBtn = document.createElement("button");
  logoutBtn.id = "logout-btn";
  logoutBtn.textContent = "Logout";

  appDiv.appendChild(document.createTextNode("Welcome, "));
  appDiv.appendChild(userEmail);
  appDiv.appendChild(document.createElement("br"));
  appDiv.appendChild(logoutBtn);

  // Search bar
  const searchDiv = document.createElement("div");
  searchDiv.style.margin = "15px 0";
  const searchInput = document.createElement("input");
  searchInput.id = "search";
  searchInput.placeholder = "Search...";
  searchInput.style.width = "300px";
  searchInput.style.padding = "5px";
  searchDiv.appendChild(searchInput);
  appDiv.appendChild(searchDiv);

  // Category sections
  categories.forEach((category) => {
    const section = document.createElement("div");
    section.id = `${category}-section`;

    const title = document.createElement("h3");
    title.textContent = category.charAt(0).toUpperCase() + category.slice(1);

    const input = document.createElement("input");
    input.id = `${category}-input`;
    input.placeholder = `Add new ${category.slice(0, -1)}`;

    const addBtn = document.createElement("button");
    addBtn.id = `add-${category}`;
    addBtn.textContent = "Add";

    const list = document.createElement("ul");
    list.id = `${category}-list`;

    section.append(title, input, addBtn, list);
    appDiv.appendChild(section);
  });

  document.body.appendChild(appDiv);

  // --- BIND BUTTONS ---
  signupBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passInput.value;
    if (!email || !password) return alert("Enter email and password.");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  });

  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passInput.value;
    if (!email || !password) return alert("Enter email and password.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
  });

  // Add buttons
  categories.forEach((category) => {
    const btn = $(`add-${category}`);
    btn.addEventListener("click", async () => {
      const input = $(`${category}-input`);
      if (!input.value.trim()) return;
      const user = auth.currentUser;
      if (!user) return alert("Not logged in.");
      await addItem(user.uid, category, input.value.trim());
      input.value = "";
    });
  });

  // Search functionality
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    categories.forEach((category) => {
      const list = $(`${category}-list`);
      Array.from(list.children).forEach((li) => {
        const text = li.querySelector("span").textContent.toLowerCase();
        li.style.display = text.includes(term) ? "" : "none";
      });
    });
  });
}

// ====== FIRESTORE FUNCTIONS ======

async function deleteItem(uid, category, id) {
  await deleteDoc(doc(db, "users", uid, category, id));
}

async function updateItem(uid, category, id, newName) {
  await updateDoc(doc(db, "users", uid, category, id), { name: newName });
}

// Real-time listener for a category
function listenToCategory(uid, category) {
  const list = $(`${category}-list`);
  if (!list) return;
  list.innerHTML = "";

  const q = query(collection(db, "users", uid, category));
  onSnapshot(q, (snap) => {
    list.innerHTML = ""; // clear and rebuild
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      renderItem(list, category, docSnap.id, data.name, uid);
    });
  });
}

// Add item with duplicate prevention
async function addItem(uid, category, name) {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return;

  // Check for duplicates in real-time snapshot
  const list = $(`${category}-list`);
  const existing = Array.from(list.children).some((li) => {
    const text = li.querySelector("span").textContent.toLowerCase();
    return text === normalized;
  });

  if (existing) {
    alert(`"${name}" already exists in ${category}.`);
    return;
  }

  const id = Date.now().toString();
  console.log("Adding:", { uid, category, id, name });

  try {
    await setDoc(doc(db, "users", uid, category, id), { name });
    console.log("Added successfully");
  } catch (err) {
    console.error("Add error:", err);
  }
}

// ====== RENDER ITEMS ======
function renderItem(list, category, id, name, uid) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.textContent = name;

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.onclick = () => {
    const newName = prompt("Edit name:", name);
    if (newName && newName.trim()) updateItem(uid, category, id, newName.trim());
  };

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.onclick = () => {
    if (confirm("Delete this item?")) deleteItem(uid, category, id);
  };

  li.append(span, editBtn, delBtn);
  list.appendChild(li);
}

// ====== INITIALIZE ======
createUI();

onAuthStateChanged(auth, (user) => {
  const loginScreen = $("login-screen");
  const appScreen = $("app");
  if (!loginScreen || !appScreen) return;

  if (user) {
    $("user-email").innerText = user.email;
    loginScreen.style.display = "none";
    appScreen.style.display = "block";
    // Start real-time listeners
    categories.forEach((cat) => listenToCategory(user.uid, cat));
  } else {
    loginScreen.style.display = "block";
    appScreen.style.display = "none";
  }
});



