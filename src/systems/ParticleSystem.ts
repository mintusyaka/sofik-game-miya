
import { Container, Graphics } from 'pixi.js';

interface Particle {
    sprite: Graphics;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    active: boolean;
}

export class ParticleSystem extends Container {
    private pool: Particle[] = [];
    private maxParticles: number = 30;

    constructor() {
        super();
        this.initPool();
    }

    private initPool(): void {
        for (let i = 0; i < this.maxParticles; i++) {
            const gfx = new Graphics();
            // Draw a star/diamond shape
            gfx.poly([
                0, -10,  // Top
                7, 0,    // Right
                0, 10,   // Bottom
                -7, 0    // Left
            ]);
            gfx.fill(0xFFFF00); // Yellow/Gold
            gfx.visible = false;
            this.addChild(gfx);

            this.pool.push({
                sprite: gfx,
                vx: 0,
                vy: 0,
                life: 0,
                maxLife: 1,
                active: false
            });
        }
    }

    public spawnStar(x: number, y: number): void {
        // Find first inactive particle
        const p = this.pool.find(p => !p.active);
        if (!p) return; // Pool empty

        p.active = true;
        p.sprite.visible = true;
        p.sprite.x = x;
        p.sprite.y = y;
        p.sprite.alpha = 1;
        p.sprite.scale.set(0.5 + Math.random() * 0.5); // Random size
        p.sprite.rotation = Math.random() * Math.PI;

        // Random drift
        p.vx = (Math.random() - 0.5) * 2;
        p.vy = (Math.random() - 0.5) * 2;

        p.life = 0.5 + Math.random() * 0.5; // Seconds
        p.maxLife = p.life;
    }

    public update(delta: number): void {
        // Delta is in frames (pixels/frame), but we might want time-based here
        // Assuming delta ~ 1.0 for 60fps
        const dt = delta / 60; // Approximate seconds

        for (const p of this.pool) {
            if (!p.active) continue;

            p.life -= dt;
            if (p.life <= 0) {
                p.active = false;
                p.sprite.visible = false;
                continue;
            }

            p.sprite.x += p.vx * delta; // Move
            p.sprite.y += p.vy * delta;
            p.sprite.rotation += 0.1 * delta;

            // Fade out
            p.sprite.alpha = p.life / p.maxLife;
        }
    }
}
