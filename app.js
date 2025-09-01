import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function Main({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [category, setCategory] = useState("books");
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 NEW

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "items"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addDoc(collection(db, "items"), {
      uid: user.uid,
      text: newItem,
      category,
    });
    setNewItem("");
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "items", id));
  };

  const handleEdit = async (id, currentText) => {
    const newText = prompt("Edit entry:", currentText);
    if (newText && newText.trim()) {
      await updateDoc(doc(db, "items", id), { text: newText });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onLogout();
  };

  // 🔍 Filter items case-insensitively
  const filteredItems = items.filter((item) =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome, {user.email}</h2>
      <button onClick={handleLogout}>Logout</button>

      <div style={{ margin: "20px 0" }}>
        <input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ margin: "20px 0" }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="books">Books</option>
          <option value="movies">Movies</option>
          <option value="games">Games</option>
          <option value="comics">Comics</option>
        </select>
        <input
          placeholder="New item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      <ul>
        {filteredItems.map((item) => (
          <li key={item.id}>
            <strong>[{item.category}]</strong> {item.text}
            <button
              onClick={() => handleEdit(item.id, item.text)}
              style={{ marginLeft: 10 }}
            >
              ✎
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              style={{ marginLeft: 5, color: "red" }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
