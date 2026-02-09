
import { Container, Graphics, Sprite, Assets } from 'pixi.js';
import { GameConfig } from '../config/GameConfig';

export type ItemType = 'GOOD' | 'BAD' | 'FREEZE';

export class Item extends Container {
    public itemType: ItemType;
    public visual: Graphics;
    public active: boolean = false;
    private vx: number = 0;
    private vy: number = 0;
    private visualGood: Container;
    private visualBad: Container;
    private visualFreeze: Container;
    private glow: Graphics | null = null;

    constructor(type: ItemType) {
        super();
        this.itemType = type;

        this.visual = new Graphics();
        this.addChild(this.visual);

        // Initialize all visuals once
        this.visualGood = new Container();
        this.visualBad = new Container();
        this.visualFreeze = new Container();

        this.createVisuals();

        // Add them all to the main visual container
        this.visual.addChild(this.visualGood);
        this.visual.addChild(this.visualBad);
        this.visual.addChild(this.visualFreeze);

        this.updateVisualState();
    }

    private createVisuals(): void {
        // --- GOOD ITEM ---
        const texGood = Assets.get('item_good');
        if (texGood) {
            const sprite = Sprite.from(texGood);
            sprite.anchor.set(0.5);
            sprite.width = 60;
            sprite.height = 60;
            this.visualGood.addChild(sprite);
        } else {
            const gfx = new Graphics();
            gfx.circle(0, 0, 30);
            gfx.fill(0xFF0000);
            gfx.stroke({ width: 2, color: 0xFFFFFF });
            this.visualGood.addChild(gfx);
        }

        // --- BAD ITEM ---
        const texBad = Assets.get('item_bad');
        if (texBad) {
            const sprite = Sprite.from(texBad);
            sprite.anchor.set(0.5);
            sprite.width = 60;
            sprite.height = 60;
            this.visualBad.addChild(sprite);
        } else {
            const gfx = new Graphics();
            gfx.circle(0, 0, 30);
            gfx.fill(0x333333);
            gfx.stroke({ width: 2, color: 0x000000 });
            this.visualBad.addChild(gfx);
        }

        // --- FREEZE ITEM ---
        // Glow
        this.glow = new Graphics();
        this.glow.circle(0, 0, 50);
        this.glow.fill({ color: 0x00FFFF, alpha: 0.5 });
        this.visualFreeze.addChild(this.glow);

        // Sprite (Reuse Good texture or fallback)
        if (texGood) {
            const sprite = Sprite.from(texGood);
            sprite.anchor.set(0.5);
            sprite.width = 60;
            sprite.height = 60;
            this.visualFreeze.addChild(sprite);
        } else {
            const gfx = new Graphics();
            gfx.rect(-25, -25, 50, 50);
            gfx.fill(0x00FFFF);
            this.visualFreeze.addChild(gfx);
        }
    }

    private updateVisualState(): void {
        this.visualGood.visible = false;
        this.visualBad.visible = false;
        this.visualFreeze.visible = false;

        if (this.itemType === 'GOOD') {
            this.visualGood.visible = true;
        } else if (this.itemType === 'BAD') {
            this.visualBad.visible = true;
        } else if (this.itemType === 'FREEZE') {
            this.visualFreeze.visible = true;
        }
    }

    public resetType(type: ItemType): void {
        this.itemType = type;
        this.updateVisualState();
    }

    private baseX: number = 0;
    private baseY: number = 0;
    private wavePhase: number = 0;

    public spawn(x: number, y: number): void {
        this.baseX = x;
        this.baseY = y;
        this.active = true;
        this.visible = true;

        // Randomize initial phase so they don't all wave in sync
        this.wavePhase = Math.random() * Math.PI * 2;

        // Base speed
        const speed = GameConfig.minSpeed + Math.random() * (GameConfig.maxSpeed - GameConfig.minSpeed);

        // Determine velocity based on spawn position (Move Inward)
        if (y < 0) {
            // Spawning from Top -> Move Down
            this.vy = speed;
            this.vx = 0;
        } else if (y > GameConfig.height) {
            // Spawning from Bottom -> Move Up
            this.vy = -speed;
            this.vx = 0;
        } else if (x < 0) {
            // Spawning from Left -> Move Right
            this.vx = speed;
            this.vy = 0;
        } else if (x > GameConfig.width) {
            // Spawning from Right -> Move Left
            this.vx = -speed;
            this.vy = 0;
        }
    }

    public update(delta: number): void {
        if (!this.active) return;

        // Move the "base" center point linearly
        this.baseX += this.vx * delta;
        this.baseY += this.vy * delta;

        // Update wave phase
        this.wavePhase += GameConfig.itemWaveFrequency * delta;

        // Calculate Wave Offset
        // If moving vertically (vy != 0), apply wave to X
        // If moving horizontally (vx != 0), apply wave to Y
        const waveOffset = Math.sin(this.wavePhase) * GameConfig.itemWaveAmplitude;

        if (this.vx !== 0) {
            // Horizontal movement -> Vertical wave
            this.x = this.baseX;
            this.y = this.baseY + waveOffset;
        } else {
            // Vertical movement -> Horizontal wave
            this.x = this.baseX + waveOffset;
            this.y = this.baseY;
        }

        // Visual Rotation
        this.visual.rotation = Math.sin(this.wavePhase) * 0.5; // Gentle rocking

        // Animate Glow if Freeze item
        if (this.itemType === 'FREEZE' && this.glow) {
            // Pulse alpha between 0.3 and 0.8
            this.glow.alpha = 0.55 + Math.sin(this.wavePhase * 3) * 0.25;
        }

        // Deactivate if off screen (with margin)
        const margin = 100;
        if (
            (this.vy > 0 && this.baseY > GameConfig.height + margin) || // Moving Down -> Bottom exit
            (this.vy < 0 && this.baseY < -margin) ||                    // Moving Up -> Top exit
            (this.vx > 0 && this.baseX > GameConfig.width + margin) ||  // Moving Right -> Right exit
            (this.vx < 0 && this.baseX < -margin)                       // Moving Left -> Left exit
        ) {
            this.deactivate();
        }
    }

    public deactivate(): void {
        this.active = false;
        this.visible = false;
    }
    public getHitSprite(): Sprite | null {
        // Find the active container
        let activeContainer: Container;
        if (this.itemType === 'GOOD') activeContainer = this.visualGood;
        else if (this.itemType === 'BAD') activeContainer = this.visualBad;
        else if (this.itemType === 'FREEZE') activeContainer = this.visualFreeze;
        else return null;

        // Find the sprite within it
        for (const child of activeContainer.children) {
            if (child instanceof Sprite) {
                return child;
            }
        }
        return null; // Fallback or Graphics-only
    }
}
