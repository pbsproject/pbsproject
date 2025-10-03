import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getDatabase,
    ref,
    push,
    set,
    get,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- Firebase config ---
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

// --- DOM ---
const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');
const modsApprovalPanel = document.getElementById('modsApprovalPanel');
const usersPanel = document.getElementById('usersPanel');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const addModForm = document.getElementById('addModForm');
const formMsg = document.getElementById('formMsg');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const modsList = document.getElementById('modsList');
const usersTableBody = document.querySelector("#usersTable tbody");

// --- Preview ---
const imagesField = document.getElementById('images');
const previewWrap = document.getElementById('previewWrap');
const preview = document.getElementById('preview');

imagesField.addEventListener('input', () => {
    const urls = imagesField.value.split(',').map(u => u.trim()).filter(Boolean);
    if (urls.length > 0) {
        previewWrap.classList.remove('hidden');
        preview.innerHTML = urls.map((u, i) => `
            <div class="gallery-item" data-url="${u}">
                <img class="gallery-image" src="${u}">
                <div class="gallery-overlay"><span>Превью ${i+1}</span></div>
            </div>`).join('');
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.onclick = () => {
                const url = item.dataset.url;
                const lightbox = document.createElement('div');
                lightbox.className = 'lightbox';
                const img = document.createElement('img');
                img.src = url;
                const closeBtn = document.createElement('button');
                closeBtn.className = 'lightbox-close';
                closeBtn.textContent = '×';
                lightbox.appendChild(img);
                lightbox.appendChild(closeBtn);
                document.body.appendChild(lightbox);
                setTimeout(() => lightbox.classList.add('show'), 10);
                closeBtn.onclick = () => {
                    lightbox.classList.remove('show');
                    setTimeout(() => lightbox.remove(), 300);
                };
                lightbox.onclick = e => {
                    if (e.target === lightbox) {
                        lightbox.classList.remove('show');
                        setTimeout(() => lightbox.remove(), 300);
                    }
                }
            };
        });
    } else {
        previewWrap.classList.add('hidden');
        preview.innerHTML = '';
    }
});

// --- Login/Logout ---
loginBtn.addEventListener('click', async () => {
    try {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        await signInWithEmailAndPassword(auth, email, password);
    } catch {
        loginError.style.display = 'block';
        loginError.textContent = "Ошибка входа. Проверьте Email/Пароль.";
    }
});
logoutBtn.addEventListener('click', () => signOut(auth));

// --- Auth state ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        const snap = await get(userRef);

        if (!snap.exists()) {
            // новый юзер — создаём запись
            await set(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "Без имени",
                createdAt: Date.now(),
                role: "user",
                isAdmin: false,
                isPremium: false,
                isBanned: false
            });
        }

        const userData = (await get(userRef)).val();

        if (userData.isAdmin) {
            // ✅ доступ только для админов
            loginPanel.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            modsApprovalPanel.classList.remove('hidden');
            usersPanel.classList.remove('hidden');
            loadModsForApproval();
            loadUsers();
        } else {
            alert("Доступ только для администраторов");
            await signOut(auth);
        }

    } else {
        loginPanel.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        modsApprovalPanel.classList.add('hidden');
        usersPanel.classList.add('hidden');
    }
});

// --- Add Mod ---
addModForm.addEventListener('submit', async e => {
    e.preventDefault();
    const mod = {
        title: document.getElementById('title').value,
        type: document.getElementById('type').value,
        description: document.getElementById('description').value,
        modelAuthor: document.getElementById('modelAuthor').value,
        convertAuthor: document.getElementById('convertAuthor').value,
        weight: document.getElementById('weight').value,
        download: document.getElementById('download').value,
        images: document.getElementById('images').value.split(',').map(u => u.trim()),
        createdAt: Date.now(),
        authorUid: auth.currentUser.uid
    };
    try {
        const newRef = push(ref(db, 'mods'));
        await set(newRef, mod);
        formMsg.style.color = "#8bffb3";
        formMsg.textContent = "✅ Опубликовано!";
        addModForm.reset();
        previewWrap.classList.add('hidden');
        preview.innerHTML = '';
    } catch (err) {
        console.error(err);
        formMsg.style.color = "#ff8b8b";
        formMsg.textContent = "Ошибка при сохранении";
    }
});

// --- Mods for approval ---
async function loadModsForApproval() {
    modsList.innerHTML = '';
    const snap = await get(ref(db, 'modsForApproval'));
    if (snap.exists()) {
        const mods = snap.val();
        Object.entries(mods).forEach(([id, mod]) => {
            const div = document.createElement('div');
            div.className = 'panel-item';
            div.innerHTML = `<span>${mod.title} (${mod.type})</span>
            <div>
                <button class="btn btn-primary">Посмотреть</button>
            </div>`;
            const btn = div.querySelector("button");
            btn.onclick = () => openModal(id, mod);
            modsList.appendChild(div);
        });
    } else {
        modsList.innerHTML = '<i>Нет модов на модерацию</i>';
    }
}

const modal = document.getElementById("modModal");
const closeModal = modal.querySelector(".modal-close");
let currentModId = null;

