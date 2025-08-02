// Wait for Firebase Auth to initialize
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    setupRealTimeListeners(user.uid);
  } else {
    document.getElementById('auth').style.display = 'block';
    document.getElementById('app').style.display = 'none';
  }
});

// Sign up
document.getElementById('signup').addEventListener('click', () => {
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .catch(error => alert(error.message));
});

// Login
document.getElementById('login').addEventListener('click', () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(error => alert(error.message));
});

// Logout
document.getElementById('logout').addEventListener('click', () => {
  firebase.auth().signOut();
});

// Add item
document.getElementById('add').addEventListener('click', () => {
  const type = document.getElementById('type').value;
  const name = document.getElementById('name').value;
  const uid = firebase.auth().currentUser.uid;

  firebase.firestore().collection('users').doc(uid)
    .collection(type).add({ name })
    .then(() => {
      document.getElementById('name').value = '';
    });
});

// Search
document.getElementById('search').addEventListener('click', () => {
  const type = document.getElementById('type').value;
  const query = document.getElementById('search-term').value.toLowerCase();
  const uid = firebase.auth().currentUser.uid;
  const ul = document.getElementById(`list-${type}`);
  ul.innerHTML = '';

  firebase.firestore().collection('users').doc(uid)
    .collection(type).orderBy('name').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        if (doc.data().name.toLowerCase().includes(query)) {
          const li = document.createElement('li');
          li.textContent = doc.data().name;
          ul.appendChild(li);
        }
      });
    });
});

// Real-time listeners setup
function setupRealTimeListeners(uid) {
  ['games', 'books', 'movies', 'comics'].forEach(type => {
    const ul = document.getElementById(`list-${type}`);

    firebase.firestore().collection('users').doc(uid)
      .collection(type).orderBy('name')
      .onSnapshot(snapshot => {
        ul.innerHTML = '';
        snapshot.forEach(doc => {
          const li = document.createElement('li');
          li.textContent = doc.data().name;
          ul.appendChild(li);
        });
      });
  });
}
