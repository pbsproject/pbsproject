        import {
            initializeApp
        } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import {
            getDatabase,
            ref,
            get
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

        get(ref(db, "mods")).then(snapshot => {
            const mods = [];
            snapshot.forEach(child => {
                mods.push({
                    id: child.key,
                    ...child.val()
                });
            });

            console.log("Загруженные моды:", mods);

            const container = document.querySelector("#newdownloads .departments-grid");
            if (!container) {
                console.error("Контейнер .departments-grid не найден");
                return;
            }

            mods.reverse().slice(0, 6).forEach(mod => {
                const card = document.createElement("div");
                card.className = "department-card fade-in-up";
                card.style = "display: flex; flex-direction: column;";

                card.innerHTML = `
        <img src="${mod.images?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'}" 
             alt="${mod.title}" 
             style="width:100%; border-radius: var(--radius-md); margin-bottom: var(--space-md);">

        <h3 class="department-title">${mod.title}</h3>

        <p class="department-description">
          ${mod.description || "Без описания."}
        </p>

        <a href="mod.html?id=${mod.id}" 
           class="btn btn-primary" 
           style="position: relative; overflow: hidden; margin-left: auto;">
          <span>Подробнее</span>
        </a>
      `;

                container.appendChild(card);
            });
        }).catch(error => {
            console.error("Ошибка при загрузке модов:", error);
        });