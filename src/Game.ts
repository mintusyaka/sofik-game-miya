
import { Application } from 'pixi.js';
import { GameConfig } from './config/GameConfig';
import { ScaleManager } from './core/ScaleManager';
import { AssetLoader } from './core/AssetLoader';
import { Character } from './entities/Character';
import { InputManager } from './systems/InputManager';
import { ItemSpawner } from './systems/ItemSpawner';
import { EffectManager } from './systems/EffectManager';
import { Collision } from './systems/Collision';
import { HUD } from './ui/HUD';
import { GameOver } from './ui/GameOver';

export class Game {
    private app: Application;
    // private scaleManager!: ScaleManager; // Kept alive by window listeners
    private character!: Character;
    private itemSpawner!: ItemSpawner;
    private effectManager!: EffectManager;
    private hud!: HUD;
    private gameOverScreen!: GameOver;
    private isGameOver: boolean = false;

    constructor() {
        this.app = new Application();
    }

    public async init(): Promise<void> {
        await this.app.init({
            width: GameConfig.width,
            height: GameConfig.height,
            backgroundColor: GameConfig.backgroundColor,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        // Add canvas to the DOM
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.appendChild(this.app.canvas);
        } else {
            console.error('App container not found!');
            document.body.appendChild(this.app.canvas);
        }

        // Initialize systems
        new ScaleManager(this.app);
        InputManager.init(this.app);
        this.effectManager = new EffectManager();

        await AssetLoader.loadAssets();

        // Create character
        this.character = new Character();
        this.app.stage.addChild(this.character);

        // Create Item Spawner
        this.itemSpawner = new ItemSpawner(this.app);
        // Re-add character to be on top if needed, or use zIndex
        this.app.stage.addChild(this.character); // Ensure character is on top

        // UI
        this.hud = new HUD();
        this.app.stage.addChild(this.hud);

        this.gameOverScreen = new GameOver();
        this.gameOverScreen.onRestart = this.restartGame.bind(this);
        this.app.stage.addChild(this.gameOverScreen);

        // Start game loop
        this.app.ticker.add(this.update.bind(this));

        console.log('Game initialized!');
    }

    private update(ticker: any): void {
        if (this.isGameOver) return;

        const delta = ticker.deltaTime;
        const input = InputManager.getInstance();
        const dir = input.getDirection();

        // Debug info
        this.hud.debugText.text = `Keys: ${JSON.stringify(input.getKeyCodes())}\nDir: ${dir.x}, ${dir.y}`;

        this.character.update(delta);
        this.itemSpawner.update(delta);

        // Check collisions
        const items = this.itemSpawner.getItems();
        for (const item of items) {
            if (item.active) {
                // Character radius ~30, Item ~20
                if (Collision.check(this.character, item, 30, 20)) {
                    this.handleCollection(item);
                }
            }
        }
    }

    private handleCollection(item: any): void {
        this.effectManager.applyEffect(item.itemType);
        item.deactivate();
        this.hud.updateScore(this.effectManager.getScore());
    }

    private restartGame(): void {
        this.isGameOver = false;
        this.gameOverScreen.hide();
        this.effectManager.score = 0;
        this.hud.updateScore(0);
        // Reset items?
    }
}
