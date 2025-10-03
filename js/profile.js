import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  update
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDpeYw8bt1j4fqSvXtAPyRmaMZK_UICX94",
  authDomain: "pbsproject-39041.firebaseapp.com",
  databaseURL: "https://pbsproject-39041-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pbsproject-39041",
  storageBucket: "pbsproject-39041.firebasestorage.app",
  messagingSenderId: "695400532049",
  appId: "1:695400532049:web:31d2de08045c4d3eeb1070",
  measurementId: "G-FGLT883PDC"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhoto = document.getElementById("profilePhoto");
const profileDate = document.getElementById("profileDate");
const profileRole = document.getElementById("profileRole");

const logoutBtn = document.getElementById("logoutBtn");
const goToPredlozhka = document.getElementById("goToPredlozhka");
const editNameBtn = document.getElementById("editNameBtn");
const editPhotoBtn = document.getElementById("editPhotoBtn");

const nameModal = document.getElementById("nameModal");
const photoModal = document.getElementById("photoModal");
const closeNameModal = document.getElementById("closeNameModal");
const closePhotoModal = document.getElementById("closePhotoModal");
const newNameInput = document.getElementById("newNameInput");
const newPhotoInput = document.getElementById("newPhotoInput");
const saveNameBtn = document.getElementById("saveNameBtn");
const savePhotoBtn = document.getElementById("savePhotoBtn");

// Відображення даних користувача
onAuthStateChanged(auth, async user => {
  if (!user) return window.location.href = "login.html";

  profileName.textContent = user.displayName || "Без имени";
  profileEmail.textContent = user.email;
  profilePhoto.src = user.photoURL || "img/default-avatar.png";

  const snap = await get(ref(db, `users/${user.uid}`));
  if (snap.exists()) {
    const data = snap.val();
    profileDate.textContent = data.createdAt ? new Date(data.createdAt).toLocaleString('ru-RU') : "Неизвестно";

    let roles = [];
    if (data.isAdmin) roles.push("Администратор");
    if (data.isPremium) roles.push("Премиум");
    if (roles.length === 0) roles.push("Пользователь");
    profileRole.textContent = roles.join(", ");
  } else {
    profileDate.textContent = "Неизвестно";
    profileRole.textContent = "Пользователь";
  }
});

// Вихід
logoutBtn.onclick = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};

// Перехід
goToPredlozhka.onclick = () => {
  window.location.href = "predlozhka.html";
};

// Зміна імені
editNameBtn.onclick = () => {
  newNameInput.value = profileName.textContent;
  nameModal.style.display = "flex";
};
saveNameBtn.onclick = async () => {
  const user = auth.currentUser;
  if (user) {
    await updateProfile(user, { displayName: newNameInput.value });
    await update(ref(db, "users/" + user.uid), { name: newNameInput.value }); // 🔥 оновлення в БД
    profileName.textContent = newNameInput.value;
    nameModal.style.display = "none";
    alert("Імя обновлено!");
  }
};

// Зміна фото
editPhotoBtn.onclick = () => {
  newPhotoInput.value = profilePhoto.src;
  photoModal.style.display = "flex";
};
savePhotoBtn.onclick = async () => {
  const user = auth.currentUser;
  if (user) {
    await updateProfile(user, { photoURL: newPhotoInput.value });
    await update(ref(db, "users/" + user.uid), { photoURL: newPhotoInput.value }); // 🔥 оновлення в БД
    profilePhoto.src = newPhotoInput.value;
    photoModal.style.display = "none";
    alert("Фото обновлено!");
  }
};

// Закриття модалок
closeNameModal.onclick = () => nameModal.style.display = "none";
closePhotoModal.onclick = () => photoModal.style.display = "none";
window.onclick = e => {
  if (e.target === nameModal) nameModal.style.display = "none";
  if (e.target === photoModal) photoModal.style.display = "none";
};