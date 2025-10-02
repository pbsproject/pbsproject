        // Loading Screen
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
        }, 1500);

        // Header Scroll Effect
        const header = document.getElementById('header');
        const scrollToTopBtn = document.getElementById('scrollToTop');

        function updateScrollElements() {
            const scrollY = window.scrollY;

            if (scrollY > 100) {
                header.classList.add('scrolled');
                scrollToTopBtn.classList.add('visible');
            } else {
                header.classList.remove('scrolled');
                scrollToTopBtn.classList.remove('visible');
            }

            updateActiveNavLink();
        }

        window.addEventListener('scroll', updateScrollElements);

        // Mobile Menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');
        let menuOpen = false;

        mobileMenuBtn.addEventListener('click', () => {
            menuOpen = !menuOpen;
            navMenu.classList.toggle('active');

            const icon = mobileMenuBtn.querySelector('i');
            if (menuOpen) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });

        // Close mobile menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (menuOpen) {
                    navMenu.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                    menuOpen = false;
                }
            });
        });

        // Smooth Scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Scroll to Top
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Active Navigation Link Update
        function updateActiveNavLink() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-link');
            const headerHeight = header.offsetHeight;

            let currentSection = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeight - 50;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }

        // Intersection Observer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // Animate counters for stat cards
                    if (entry.target.classList.contains('stat-card')) {
                        animateCounter(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.querySelectorAll('.fade-in-up, .scale-in').forEach(el => {
            observer.observe(el);
        });

        // Counter Animation
        function animateCounter(statCard) {
            const numberElement = statCard.querySelector('.stat-number');
            const target = parseInt(numberElement.dataset.target);
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(target * easeOutQuart);

                numberElement.textContent = current;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    numberElement.textContent = target;
                }
            }

            requestAnimationFrame(updateCounter);
        }

        // FAQ Accordion
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const isActive = faqItem.classList.contains('active');
                const answer = faqItem.querySelector('.faq-answer');

                // Close all FAQ items
                document.querySelectorAll('.faq-item').forEach(item => {
                    if (item !== faqItem) {
                        item.classList.remove('active');
                        const otherAnswer = item.querySelector('.faq-answer');
                        otherAnswer.style.maxHeight = '0px';
                    }
                });

                // Toggle clicked item
                if (!isActive) {
                    faqItem.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    faqItem.classList.remove('active');
                    answer.style.maxHeight = '0px';
                }
            });
        });

        // Gallery Lightbox
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('.gallery-image');

                const lightbox = document.createElement('div');
                lightbox.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `;

                const lightboxImg = document.createElement('img');
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightboxImg.style.cssText = `
                    max-width: 90%;
                    max-height: 90%;
                    object-fit: contain;
                    border-radius: 12px;
                `;

                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                closeBtn.style.cssText = `
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    font-size: 20px;
                    padding: 10px;
                    border-radius: 50%;
                    cursor: pointer;
                    backdrop-filter: blur(10px);
                `;

                lightbox.appendChild(lightboxImg);
                lightbox.appendChild(closeBtn);
                document.body.appendChild(lightbox);

                setTimeout(() => {
                    lightbox.style.opacity = '1';
                }, 10);

                const closeLightbox = () => {
                    lightbox.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(lightbox);
                    }, 300);
                };

                closeBtn.addEventListener('click', closeLightbox);
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox) closeLightbox();
                });

                document.addEventListener('keydown', function escHandler(e) {
                    if (e.key === 'Escape') {
                        closeLightbox();
                        document.removeEventListener('keydown', escHandler);
                    }
                });
            });
        });

        const toggle = document.getElementById('theme-toggle');
        const root = document.documentElement;

        function applyTheme(theme) {
            root.classList.toggle('light', theme === 'light');
            localStorage.setItem('theme', theme);
        }

        toggle.addEventListener('click', () => {
            const currentTheme = root.classList.contains('light') ? 'light' : 'dark';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });

        // Встановлення теми при завантаженні
        const savedTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(savedTheme);

        console.log('PBS.project Website - Loaded successfully!');