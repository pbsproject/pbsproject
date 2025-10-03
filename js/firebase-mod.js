import {
    initializeApp
}

from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    push,
    update,
    onValue
}

from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import {
    getAuth,
    onAuthStateChanged
}

from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase config
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDpeYw8bt1j4fqSvXtAPyRmaMZK_UICX94",
    authDomain: "pbsproject-39041.firebaseapp.com",
    databaseURL: "https://pbsproject-39041-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pbsproject-39041",
    storageBucket: "pbsproject-39041.firebasestorage.app",
    messagingSenderId: "695400532049",
    appId: "1:695400532049:web:31d2de08045c4d3eeb1070",
    measurementId: "G-FGLT883PDC"
}

;

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();

// ==================
// Динамічний Page ID з URL
// ==================
const params = new URLSearchParams(window.location.search);
const pageId = params.get("id") || "default-id";

// ==================
// Модульна інфо
// ==================
get(ref(db, "mods/" + pageId)).then(snap => {
        if (snap.exists()) {
            const mod = snap.val();
            document.getElementById("modTitle").textContent = mod.title;
            document.getElementById("modType").textContent = mod.type;
            document.getElementById("modDescription").textContent = mod.description;
            document.getElementById("modModelAuthor").textContent = mod.modelAuthor;
            document.getElementById("modConvertAuthor").textContent = mod.convertAuthor;
            document.getElementById("modWeight").textContent = mod.weight;
            document.getElementById("modDownloadLink").href = mod.download;

            // Галерея
            let imageUrls = [];

            if (Array.isArray(mod.images)) {
                imageUrls = mod.images;
            } else if (typeof mod.images === "string") {
                imageUrls = mod.images.split(",").map(url => url.trim());
            }

            const mainImage = document.getElementById("mainImage");
            mainImage.src = imageUrls[0] || "https://via.placeholder.com/800x500?text=Нет+изображения";
            mainImage.alt = mod.title || "Изображение дополнения";

            const thumbnailsContainer = document.getElementById("thumbnails");
            thumbnailsContainer.innerHTML = "";

            imageUrls.forEach((url, index) => {
                    const thumb = document.createElement("img");
                    thumb.src = url;
                    thumb.className = "thumbnail" + (index === 0 ? " active" : "");

                    thumb.onclick = () => {
                        mainImage.src = url;
                        document.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("active"));
                        thumb.classList.add("active");

                        thumb.scrollIntoView({
                                behavior: 'smooth',
                                inline: 'center',
                                block: 'nearest'
                            }

                        );
                    }

                    ;
                    thumbnailsContainer.appendChild(thumb);
                }

            );

            mainImage.addEventListener('click', () => {
                    const lightbox = document.createElement('div');
                    lightbox.classList.add('lightbox-overlay');
                    lightbox.innerHTML = ` <div class="lightbox-content"> <img src="${mainImage.src}"alt="${mainImage.alt}"> <button class="lightbox-close"><i class="fas fa-times"></i></button> </div>`;
                    document.body.appendChild(lightbox);

                    lightbox.querySelector('.lightbox-close').addEventListener('click', () => document.body.removeChild(lightbox));

                    lightbox.addEventListener('click', e => {
                            if (e.target === lightbox) document.body.removeChild(lightbox);
                        }

                    );

                    document.addEventListener('keydown', function escHandler(e) {
                            if (e.key === 'Escape') {
                                if (document.body.contains(lightbox)) {
                                    document.body.removeChild(lightbox);
                                    document.removeEventListener('keydown', escHandler);
                                }
                            }
                        }

                    );
                }

            );
        }
    }

);

// ==================
// Блок реакцій та коментарів
// ==================
const interactionBlock = document.getElementById("interaction");
interactionBlock.style.position = "relative";

// Overlay для неавторизованих
const authOverlay = document.createElement("div");
authOverlay.style.cssText = ` position: absolute;
inset: 0;
background: rgba(0, 0, 0, 0.5);
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
color: white;
font-size: 18px;
text-align: center;
z-index: 10;
border-radius: 12px;
`;
authOverlay.innerHTML = ` <p style="margin-bottom: 16px;">Ввойдите или зарегистрируйтесь,
чтобы оставлять комментарии или ставить реакции !</p><a href="login.html"class="btn btn-primary">Вход / Регистрация</a>`;
interactionBlock.appendChild(authOverlay);

// Коментарі
const commentForm = document.getElementById("commentForm");
const commentsList = document.getElementById("commentsList");
const commentsRef = ref(db, "comments/" + pageId);
const commentText = document.getElementById("commentText");
const commentSubmit = commentForm.querySelector("button");

// Реакції
const likeBtn = document.querySelector(".like-btn");
const dislikeBtn = document.querySelector(".dislike-btn");
const likeCount = document.querySelector(".like-count");
const dislikeCount = document.querySelector(".dislike-count");
const reactRef = ref(db, "react/" + pageId);

let reacted = null;
let currentUser = null;

