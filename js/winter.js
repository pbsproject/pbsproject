// ❄️ Проверка зимы (декабрь–февраль)
const month = new Date().getMonth();
const isWinter = month === 11 || month === 0 || month === 1;

if (isWinter) {
    /* =====================
       ❄️ SNOW
    ===================== */
    const canvas = document.getElementById("snow-canvas");
    const ctx = canvas.getContext("2d");

    let w, h;
    const flakes = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    class Snowflake {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.r = Math.random() * 2.5 + 1;
            this.s = Math.random() * 1 + 0.5;
            this.o = Math.random() * 0.7 + 0.3;
            this.dx = Math.random() * 0.4 - 0.2;
        }
        update() {
            this.y += this.s;
            this.x += this.dx;
            if (this.y > h) this.reset();
        }
        draw() {
            // Динамічно перевіряємо тему кожного кадру
            const isLightTheme = document.documentElement.classList.contains("light");

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = isLightTheme
                ? `rgba(200,200,200,${this.o})`
                : `rgba(255,255,255,${this.o})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 160; i++) flakes.push(new Snowflake());

    (function animate() {
        ctx.clearRect(0, 0, w, h);
        flakes.forEach(f => { f.update(); f.draw(); });
        requestAnimationFrame(animate);
    })();

    /* =====================
       🎄 CHRISTMAS LIGHTS
    ===================== */
    const lights = document.getElementById("christmas-lights");
    const colors = ["#ff3b3b", "#ffd93b", "#3bff6f", "#3bbcff", "#ff3bf2"];

    for (let i = 0; i < 30; i++) {
        const bulb = document.createElement("div");
        bulb.className = "light";
        bulb.style.color = colors[Math.floor(Math.random() * colors.length)];
        bulb.style.animationDelay = `${Math.random()}s`;
        lights.appendChild(bulb);
    }
}
