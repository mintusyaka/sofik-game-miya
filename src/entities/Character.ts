
import { Container, Graphics, Sprite, Assets, AnimatedSprite } from 'pixi.js';
import { GameConfig } from '../config/GameConfig';
import { InputManager } from '../systems/InputManager';

export class Character extends Container {
    private vx: number = 0;
    private vy: number = 0;
    // private visual: Container; // Not used currently
    private targetX: number;
    private targetY: number;

    constructor() {
        super();

        // Try to load animation frames
        const textures = [
            Assets.get('character_1'),
            Assets.get('character_2'),
            Assets.get('character_3')
        ].filter(t => !!t); // Filter out missing textures

        if (textures.length > 0) {
            // Animated Sprite
            const anim = new AnimatedSprite(textures);
            anim.anchor.set(0.5);
            anim.scale.set(0.3); // Increased from 0.2
            anim.animationSpeed = 0.1;
            anim.play();
            this.addChild(anim);
            // this.visual = anim;
        } else {
            // Fallback to static sprite
            const texture = Assets.get('character');
            if (texture) {
                const sprite = Sprite.from(texture);
                sprite.anchor.set(0.5);
                sprite.scale.set(0.3); // Increased from 0.2
                this.addChild(sprite);
                // this.visual = sprite; 
            } else {
                // Fallback to graphic
                const gfx = new Graphics();
                gfx.circle(0, 0, 40); // Increased from 25
                gfx.fill(0x00FF00);
                gfx.stroke({ width: 2, color: 0xFFFFFF });
                this.addChild(gfx);
                // this.visual = gfx;
            }
        }

        // Start at center
        this.x = GameConfig.width / 2;
        this.y = GameConfig.height / 2;
        this.targetX = this.x;
        this.targetY = this.y;
    }

    private speedMultiplier: number = 1.0;

    public setSpeedMultiplier(value: number): void {
        this.speedMultiplier = value;
        if (value < 1.0) {
            this.tint = 0xFF0000; // Red tint when slow
        } else {
            this.tint = 0xFFFFFF; // Reset tint
        }
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
            const maxSpeed = GameConfig.pcMaxSpeed * this.speedMultiplier;

            if (currentSpeed > maxSpeed) {
                const ratio = maxSpeed / currentSpeed;
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
                const maxSpeed = GameConfig.pcMaxSpeed * this.speedMultiplier;
                if (moveDist > maxSpeed * delta) {
                    moveDist = maxSpeed * delta;
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

    public getHitSprite(): Sprite | null {
        // Return the first child if it's a Sprite/AnimatedSprite
        if (this.children.length > 0 && (this.children[0] instanceof Sprite || this.children[0] instanceof AnimatedSprite)) {
            return this.children[0] as Sprite;
        }
        return null;
    }
}
