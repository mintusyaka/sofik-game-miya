
import { Container, Graphics } from 'pixi.js';
import { GameConfig } from '../config/GameConfig';

export type ItemType = 'GOOD' | 'BAD';

export class Item extends Container {
    public itemType: ItemType;
    public visual: Graphics;
    public active: boolean = false;
    private speed: number = 3;

    constructor(type: ItemType) {
        super();
        this.itemType = type;

        this.visual = new Graphics();
        this.setupVisual();
        this.addChild(this.visual);
    }

    private setupVisual(): void {
        this.visual.clear();
        if (this.itemType === 'GOOD') {
            // Cherry style: Red circle
            this.visual.circle(0, 0, 20);
            this.visual.fill(0xFF0000);
            this.visual.stroke({ width: 2, color: 0xFFFFFF });
        } else {
            // Bad item: Dark circle
            this.visual.circle(0, 0, 20);
            this.visual.fill(0x333333);
            this.visual.stroke({ width: 2, color: 0x000000 });
        }
    }

    public resetType(type: ItemType): void {
        this.itemType = type;
        this.setupVisual();
    }

    public spawn(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.active = true;
        this.visible = true;

        // Randomize speed slightly
        this.speed = GameConfig.minSpeed + Math.random() * (GameConfig.maxSpeed - GameConfig.minSpeed);
    }

    public update(delta: number): void {
        if (!this.active) return;

        this.y += this.speed * delta;

        // Deactivate if off screen
        if (this.y > GameConfig.height + 50) {
            this.deactivate();
        }
    }

    public deactivate(): void {
        this.active = false;
        this.visible = false;
    }
}