function openModal(id, mod) {
    currentModId = id;
    modal.style.display = 'block';
    document.getElementById("modalTitle").textContent = mod.title;
    document.getElementById("modalType").textContent = mod.type;
    document.getElementById("modalModelAuthor").textContent = mod.modelAuthor;
    document.getElementById("modalConvertAuthor").textContent = mod.convertAuthor;
    document.getElementById("modalDescription").textContent = mod.description;
    const downloadLink = document.getElementById("modalDownload");
    downloadLink.href = mod.download;
    const imagesDiv = document.getElementById("modalImages");
    imagesDiv.innerHTML = '';
    mod.images.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.onclick = () => window.open(url, "_blank");
        imagesDiv.appendChild(img);
    });
}

closeModal.onclick = () => modal.style.display = 'none';
window.onclick = e => {
    if (e.target === modal) modal.style.display = 'none';
};

// --- Approve/Reject ---
document.getElementById("approveBtn").onclick = async () => {
    if (!currentModId) return;
    const snap = await get(ref(db, `modsForApproval/${currentModId}`));
    if (!snap.exists()) return;
    const mod = snap.val();
    const newRef = push(ref(db, 'mods1'));
    await set(newRef, mod);
    await remove(ref(db, `modsForApproval/${currentModId}`));
    modal.style.display = 'none';
    loadModsForApproval();
};
document.getElementById("rejectBtn").onclick = async () => {
    if (!currentModId) return;
    await remove(ref(db, `modsForApproval/${currentModId}`));
    modal.style.display = 'none';
    loadModsForApproval();
};

// --- Users ---
const userSearch = document.getElementById("userSearch");
const userModal = document.getElementById("userModal");
const closeUserModal = userModal.querySelector(".modal-close");
let currentUserId = null;

// Modal elements
const modalUserPhoto = document.getElementById("modalUserPhoto");
const modalUserName = document.getElementById("modalUserName");
const modalUserEmail = document.getElementById("modalUserEmail");
const modalUserDate = document.getElementById("modalUserDate");
const modalUserRole = document.getElementById("modalUserRole");
const modalPremiumBtn = document.getElementById("modalPremiumBtn");
const modalAdminBtn = document.getElementById("modalAdminBtn");
const modalBanBtn = document.getElementById("modalBanBtn");

async function loadUsers() {
    usersTableBody.innerHTML = '';
    const snap = await get(ref(db, 'users'));
    if (!snap.exists()) {
        usersTableBody.innerHTML = '<tr><td colspan="3"><i>Нет пользователей</i></td></tr>';
        return;
    }

    const users = snap.val();
    Object.entries(users).forEach(([uid, u]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.displayName || ''}</td>
            <td>${u.email || ''}</td>
            <td><button class="btn btn-primary viewUserBtn">Просмотреть</button></td>
        `;
        usersTableBody.appendChild(tr);

        const viewBtn = tr.querySelector(".viewUserBtn");
        viewBtn.onclick = () => openUserModal(uid, u);
    });
}

// --- Пошук ---
userSearch.addEventListener("input", () => {
    const query = userSearch.value.toLowerCase();
    usersTableBody.querySelectorAll("tr").forEach(tr => {
        const name = tr.cells[0].textContent.toLowerCase();
        const email = tr.cells[1].textContent.toLowerCase();
        tr.style.display = name.includes(query) || email.includes(query) ? "" : "none";
    });
});

// --- Модальне вікно користувача ---
function openUserModal(uid, u) {
    currentUserId = uid;
    modalUserPhoto.src = u.photoURL || "img/default-avatar.png";
    modalUserName.textContent = u.displayName || '';
    modalUserEmail.textContent = u.email || '';
    modalUserDate.textContent = u.createdAt ? new Date(u.createdAt).toLocaleString("uk-UA") : '';
    
    const roles = [];
    if(u.isAdmin) roles.push("Админ");
    if(u.isPremium) roles.push("Премиум");
    if(u.isBanned) roles.push("Заблокирован");
    if(roles.length === 0) roles.push("Пользователь");
    modalUserRole.textContent = roles.join(", ");

    modalPremiumBtn.textContent = u.isPremium ? 'Забрать премиум' : 'Выдать премиум';
    modalAdminBtn.textContent = u.isAdmin ? 'Снять админку' : 'Выдать админку';
    modalBanBtn.textContent = u.isBanned ? 'Разблокировать' : 'Заблокировать';

    modalPremiumBtn.onclick = async () => {
        await update(ref(db, `users/${uid}`), { isPremium: !u.isPremium });
        u.isPremium = !u.isPremium;
        openUserModal(uid, u);
        loadUsers();
    }
    modalAdminBtn.onclick = async () => {
        await update(ref(db, `users/${uid}`), { isAdmin: !u.isAdmin });
        u.isAdmin = !u.isAdmin;
        openUserModal(uid, u);
        loadUsers();
    }
    modalBanBtn.onclick = async () => {
        await update(ref(db, `users/${uid}`), { isBanned: !u.isBanned });
        u.isBanned = !u.isBanned;
        openUserModal(uid, u);
        loadUsers();
    }

    userModal.style.display = 'block';
}

closeUserModal.onclick = () => userModal.style.display = 'none';
window.onclick = e => {
    if(e.target === userModal) userModal.style.display = 'none';
};

