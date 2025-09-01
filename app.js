import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// ====== CONFIG ======
const firebaseConfig = {
  apiKey: "AIzaSyBpFQYyFyMQWUHjNuIwMyb8UrT7l92ASao",
  authDomain: "gmbcreviews.firebaseapp.com",
  projectId: "gmbcreviews",
  storageBucket: "gmbcreviews.firebasestorage.app",
  messagingSenderId: "156411101412",
  appId: "1:156411101412:web:dfea6aa2c4b3518a042cf1",
  measurementId: "G-DH9W04ZEWL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ====== HELPERS ======
const $ = (id) => document.getElementById(id);
const categories = ["books", "movies", "games", "comics"];

// ====== DOM READY ======
document.addEventListener("DOMContentLoaded", () => {
  // Signup
  $("signup-btn").addEventListener("click", async () => {
    const email = $("email").value;
    const password = $("password").value;
    if (!email || !password) return alert("Enter email and password.");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  });

  // Login
  $("login-btn").addEventListener("click", async () => {
    const email = $("email").value;
    const password = $("password").value;
    if (!email || !password) return alert("Enter email and password.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  });

  signupBtn.addEventListener("click", async () => {
  const email = $("email").value;
  const password = $("password").value;
  console.log("Signing up:", email, password);
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    console.log("Signup success");
  } catch (err) {
    console.error("Signup error:", err);
  }
});

  // Logout
  $("logout-btn").addEventListener("click", async () => {
    await signOut(auth);
  });
});

// ====== AUTH STATE ======
onAuthStateChanged(auth, async (user) => {
  const loginScreen = $("login-screen");
  const appScreen = $("app");
  if (!loginScreen || !appScreen) return;

  if (user) {
    $("user-email").innerText = user.email;
    loginScreen.style.display = "none";
    appScreen.style.display = "block";

    // Create search bar if not present
    if (!document.getElementById("search")) {
      const searchDiv = document.createElement("div");
      searchDiv.style.margin = "15px 0";
      const searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.id = "search";
      searchInput.placeholder = "Search...";
      searchInput.style.padding = "5px";
      searchInput.style.width = "100%";
      searchInput.style.maxWidth = "300px";
      searchDiv.appendChild(searchInput);
      appScreen.insertBefore(searchDiv, appScreen.firstChild);

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

    // Load all data
    categories.forEach((cat) => loadCategory(user.uid, cat));
  } else {
    loginScreen.style.display = "block";
    appScreen.style.display = "none";
  }
});

// ====== FIRESTORE FUNCTIONS ======
async function loadCategory(uid, category) {
  const list = $(`${category}-list`);
  if (!list) return;
  list.innerHTML = "";

  const snap = await getDocs(collection(db, "users", uid, category));
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    renderItem(list, category, docSnap.id, data.name, uid);
  });
}

async function addItem(uid, category, name) {
  const id = Date.now().toString();
  await setDoc(doc(db, "users", uid, category, id), { name });
  loadCategory(uid, category);
}

async function deleteItem(uid, category, id) {
  await deleteDoc(doc(db, "users", uid, category, id));
  loadCategory(uid, category);
}

async function updateItem(uid, category, id, newName) {
  await updateDoc(doc(db, "users", uid, category, id), { name: newName });
  loadCategory(uid, category);
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

  li.appendChild(span);
  li.appendChild(editBtn);
  li.appendChild(delBtn);
  list.appendChild(li);
}

// ====== ADD BUTTONS ======
document.addEventListener("DOMContentLoaded", () => {
  categories.forEach((category) => {
    const btn = $(`add-${category}`);
    if (btn) {
      btn.addEventListener("click", async () => {
        const input = $(`${category}-input`);
        if (!input.value.trim()) return;
        await addItem(auth.currentUser.uid, category, input.value.trim());
        input.value = "";
      });
    }
  });
});



