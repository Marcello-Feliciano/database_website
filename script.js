let currentUser = null;

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const users = getUsers();
  if (users[username] && users[username].password === password) {
    currentUser = username;
    showApp();
  } else {
    document.getElementById("auth-msg").innerText = "Invalid login.";
  }
}

function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const users = getUsers();
  if (users[username]) {
    document.getElementById("auth-msg").innerText = "User already exists.";
    return;
  }

  users[username] = { password, data: { games: [], movies: [], books: [], comics: [] } };
  saveUsers(users);
  document.getElementById("auth-msg").innerText = "User registered! You can log in now.";
}

function logout() {
  currentUser = null;
  document.getElementById("app").classList.add("hidden");
  document.getElementById("auth").classList.remove("hidden");
}

function getUserData() {
  return getUsers()[currentUser].data;
}

function setUserData(data) {
  const users = getUsers();
  users[currentUser].data = data;
  saveUsers(users);
}

function showApp() {
  document.getElementById("auth").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  document.getElementById("currentUser").innerText = currentUser;
  renderAll();
}

function saveItem() {
  const type = document.getElementById("mediaType").value;
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  if (!title) return;

  const data = getUserData();
  data[type].push({ title, description });
  setUserData(data);
  renderAll();
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
}

function renderAll(filter = "") {
  const data = getUserData();
  const container = document.getElementById("sections");
  container.innerHTML = "";

  for (let type in data) {
    const items = data[type].filter(item =>
      item.title.toLowerCase().includes(filter.toLowerCase()) ||
      item.description.toLowerCase().includes(filter.toLowerCase())
    );
    const section = document.createElement("div");
    section.innerHTML = `<h3>${type.charAt(0).toUpperCase() + type.slice(1)}</h3>`;

    const list = document.createElement("div");
    list.className = "item-list";
    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<strong>${item.title}</strong>: ${item.description}`;
      list.appendChild(div);
    });

    section.appendChild(list);
    container.appendChild(section);
  }
}

function searchItems() {
  const query = document.getElementById("search").value;
  renderAll(query);
}
