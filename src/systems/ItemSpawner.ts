
import { Application, Container } from 'pixi.js';
import { Item, type ItemType } from '../entities/Item';
import { GameConfig } from '../config/GameConfig';

export class ItemSpawner {
    private app: Application;
    private items: Item[] = [];
    private container: Container;
    private spawnTimer: number = 0;
    private baseSpawnInterval: number = 30; // Frames (0.5 second at 60fps)
    private spawnInterval: number = 30;
    private maxItems: number = 25;

    private isFrozen: boolean = false;
    private freezeTimer: number = 0;

    constructor(app: Application) {
        this.app = app;
        this.container = new Container();
        this.app.stage.addChild(this.container);
    }

    public update(delta: number): void {
        if (this.isFrozen) {
            this.freezeTimer -= delta;
            if (this.freezeTimer <= 0) {
                this.isFrozen = false;
            }
            return; // Skip spawning and item updates while frozen
        }

        this.spawnTimer += delta;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnitem();
        }

        // Update all active items
        for (const item of this.items) {
            item.update(delta);
        }
    }

    public freezeItems(durationFrames: number): void {
        this.isFrozen = true;
        this.freezeTimer = durationFrames;
    }

    private spawnitem(): void {
        // Enforce pool cap
        const activeCount = this.items.filter(i => i.active).length;
        if (activeCount >= this.maxItems) return;

        const item = this.getPooledItem();

        // Randomly choose side: 0=Top, 1=Bottom, 2=Left, 3=Right
        const side = Math.random();
        let x, y;

        if (side < 0.25) {
            // TOP (Moves Down)
            x = Math.random() * (GameConfig.width - 40) + 20;
            y = -60;
        } else if (side < 0.5) {
            // BOTTOM (Moves Up)
            x = Math.random() * (GameConfig.width - 40) + 20;
            y = GameConfig.height + 60;
        } else if (side < 0.75) {
            // LEFT (Moves Right)
            x = -60;
            y = Math.random() * (GameConfig.height - 40) + 20;
        } else {
            // RIGHT (Moves Left)
            x = GameConfig.width + 60;
            y = Math.random() * (GameConfig.height - 40) + 20;
        }

        item.spawn(x, y);
    }

    private getPooledItem(): Item {
        // Find inactive item
        let item = this.items.find(i => !i.active);

        if (!item) {
            // Create new if none available
            const rand = Math.random();
            const type: ItemType = rand > 0.95 ? 'FREEZE' : (rand > 0.3 ? 'GOOD' : 'BAD');
            item = new Item(type);
            this.items.push(item);
            this.container.addChild(item);
        } else {
            // Reset type for reused item
            const rand = Math.random();
            const type: ItemType = rand > 0.95 ? 'FREEZE' : (rand > 0.3 ? 'GOOD' : 'BAD');
            item.resetType(type);
        }

        return item;
    }

    public getItems(): Item[] {
        return this.items;
    }

    public setSpawnMultiplier(multiplier: number): void {
        // Lower interval = faster spawn
        this.spawnInterval = this.baseSpawnInterval / multiplier;
    }

    public getIsFrozen(): boolean {
        return this.isFrozen;
    }

    public getFreezeTimer(): number {
        return this.freezeTimer;
    }
}
