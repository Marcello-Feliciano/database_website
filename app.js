// ========== Firebase Setup ==========
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
  doc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  projectId: "YOUR_APP",
  storageBucket: "YOUR_APP.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ========== Helpers ==========
const $ = (id) => document.getElementById(id);

// ========== Authentication ==========
$("signup-btn").addEventListener("click", async () => {
  const email = $("email").value;
  const password = $("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
});

$("login-btn").addEventListener("click", async () => {
  const email = $("email").value;
  const password = $("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
});

$("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
});

// ========== Auth State Change ==========
onAuthStateChanged(auth, async (user) => {
  const loginScreen = $("login-screen");
  const appScreen = $("app"); // << use your real app div id here

  if (user) {
    $("user-email").innerText = user.email;
    loginScreen.style.display = "none";
    appScreen.style.display = "block";

    // Insert search bar if not already created
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

      // Hook up search functionality
      searchInput.addEventListener("input", () => {
        const term = searchInput.value.toLowerCase();
        ["books", "movies", "games", "comics"].forEach((category) => {
          const list = $(`${category}-list`);
          if (!list) return;
          Array.from(list.children).forEach((li) => {
            const text =
              li.querySelector("span")?.textContent.toLowerCase() || "";
            li.style.display = text.includes(term) ? "" : "none";
          });
        });
      });
    }

    await loadAllData(user.uid);
  } else {
    loginScreen.style.display = "block";
    appScreen.style.display = "none";
  }
});

// ========== Firestore ==========
async function loadAllData(uid) {
  ["books", "movies", "games", "comics"].forEach((cat) =>
    loadCategory(uid, cat)
  );
}

async function loadCategory(uid, category) {
  const list = $(`${category}-list`);
  if (!list) return;
  list.innerHTML = "";

  const snap = await getDocs(collection(db, "users", uid, category));
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    renderItem(list, category, docSnap.id, data.name);
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

// ========== Rendering ==========
function renderItem(list, category, id, name) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.textContent = name;

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.onclick = () => {
    const newName = prompt("Edit name:", name);
    if (newName) updateItem(auth.currentUser.uid, category, id, newName);
  };

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.onclick = () => {
    if (confirm("Delete this item?")) {
      deleteItem(auth.currentUser.uid, category, id);
    }
  };

  li.appendChild(span);
  li.appendChild(editBtn);
  li.appendChild(delBtn);
  list.appendChild(li);
}

// ========== Add Buttons ==========
["books", "movies", "games", "comics"].forEach((category) => {
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
