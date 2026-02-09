
import { Container, Graphics } from 'pixi.js';
import { GameConfig } from '../config/GameConfig';
import { InputManager } from '../systems/InputManager';

export class Character extends Container {
    private vx: number = 0;
    private vy: number = 0;
    private visual: Graphics;
    private targetX: number;
    private targetY: number;

    constructor() {
        super();

        // Placeholder visual: Green circle (Fairy)
        this.visual = new Graphics();
        this.visual.circle(0, 0, 30);
        this.visual.fill(0x00FF00);
        this.visual.stroke({ width: 2, color: 0xFFFFFF });

        this.addChild(this.visual);

        // Start at center
        this.x = GameConfig.width / 2;
        this.y = GameConfig.height / 2;
        this.targetX = this.x;
        this.targetY = this.y;
    }

    public update(delta: number): void {
        const input = InputManager.getInstance();
        const dir = input.getDirection();

        // Check for keyboard input first
        if (dir.x !== 0 || dir.y !== 0) {
            // PC Physics: Acceleration
            this.vx += dir.x * GameConfig.pcAcceleration * delta;
            this.vy += dir.y * GameConfig.pcAcceleration * delta;

            // Cap speed
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed > GameConfig.pcMaxSpeed) {
                const ratio = GameConfig.pcMaxSpeed / currentSpeed;
                this.vx *= ratio;
                this.vy *= ratio;
            }

            // Sync target for touch fallback
            this.targetX = this.x;
            this.targetY = this.y;
        } else {
            // No keyboard input: Apply friction
            this.vx *= GameConfig.pcFriction;
            this.vy *= GameConfig.pcFriction;

            // Stop completely if very slow
            if (Math.abs(this.vx) < 0.1) this.vx = 0;
            if (Math.abs(this.vy) < 0.1) this.vy = 0;
        }

        // Apply velocity (PC/Physics)
        this.x += this.vx * delta;
        this.y += this.vy * delta;

        // Mobile/Mouse Control Override
        if (input.isPointerDown) {
            // Override physics with direct smooth follow
            this.targetX = input.pointerPosition.x;
            this.targetY = input.pointerPosition.y;

            // Kill velocity so it doesn't fight
            this.vx = 0;
            this.vy = 0;

            // Calculate desired movement
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) { // Avoid jitter
                // Calculate how much we WANT to move this frame (Lerp)
                let moveDist = dist * GameConfig.mobileLerp * delta;

                // Cap at max speed
                if (moveDist > GameConfig.pcMaxSpeed * delta) {
                    moveDist = GameConfig.pcMaxSpeed * delta;
                }

                // Move towards target
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * moveDist;
                this.y += Math.sin(angle) * moveDist;
            }
        }

        // Constrain to screen bounds and bounce/stop
        const radius = 30;
        if (this.x < radius) { this.x = radius; this.vx = 0; }
        if (this.x > GameConfig.width - radius) { this.x = GameConfig.width - radius; this.vx = 0; }
        if (this.y < radius) { this.y = radius; this.vy = 0; }
        if (this.y > GameConfig.height - radius) { this.y = GameConfig.height - radius; this.vy = 0; }
    }
}
