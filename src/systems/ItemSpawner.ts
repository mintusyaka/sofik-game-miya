
import { Application, Container } from 'pixi.js';
import { Item, type ItemType } from '../entities/Item';
import { GameConfig } from '../config/GameConfig';

export class ItemSpawner {
    private app: Application;
    private items: Item[] = [];
    private container: Container;
    private spawnTimer: number = 0;
    private spawnInterval: number = 60; // Frames

    constructor(app: Application) {
        this.app = app;
        this.container = new Container();
        this.app.stage.addChild(this.container);
    }

    public update(delta: number): void {
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

    private spawnitem(): void {
        const item = this.getPooledItem();
        const x = Math.random() * (GameConfig.width - 40) + 20;
        const y = -50;
        item.spawn(x, y);
    }

    private getPooledItem(): Item {
        // Find inactive item
        let item = this.items.find(i => !i.active);

        if (!item) {
            // Create new if none available
            const type: ItemType = Math.random() > 0.3 ? 'GOOD' : 'BAD';
            item = new Item(type);
            this.items.push(item);
            this.container.addChild(item);
        } else {
            // Reset type for reused item
            const type: ItemType = Math.random() > 0.3 ? 'GOOD' : 'BAD';
            item.resetType(type);
        }

        return item;
    }

    public getItems(): Item[] {
        return this.items;
    }
}
