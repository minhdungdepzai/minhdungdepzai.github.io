// --- FIREWORKS ENGINE FIXED VERSION ---
// Works with your HTML without modifying structure

const trailsCanvas = document.getElementById("trails-canvas");
const mainCanvas = document.getElementById("main-canvas");

const ctxTrails = trailsCanvas.getContext("2d");
const ctxMain = mainCanvas.getContext("2d");

// Resize canvases
function resize() {
    trailsCanvas.width = mainCanvas.width = innerWidth;
    trailsCanvas.height = mainCanvas.height = innerHeight;
}
window.addEventListener("resize", resize);
resize();

// Particle system
class Particle {
    constructor(x, y, color, vx, vy, life = 60) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.alpha = 1;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.02;
        this.alpha = this.life / 60;
        this.life--;
        return this.life > 0;
    }
    draw(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.globalAlpha = 1;
    }
}

let fireworks = [];

function launchFirework() {
    const x = Math.random() * innerWidth;
    const y = innerHeight;
    const targetY = 200 + Math.random() * 200;

    const fw = {
        x,
        y,
        targetY,
        color: `hsl(${Math.random()*360},100%,60%)`,
        exploded: false
    };

    fireworks.push(fw);
}

function explode(fw) {
    for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        particles.push(
            new Particle(
                fw.x,
                fw.y,
                fw.color,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            )
        );
    }
}

let particles = [];

function animate() {
    requestAnimationFrame(animate);

    // Trails fade
    ctxTrails.fillStyle = "rgba(0,0,0,0.2)";
    ctxTrails.fillRect(0, 0, innerWidth, innerHeight);

    // Clear main layer
    ctxMain.clearRect(0, 0, innerWidth, innerHeight);

    // Update fireworks
    fireworks = fireworks.filter(fw => {
        if (!fw.exploded) {
            fw.y -= 6;
            ctxMain.fillStyle = fw.color;
            ctxMain.fillRect(fw.x, fw.y, 4, 12);

            if (fw.y <= fw.targetY) {
                fw.exploded = true;
                explode(fw);
            }
            return true;
        }
        return false;
    });

    // Update particles
    particles = particles.filter(p => {
        const alive = p.update();
        if (alive) p.draw(ctxTrails);
        return alive;
    });
}

setInterval(launchFirework, 900);
animate();
