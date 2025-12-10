// ===== Canvas =====
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

// ===== UI Auto-hide =====
const ui = document.getElementById("ui");
let lastMove = Date.now();

document.addEventListener("mousemove", () => {
    lastMove = Date.now();
    ui.classList.remove("hide");
});

setInterval(() => {
    if (Date.now() - lastMove > 1500) ui.classList.add("hide");
}, 300);

// ===== Utils =====
const rand = (a, b) => a + Math.random() * (b - a);
const hsl = (h, s, l) => `hsl(${h},${s}%,${l}%)`;

let rockets = [];
let particles = [];

// ===== Rocket (đốm sáng bay lên) =====
class Rocket {
    constructor(x = rand(80, innerWidth - 80)) {
        this.x = x;
        this.y = innerHeight;
        this.vx = rand(-0.6, 0.6);
        this.vy = rand(4, 6);
        this.hue = rand(0, 360);
        this.trail = [];
    }

    update() {
        this.x += this.vx * Math.sin(Date.now() * 0.0025);
        this.y -= this.vy;

        // Lưu vệt sáng
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();

        // Điều kiện nổ
        if (this.vy < 1 || this.y < innerHeight * 0.35) {
            this.explode();
            return true;
        }
        return false;
    }

    draw() {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        // Vệt sáng
        for (let i = 0; i < this.trail.length; i++) {
            const p = this.trail[i];
            const alpha = i / this.trail.length;
            ctx.fillStyle = `rgba(255,255,255,${alpha * 0.4})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Lõi sáng
        ctx.shadowColor = hsl(this.hue, 100, 80);
        ctx.shadowBlur = 20;
        ctx.fillStyle = hsl(this.hue, 100, 70);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    explode() {
        const type = document.getElementById("explosionType").value;
        const count = Number(document.getElementById("density").value);
        const angleStep = (Math.PI * 2) / count;

        for (let i = 0; i < count; i++) {
            const angle = angleStep * i;
            const speed = rand(2, 5);
            particles.push(
                new Particle(this.x, this.y, angle, speed, this.hue, type)
            );
        }
    }
}

// ===== Particle (hạt nổ) =====
class Particle {
    constructor(x, y, angle, speed, hue, type) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.hue = hue + rand(-10, 10);
        this.life = rand(50, 120);
        this.type = type;
        this.size = rand(1.2, 2.4);
        this.glow = rand(10, 25);
        this.flicker = Math.random() < 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Trọng lực
        this.vy += 0.015;

        // Giảm tốc
        this.vx *= 0.985;
        this.vy *= 0.985;

        this.life--;
        return this.life <= 0;
    }

    draw() {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        let alpha = this.life / 100;
        ctx.globalAlpha = alpha;

        ctx.shadowColor = hsl(this.hue, 100, 70);
        ctx.shadowBlur = this.glow;

        ctx.fillStyle = hsl(this.hue, 100, 60);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // crackle
        if (this.type === "crackle" && Math.random() < 0.2) {
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(this.x, this.y, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // glitter
        if (this.type === "glitter" && this.flicker && Math.random() < 0.4) {
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// ===== Animation =====
function animate() {
    requestAnimationFrame(animate);

    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].draw();
        if (rockets[i].update()) rockets.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].draw();
        if (particles[i].update()) particles.splice(i, 1);
    }
}
animate();

// ===== Controls =====
canvas.addEventListener("pointerdown", e => {
    rockets.push(new Rocket(e.clientX));
});

// Auto launch
setInterval(() => {
    if (Math.random() < 0.28)
        rockets.push(new Rocket());
}, 500);
