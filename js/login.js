import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getDatabase,
    ref,
    set
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- Конфіг ---
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

// --- Переключение форм ---
const signupContainer = document.getElementById("signupContainer");
const loginContainer = document.getElementById("loginContainer");

document.getElementById("showLogin").onclick = (e) => {
    e.preventDefault();
    signupContainer.style.display = "none";
    loginContainer.style.display = "block";
};
document.getElementById("showSignup").onclick = (e) => {
    e.preventDefault();
    loginContainer.style.display = "none";
    signupContainer.style.display = "block";
};

// --- РЕЄСТРАЦІЯ ---
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const displayName = document.getElementById("signupName").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Оновлюємо профіль у Firebase Auth
        await updateProfile(user, {
            displayName
        });

        // Запис у Realtime Database
        await set(ref(db, "users/" + user.uid), {
            email: user.email,
            displayName: displayName,
            createdAt: Date.now(),
            isAdmin: false,
            isPremium: false,
            isBanned: false
        });

        window.location.href = "profile.html";
    } catch (err) {
        alert(err.message);
    }
});

// --- ЛОГІН ---
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "profile.html";
    } catch (err) {
        alert(err.message);
    }
});