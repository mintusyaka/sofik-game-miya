
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
import { VictoryScreen } from './ui/VictoryScreen';
import { ParticleSystem } from './systems/ParticleSystem';



export class Game {
    private app: Application;
    // private scaleManager!: ScaleManager; // Kept alive by window listeners
    private character!: Character;
    private itemSpawner!: ItemSpawner;
    private effectManager!: EffectManager;
    private hud!: HUD;
    private gameOverScreen!: GameOver;
    private victoryScreen!: VictoryScreen;
    private particleSystem!: ParticleSystem;
    private isGameOver: boolean = false;
    private trailTimer: number = 0;
    private slowTimer: number = 0;

    constructor() {
        this.app = new Application();
    }

    public async init(): Promise<void> {
        await this.app.init({
            width: GameConfig.width,
            height: GameConfig.height,
            backgroundColor: GameConfig.backgroundColor,
            antialias: GameConfig.antialias,
            resolution: Math.min(window.devicePixelRatio || 1, GameConfig.maxResolution),
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

        // Particle System (behind UI but above background game elements if possible, 
        // but here we just add it. If we want it behind character, search insertBefore)
        this.particleSystem = new ParticleSystem();
        this.app.stage.addChildAt(this.particleSystem, this.app.stage.getChildIndex(this.character));

        this.gameOverScreen = new GameOver();
        this.gameOverScreen.onRestart = this.restartGame.bind(this);
        this.app.stage.addChild(this.gameOverScreen);

        this.victoryScreen = new VictoryScreen();
        this.victoryScreen.onRestart = this.restartGame.bind(this);
        this.app.stage.addChild(this.victoryScreen);

        // Start game loop
        this.app.ticker.add(this.update.bind(this));

        // console.log('Game initialized!');
    }

    private update(ticker: any): void {
        if (this.isGameOver) return;

        const delta = ticker.deltaTime;
        // const input = InputManager.getInstance();
        // const dir = input.getDirection();

        // Debug info
        // this.hud.debugText.text = `Keys: ${JSON.stringify(input.getKeyCodes())}\nDir: ${dir.x}, ${dir.y}`;

        this.character.update(delta);
        this.itemSpawner.update(delta);
        this.particleSystem.update(delta);

        // Spawn Trail
        this.trailTimer += delta;
        if (this.trailTimer >= 8) { // Spawn every 8 frames (was 5)
            this.trailTimer = 0;
            // Spawn a bit behind the character ? Or just at center
            // Add some randomness
            this.particleSystem.spawnStar(
                this.character.x + (Math.random() - 0.5) * 20,
                this.character.y + (Math.random() - 0.5) * 20
            );
        }

        // Check collisions
        const items = this.itemSpawner.getItems();
        for (const item of items) {
            if (item.active) {
                // AABB Collision (Square)
                if (Collision.check(this.character, item)) {
                    this.handleCollection(item);
                }
            }
        }

        // Freeze Timer Update
        if (this.itemSpawner.getIsFrozen()) {
            const frames = this.itemSpawner.getFreezeTimer();
            const seconds = Math.ceil(frames / 60 * 10) / 10; // Round to 1 decimal
            this.hud.showFreezeTimer(seconds);
        } else {
            this.hud.hideFreezeTimer();
        }

        // Slow Timer Update
        if (this.slowTimer > 0) {
            this.slowTimer -= delta;
            const seconds = Math.ceil(this.slowTimer / 60 * 10) / 10;
            this.hud.updateSlowTimer(seconds);

            if (this.slowTimer <= 0) {
                this.slowTimer = 0;
                this.character.setSpeedMultiplier(1.0);
                this.hud.hideSlowTimer();
                // console.log("SLOW ENDED");
            }
        }
    }

    private handleCollection(item: any): void {
        const result = this.effectManager.applyEffect(item.itemType);
        item.deactivate();

        const currentScore = this.effectManager.getScore();
        this.hud.updateScore(currentScore);

        if (result.effect === 'FREEZE') {
            // Freeze for 5 seconds (60 fps * 5)
            this.itemSpawner.freezeItems(180);
            // console.log("FREEZE ACTIVATED!");
        }

        // Difficulty Progression
        if (currentScore >= 300) {
            this.victory();
        } else if (currentScore >= 100) {
            this.itemSpawner.setSpawnMultiplier(2);
        } else {
            this.itemSpawner.setSpawnMultiplier(1);
        }

        if (result.effect === 'SLOW') {
            this.character.setSpeedMultiplier(0.5); // Half speed
            this.slowTimer = 120; // 2 seconds at 60fps
            this.hud.showSlowTimer(2.0);
            // console.log("SLOW ACTIVATED!");
        }
    }



    private victory(): void {
        this.isGameOver = true;
        this.victoryScreen.show();
        // console.log("VICTORY!");
    }

    private restartGame(): void {
        this.isGameOver = false;
        this.gameOverScreen.hide();
        this.victoryScreen.hide();
        this.effectManager.score = 0;
        this.hud.updateScore(0);
        this.itemSpawner.setSpawnMultiplier(1);
        // Reset items?
    }
}
