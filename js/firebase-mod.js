        import {
            initializeApp
        } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import {
            getDatabase,
            ref,
            get,
            push,
            update,
            onValue
        } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDpeYw8bt1j4fqSvXtAPyRmaMZK_UICX94",
            authDomain: "pbsproject-39041.firebaseapp.com",
            databaseURL: "https://pbsproject-39041-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "pbsproject-39041",
            storageBucket: "pbsproject-39041.appspot.com",
            messagingSenderId: "695400532049",
            appId: "1:695400532049:web:31d2de08045c4d3eeb1070"
        };
        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);

        // беремо id з URL
        const params = new URLSearchParams(window.location.search);
        const pageId = params.get("id");
        document.querySelector("#interaction").dataset.id = pageId;

        // ----------------
        // Модульная инфа
        // ----------------
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

                // галерея
                // Обработка изображений (массив или строка через запятую)
                let imageUrls = [];

                if (Array.isArray(mod.images)) {
                    imageUrls = mod.images;
                } else if (typeof mod.images === "string") {
                    imageUrls = mod.images.split(",").map(url => url.trim());
                }

                // Устанавливаем главное изображение
                const mainImage = document.getElementById("mainImage");
                mainImage.src = imageUrls[0] || "https://via.placeholder.com/800x500?text=Нет+изображения";
                mainImage.alt = mod.title || "Изображение дополнения";

                // Очищаем и добавляем миниатюры
                const thumbnailsContainer = document.getElementById("thumbnails");
                thumbnailsContainer.innerHTML = "";

                imageUrls.forEach((url, index) => {
                    const thumb = document.createElement("img");
                    thumb.src = url;
                    thumb.className = "thumbnail" + (index === 0 ? " active" : "");
                    thumb.onclick = () => {
                        mainImage.src = url;

                        // Активный стиль
                        document.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("active"));
                        thumb.classList.add("active");

                        // Прокрутка миниатюры к центру
                        thumb.scrollIntoView({
                            behavior: 'smooth',
                            inline: 'center',
                            block: 'nearest' // или 'center', но 'nearest' более аккуратно
                        });
                    };

                    thumbnailsContainer.appendChild(thumb);
                });

            }
        });

        // Добавим возможность открыть главное изображение на весь экран
        mainImage.addEventListener('click', () => {
            const lightbox = document.createElement('div');
            lightbox.classList.add('lightbox-overlay');

            lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${mainImage.src}" alt="${mainImage.alt}">
            <button class="lightbox-close"><i class="fas fa-times"></i></button>
        </div>
    `;

            document.body.appendChild(lightbox);

            // Закрытие по кнопке
            lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
                document.body.removeChild(lightbox);
            });

            // Закрытие по фону
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    document.body.removeChild(lightbox);
                }
            });

            // Закрытие по Esc
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    if (document.body.contains(lightbox)) {
                        document.body.removeChild(lightbox);
                        document.removeEventListener('keydown', escHandler);
                    }
                }
            });
        });

        // ----------------
        // Реакции
        // ----------------
        const likeBtn = document.querySelector(".like-btn");
        const dislikeBtn = document.querySelector(".dislike-btn");
        const likeCount = document.querySelector(".like-count");
        const dislikeCount = document.querySelector(".dislike-count");
        const reactRef = ref(db, "react/" + pageId);

        onValue(reactRef, snap => {
            const d = snap.val() || {
                likes: 0,
                dislikes: 0
            };
            likeCount.textContent = d.likes || 0;
            dislikeCount.textContent = d.dislikes || 0;
        });

        let reacted = localStorage.getItem("reacted_" + pageId);
        if (reacted === "like") likeBtn.classList.add("active");
        if (reacted === "dislike") dislikeBtn.classList.add("active");

        likeBtn.onclick = async () => {
            const snap = await get(reactRef);
            const d = snap.val() || {
                likes: 0,
                dislikes: 0
            };
            if (reacted === "like") {
                update(reactRef, {
                    likes: Math.max((d.likes || 0) - 1, 0)
                });
                localStorage.removeItem("reacted_" + pageId);
                likeBtn.classList.remove("active");
                reacted = null;
            } else {
                if (reacted === "dislike") update(reactRef, {
                    dislikes: Math.max((d.dislikes || 0) - 1, 0)
                });
                update(reactRef, {
                    likes: (d.likes || 0) + 1
                });
                reactbounce(likeCount);
                localStorage.setItem("reacted_" + pageId, "like");
                likeBtn.classList.add("active");
                dislikeBtn.classList.remove("active");
                reacted = "like";
            }
        };
        
        function reactbounce(el) {
            el.classList.add("reactbounce");
            setTimeout(() => el.classList.remove("reactbounce"), 400);
         }

        dislikeBtn.onclick = async () => {
            const snap = await get(reactRef);
            const d = snap.val() || {
                likes: 0,
                dislikes: 0
            };
            if (reacted === "dislike") {
                update(reactRef, {
                    dislikes: Math.max((d.dislikes || 0) - 1, 0)
                });
                localStorage.removeItem("reacted_" + pageId);
                dislikeBtn.classList.remove("active");
                reacted = null;
            } else {
                if (reacted === "like") update(reactRef, {
                    likes: Math.max((d.likes || 0) - 1, 0)
                });
                update(reactRef, {
                    dislikes: (d.dislikes || 0) + 1
                });
                reactbounce(dislikeCount);
                localStorage.setItem("reacted_" + pageId, "dislike");
                dislikeBtn.classList.add("active");
                likeBtn.classList.remove("active");
                reacted = "dislike";
            }
        };

        // ----------------
        // Комментарии
        // ----------------
        const commentForm = document.getElementById("commentForm");
        const commentsList = document.getElementById("commentsList");
        const commentsRef = ref(db, "comments/" + pageId);

        function formatDate(ts) {
            return new Intl.DateTimeFormat("ru-RU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Moscow"
            }).format(new Date(ts));
        }

        commentForm.addEventListener("submit", e => {
            e.preventDefault();
            const nickname = document.getElementById("nickname").value.trim();
            const text = document.getElementById("commentText").value.trim();
            if (!nickname || !text) return;
            push(commentsRef, {
                nickname,
                text,
                timestamp: Date.now()
            });
            commentForm.reset();
        });

        onValue(commentsRef, snap => {
            commentsList.innerHTML = "";
            snap.forEach(child => {
                const c = child.val();
                const div = document.createElement("div");
                div.classList.add("comment");
                div.innerHTML = `
          <div class="comment-header">
            <span class="comment-nickname">${c.nickname}</span>
            <span class="comment-time">${formatDate(c.timestamp)}</span>
          </div>
          <div class="comment-text">${c.text}</div>
        `;
                commentsList.appendChild(div);
            });
        });