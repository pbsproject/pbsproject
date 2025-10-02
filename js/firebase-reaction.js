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
            storageBucket: "pbsproject-39041.firebasestorage.app",
            messagingSenderId: "695400532049",
            appId: "1:695400532049:web:31d2de08045c4d3eeb1070",
            measurementId: "G-FGLT883PDC"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);

        // беремо pageId з HTML
        const interactionSection = document.querySelector('[data-id]');
        const pageId = interactionSection?.dataset.id;

        // ==================
        // Реакции
        // ==================
        const reactionBox = interactionSection.querySelector('.reaction-box');
        const likeBtn = reactionBox.querySelector('.like-btn');
        const dislikeBtn = reactionBox.querySelector('.dislike-btn');
        const likeCount = reactionBox.querySelector('.like-count');
        const dislikeCount = reactionBox.querySelector('.dislike-count');

        const modRef = ref(db, 'react/' + pageId);

        onValue(modRef, snapshot => {
            const data = snapshot.val() || {
                likes: 0,
                dislikes: 0
            };
            likeCount.textContent = data.likes || 0;
            dislikeCount.textContent = data.dislikes || 0;
        });

        let reacted = localStorage.getItem("reacted_" + pageId);

        if (reacted === "like") likeBtn.classList.add("active");
        if (reacted === "dislike") dislikeBtn.classList.add("active");

        function reactbounce(el) {
            el.classList.add("reactbounce");
            setTimeout(() => el.classList.remove("reactbounce"), 400);
        }

        likeBtn.addEventListener('click', async () => {
            const snap = await get(modRef);
            const data = snap.val() || {
                likes: 0,
                dislikes: 0
            };

            if (reacted === "like") {
                update(modRef, {
                    likes: Math.max((data.likes || 0) - 1, 0)
                });
                localStorage.removeItem("reacted_" + pageId);
                likeBtn.classList.remove("active");
                reacted = null;
            } else {
                if (reacted === "dislike") {
                    update(modRef, {
                        dislikes: Math.max((data.dislikes || 0) - 1, 0)
                    });
                    dislikeBtn.classList.remove("active");
                }
                update(modRef, {
                    likes: (data.likes || 0) + 1
                });
                localStorage.setItem("reacted_" + pageId, "like");
                likeBtn.classList.add("active");
                dislikeBtn.classList.remove("active");
                reacted = "like";
                reactbounce(likeCount);
            }
        });

        dislikeBtn.addEventListener('click', async () => {
            const snap = await get(modRef);
            const data = snap.val() || {
                likes: 0,
                dislikes: 0
            };

            if (reacted === "dislike") {
                update(modRef, {
                    dislikes: Math.max((data.dislikes || 0) - 1, 0)
                });
                localStorage.removeItem("reacted_" + pageId);
                dislikeBtn.classList.remove("active");
                reacted = null;
            } else {
                if (reacted === "like") {
                    update(modRef, {
                        likes: Math.max((data.likes || 0) - 1, 0)
                    });
                    likeBtn.classList.remove("active");
                }
                update(modRef, {
                    dislikes: (data.dislikes || 0) + 1
                });
                localStorage.setItem("reacted_" + pageId, "dislike");
                dislikeBtn.classList.add("active");
                likeBtn.classList.remove("active");
                reacted = "dislike";
                reactbounce(dislikeCount);
            }
        });

        // ==================
        // Комментарии
        // ==================
        const commentsRef = ref(db, "comments/" + pageId);
        const commentForm = document.getElementById("commentForm");
        const commentsList = document.getElementById("commentsList");

        function formatDate(timestamp) {
            return new Intl.DateTimeFormat("ru-RU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Moscow"
            }).format(new Date(timestamp));
        }

        commentForm.addEventListener("submit", (e) => {
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

        onValue(commentsRef, (snapshot) => {
            commentsList.innerHTML = "";
            snapshot.forEach((child) => {
                const comment = child.val();
                const div = document.createElement("div");
                div.classList.add("comment");

                div.innerHTML = `
        <div class="comment-header">
          <span class="comment-nickname">${comment.nickname}</span>
          <span class="comment-time">${formatDate(comment.timestamp)}</span>
        </div>
        <div class="comment-text">${comment.text}</div>
      `;
                commentsList.appendChild(div);
            });
        });