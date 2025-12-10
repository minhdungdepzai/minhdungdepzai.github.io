const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

// =========================
//  HÀM TIỆN ÍCH
// =========================
const rand = (a, b) => Math.random() * (b - a) + a;
const randInt = (a, b) => Math.floor(rand(a, b));
const hsl = (h, s, l) => `hsl(${h} ${s}% ${l}%)`;

let rockets = [];
let particles = [];

document.getElementById("toggleSettings").onclick = () => {
    document.getElementById("settings").classList.toggle("hidden");
};

// =========================
//  CLASS ROCKET (HIỆU ỨNG BAY LÊN)
// =========================
class Rocket {
    constructor(x) {
        this.startX = x ?? rand(80, innerWidth - 80);
        this.x = this.startX;
        this.y = innerHeight + 10;

        this.t = 0;
        this.speed = rand(2.2, 3.4);

        this.curveStrength = rand(22, 38);

        this.targetY = rand(innerHeight * 0.18, innerHeight * 0.45);
        this.colorHue = randInt(0, 360);

        this.trail = [];
        this.maxTrail = 5;
        this.size = rand(2.6, 4.0);
    }

    update() {
        this.t += 0.04;

        this.x = this.startX + Math.sin(this.t * 2.2) * this.curveStrength;
        this.y -= this.speed;

        // bụi li ti rơi xuống khi đang bay
        if (Math.random() < 0.3) {
            particles.push(
                new Particle(
                    this.x,
                    this.y,
                    rand(Math.PI * 0.8, Math.PI * 1.2),
                    rand(0.6, 1.6),
                    hsl(this.colorHue, 80, 70),
                    rand(0.6, 1.0),
                    { gravity: 0.05, life: randInt(15, 40), decay: 0.96 }
                )
            );
        }

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) this.trail.shift();

        return this.y <= this.targetY;
    }

    draw() {
        ctx.save();

        // vệt sáng ngắn
        ctx.globalAlpha = 0.9;
        for (let i = 0; i < this.trail.length; i++) {
            const p = this.trail[i];
            const a = (i + 1) / this.trail.length;

            ctx.fillStyle = hsl(this.colorHue, 100, 60);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.2 * a, 0, Math.PI * 2);
            ctx.fill();
        }

        // đầu đạn pháo hoa
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 6;
        ctx.shadowColor = hsl(this.colorHue, 100, 80);
        ctx.fillStyle = hsl(this.colorHue, 100, 75);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// =========================
//  CLASS PARTICLE (HẠT NỔ)
// =========================
class Particle {
    constructor(x, y, angle, speed, color, size, opts = {}) {
        this.x = x;
        this.y = y;
        this.prev = { x, y };

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.color = color;
        this.size = size;

        this.life = opts.life ?? randInt(30, 80);
        this.maxLife = this.life;
        this.gravity = opts.gravity ?? 0.05;
        this.decay = opts.decay ?? 0.97;
    }

    update() {
        this.life--;
        if (this.life <= 0) return true;

        this.prev.x = this.x;
        this.prev.y = this.y;

        this.x += this.vx;
        this.y += this.vy;

        this.vx *= this.decay;
        this.vy = this.vy * this.decay + this.gravity;

        return false;
    }

    draw() {
        const alpha = this.life / this.maxLife;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// =========================
//  TẠO HIỆU ỨNG PHÁO HOA
// =========================
function createExplosion(x, y, hue) {
    const count = randInt(45, 80);

    for (let i = 0; i < count; i++) {
        particles.push(
            new Particle(
                x,
                y,
                rand(0, Math.PI * 2),
                rand(1.5, 5.5),
                hsl(hue + randInt(-20, 20), 100, rand(50, 70)),
                rand(1.4, 2.2),
                {
                    life: randInt(40, 90),
                    decay: rand(0.94, 0.985),
                    gravity: 0.04
                }
            )
        );
    }
}

// =========================
//  LOOP ANIMATION
// =========================
function animate() {
    requestAnimationFrame(animate);

    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // random tạo rocket theo rate
    if (Math.random() < 0.04 * (rocketRate.value / 6)) {
        rockets.push(new Rocket());
    }

    // update rocket
    for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.draw();
        if (r.update()) {
            createExplosion(r.x, r.y, r.colorHue);
            rockets.splice(i, 1);
        }
    }

    // update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.draw();
        if (p.update()) particles.splice(i, 1);
    }
}

animate();
