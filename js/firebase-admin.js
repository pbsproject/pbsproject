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
            set
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
        const auth = getAuth(app);
        const db = getDatabase(app);

        const loginPanel = document.getElementById('loginPanel');
        const adminPanel = document.getElementById('adminPanel');
        const loginBtn = document.getElementById('loginBtn');
        const loginError = document.getElementById('loginError');
        const logoutBtn = document.getElementById('logoutBtn');
        const addModForm = document.getElementById('addModForm');
        const formMsg = document.getElementById('formMsg');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const togglePassBtn = document.getElementById('togglePass');
        const imagesField = document.getElementById('images');
        const previewWrap = document.getElementById('previewWrap');
        const preview = document.getElementById('preview');

        // Toggle password visibility
        togglePassBtn.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePassBtn.innerHTML = '<i class="fa fa-eye-slash"></i>';
            } else {
                passwordInput.type = "password";
                togglePassBtn.innerHTML = '<i class="fa fa-eye"></i>';
            }
        });

        // Auth
        async function doLogin() {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (err) {
                loginError.style.display = 'block';
                loginError.textContent = "Ошибка входа. Проверьте email/пароль.";
            }
        }
        loginBtn.addEventListener('click', doLogin);

        // Enter navigation
        emailInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                passwordInput.focus();
            }
        });
        passwordInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                doLogin();
            }
        });

        logoutBtn.addEventListener('click', () => signOut(auth));
        onAuthStateChanged(auth, user => {
            if (user) {
                loginPanel.classList.add('hidden');
                adminPanel.classList.remove('hidden');
            } else {
                loginPanel.classList.remove('hidden');
                adminPanel.classList.add('hidden');
            }
        });

        // Preview gallery
        imagesField.addEventListener('input', () => {
            const urls = imagesField.value.split(',').map(u => u.trim()).filter(Boolean);
            if (urls.length > 0) {
                previewWrap.classList.remove('hidden');
                preview.innerHTML = urls.map((u, i) =>
                    isValidUrl(u) ? `
            <div class="gallery-item" data-url="${u}">
              <img src="${u}" alt="preview-${i}" class="gallery-image">
              <div class="gallery-overlay"><span>Превью ${i+1}</span></div>
            </div>
          ` : ''
                ).join('');
                setupGalleryClicks();
            } else {
                previewWrap.classList.add('hidden');
                preview.innerHTML = '';
            }
        });

        function isValidUrl(str) {
            try {
                new URL(str);
                return true;
            } catch {
                return false;
            }
        }

        // Lightbox gallery
        function setupGalleryClicks() {
            document.querySelectorAll('.gallery-item').forEach(item => {
                item.addEventListener('click', () => {
                    const url = item.dataset.url;
                    const lightbox = document.createElement('div');
                    lightbox.classList.add('lightbox');
                    const img = document.createElement('img');
                    img.src = url;
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'lightbox-close';
                    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                    lightbox.appendChild(img);
                    lightbox.appendChild(closeBtn);
                    document.body.appendChild(lightbox);
                    setTimeout(() => lightbox.classList.add('show'), 10);

                    function close() {
                        lightbox.classList.remove('show');
                        setTimeout(() => lightbox.remove(), 300);
                    }
                    closeBtn.addEventListener('click', close);
                    lightbox.addEventListener('click', e => {
                        if (e.target === lightbox) close();
                    });
                    document.addEventListener('keydown', function escHandler(e) {
                        if (e.key === 'Escape') {
                            close();
                            document.removeEventListener('keydown', escHandler);
                        }
                    });
                });
            });
        }

        // Submit
        addModForm.addEventListener('submit', async e => {
            e.preventDefault();
            formMsg.textContent = "";
            const title = document.getElementById('title').value.trim();
            const type = document.getElementById('type').value;
            const description = document.getElementById('description').value.trim();
            const modelAuthor = document.getElementById('modelAuthor').value.trim();
            const convertAuthor = document.getElementById('convertAuthor').value.trim();
            const weight = document.getElementById('weight').value.trim();
            const download = document.getElementById('download').value.trim();
            const images = imagesField.value.split(',').map(u => u.trim()).filter(Boolean);

            if (!title || !type || images.length === 0) {
                formMsg.style.color = "#ff8b8b";
                formMsg.textContent = "Заполните обязательные поля.";
                return;
            }
            if (download && !isValidUrl(download)) {
                formMsg.style.color = "#ff8b8b";
                formMsg.textContent = "Неверная ссылка на мод.";
                return;
            }
            if (images.some(u => !isValidUrl(u))) {
                formMsg.style.color = "#ff8b8b";
                formMsg.textContent = "Одна из картинок имеет неверный URL.";
                return;
            }

            const mod = {
                title,
                type,
                description,
                modelAuthor,
                convertAuthor,
                weight,
                download,
                images,
                createdAt: Date.now()
            };
            try {
                const newRef = push(ref(db, 'mods'));
                await set(newRef, mod);
                const newId = newRef.key;
                formMsg.style.color = "#8bffb3";
                formMsg.textContent = "✅ Опубликовано! Переходим на созданую страницу...";
                setTimeout(() => window.location.href = `mod.html?id=${newId}`, 1000);
            } catch (err) {
                formMsg.style.color = "#ff8b8b";
                formMsg.textContent = "Ошибка при сохранении.";
                console.error(err);
            }
        });