function reactbounce(el) {
    el.classList.add("reactbounce");
    setTimeout(() => el.classList.remove("reactbounce"), 400);
}

function formatDate(ts) {
    return new Intl.DateTimeFormat("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }

    ).format(new Date(ts));
}

// -----------------------
// Коментарі - відправка
// -----------------------
commentForm.addEventListener("submit", async e => {
        e.preventDefault();
        if (!currentUser) return;

        const text = commentText.value.trim();
        if (!text) return;

        const userSnap = await get(ref(db, `users/$ {
                    currentUser.uid
                }

                `));

        const userData = userSnap.exists() ? userSnap.val() : {}

        ;
        let displayName = currentUser.displayName || "Аноним";
        if (userData.isAdmin) displayName += " (Администратор)";
        else if (userData.isPremium) displayName += " (Премиум)";

        push(commentsRef, {
                uid: currentUser.uid,
                name: displayName,
                avatar: currentUser.photoURL || "img/default-avatar.png",
                text,
                timestamp: Date.now()
            }

        );

        commentForm.reset();
    }

);

// -----------------------
// Вивід коментарів
// -----------------------
onValue(commentsRef, snap => {
        commentsList.innerHTML = "";

        snap.forEach(child => {
                const c = child.val();
                const avatar = c.avatar || "img/default-avatar.png";
                const div = document.createElement("div");
                div.classList.add("comment");
                div.style.display = "flex";
                div.style.gap = "10px";
                div.style.marginBottom = "15px";
                div.style.alignItems = "flex-start";

				div.innerHTML = `
					<img src="${avatar}" alt="Аватар" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
					<div class="comment-body" style="flex:1; display:flex; flex-direction:column;">
						<div class="comment-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
							<span class="comment-nickname" style="font-weight:600; font-size:14px;">${c.name}</span>
							<span class="comment-time" style="font-size:12px; color:var(--text-secondary);">${formatDate(c.timestamp)}</span>
						</div>
						<div class="comment-text" style="font-size:15px;">${c.text}</div>
					</div>
				`;
                commentsList.appendChild(div);
            }

        );
    }

);

// -----------------------
// Реакції
// -----------------------
onAuthStateChanged(auth, user => {
        currentUser = user;

        if (currentUser) {
            authOverlay.style.display = "none";
            commentText.disabled = false;
            commentSubmit.disabled = false;

            get(reactRef).then(snap => {
                    const data = snap.val() || {

                        likes: 0,
                        dislikes: 0,
                        users: {}
                    }

                    ;
                    if (data.users && data.users[currentUser.uid]) reacted = data.users[currentUser.uid];
                    likeBtn.classList.toggle("active", reacted === "like");
                    dislikeBtn.classList.toggle("active", reacted === "dislike");
                }

            );

            likeBtn.onclick = async () => {
                const snap = await get(reactRef);

                const data = snap.val() || {

                    likes: 0,
                    dislikes: 0,
                    users: {}
                }

                ;

                if (reacted === "like") {
                    data.likes = Math.max((data.likes || 0) - 1, 0);
                    delete data.users[currentUser.uid];
                    reacted = null;
                } else {
                    data.likes = (data.likes || 0) + 1;
                    if (reacted === "dislike") data.dislikes = Math.max((data.dislikes || 0) - 1, 0);

                    data.users = data.users || {}

                    ;
                    data.users[currentUser.uid] = "like";
                    reacted = "like";
                }

                await update(reactRef, data);
                likeBtn.classList.toggle("active", reacted === "like");
                dislikeBtn.classList.toggle("active", reacted === "dislike");
                reactbounce(likeCount);
            }

            ;

            dislikeBtn.onclick = async () => {
                const snap = await get(reactRef);

                const data = snap.val() || {

                    likes: 0,
                    dislikes: 0,
                    users: {}
                }

                ;

                if (reacted === "dislike") {
                    data.dislikes = Math.max((data.dislikes || 0) - 1, 0);
                    delete data.users[currentUser.uid];
                    reacted = null;
                } else {
                    data.dislikes = (data.dislikes || 0) + 1;
                    if (reacted === "like") data.likes = Math.max((data.likes || 0) - 1, 0);

                    data.users = data.users || {}

                    ;
                    data.users[currentUser.uid] = "dislike";
                    reacted = "dislike";
                }

                await update(reactRef, data);
                likeBtn.classList.toggle("active", reacted === "like");
                dislikeBtn.classList.toggle("active", reacted === "dislike");
                reactbounce(dislikeCount);
            }

            ;

        } else {
            authOverlay.style.display = "flex";
            commentText.disabled = true;
            commentSubmit.disabled = true;

            likeBtn.onclick = dislikeBtn.onclick = () => {
                authOverlay.style.display = "flex";
            }

            ;
        }
    }

);

// Вивід загальної кількості лайків/дизлайків
onValue(reactRef, snap => {
        const data = snap.val() || {
            likes: 0,
            dislikes: 0
        }

        ;
        likeCount.textContent = data.likes || 0;
        dislikeCount.textContent = data.dislikes || 0;
    }

);