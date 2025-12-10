// ===== Canvas =====
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

// ===== UI hide/show =====
let lastMove = Date.now();
const settings = document.getElementById("settings");

document.addEventListener("mousemove", () => {
    lastMove = Date.now();
    settings.classList.remove("hidden");
});

setInterval(() => {
    if (Date.now() - lastMove > 2000) {
        settings.classList.add("hidden");
    }
}, 300);

// ===== Utils =====
const rand = (a, b) => a + Math.random() * (b - a);
const hsl = (h, s, l) => `hsl(${h},${s}%,${l}%)`;

let rockets = [];
let particles = [];

// Rocket class
class Rocket {
    constructor(x) {
        this.x = x ?? rand(80, innerWidth - 80);
        this.y = innerHeight + 20;
        this.vx = rand(-0.8, 0.8);   // lượn nhẹ
        this.vy = rand(3.5, 5.2);
        this.hue = rand(0, 360);
    }
    update() {
        this.x += this.vx * Math.sin(Date.now() * 0.002); // lượn chữ S
        this.y -= this.vy;
        this.vy *= 0.985;

        if (this.vy < 1.5 || this.y < innerHeight * 0.35) {
            this.explode();
            return true;
        }
        return false;
    }
    draw() {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowColor = hsl(this.hue, 100, 80);
        ctx.shadowBlur = 12;

        ctx.fillStyle = hsl(this.hue, 100, 70);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    explode() {
        const type = document.getElementById("type").value;
        const count = Number(document.getElementById("count").value);

        let angleStep = (Math.PI * 2) / count;

        for (let i = 0; i < count; i++) {
            const angle = angleStep * i;
            const speed = explosionSpeed(type);

            particles.push(new Particle(this.x, this.y, angle, speed, this.hue, type));
        }
    }
}

// Speed by type
function explosionSpeed(type) {
    switch (type) {
        case "spark": return rand(0.5, 2);
        case "willow": return rand(0.5, 1.3);
        case "ring": return 3;
        case "star": return 2.8;
        case "chrysanthemum": return rand(1, 4);
        default: return rand(1.5, 4);
    }
}

// Particle class
class Particle {
    constructor(x, y, angle, speed, hue, type) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.hue = hue + rand(-20, 20);
        this.life = rand(40, 90);
        this.type = type;
        this.size = rand(1, 2.5);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.type !== "ring") {
            this.vy += 0.02; // gravity
        }

        this.vx *= 0.99;
        this.vy *= 0.99;

        this.life--;
        return this.life <= 0;
    }

    draw() {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        let alpha = this.life / 90;
        ctx.globalAlpha = alpha;

        ctx.shadowColor = hsl(this.hue, 100, 70);
        ctx.shadowBlur = 8;
        ctx.fillStyle = hsl(this.hue, 100, 60);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ===== Animation loop =====
function animate() {
    requestAnimationFrame(animate);

    // Fade background
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].draw();
        if (rockets[i].update()) rockets.splice(i, 1);
    }

    // Particles
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

// auto launch
setInterval(() => {
    if (Math.random() < 0.2) rockets.push(new Rocket());
}, 700);
