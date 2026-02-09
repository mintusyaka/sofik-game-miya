
import { Application, FederatedPointerEvent, Point } from 'pixi.js';

export class InputManager {
    private static instance: InputManager;
    private app: Application;
    public pointerPosition: Point;
    public isPointerDown: boolean = false;
    public keys: { [key: string]: boolean } = {};

    private constructor(app: Application) {
        this.app = app;
        this.pointerPosition = new Point(app.screen.width / 2, app.screen.height / 2);
        this.setupListeners();
        this.setupKeyboard();
    }

    public static init(app: Application): void {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager(app);
        }
    }

    public static getInstance(): InputManager {
        if (!InputManager.instance) {
            throw new Error("InputManager must be initialized first!");
        }
        return InputManager.instance;
    }

    private setupListeners(): void {
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;

        this.app.stage.on('pointerdown', (e: FederatedPointerEvent) => {
            this.isPointerDown = true;
            this.updatePointerPosition(e);
        });

        this.app.stage.on('pointermove', (e: FederatedPointerEvent) => {
            if (this.isPointerDown) {
                this.updatePointerPosition(e);
            }
        });

        this.app.stage.on('pointerup', () => {
            this.isPointerDown = false;
        });

        this.app.stage.on('pointerupoutside', () => {
            this.isPointerDown = false;
        });
    }

    private setupKeyboard(): void {
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keys[e.key] = false;
        });
    }

    public getKeyCodes(): string[] {
        return Object.keys(this.keys).filter(k => this.keys[k]);
    }

    public getDirection(): Point {
        const dir = new Point(0, 0);
        if (this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['w'] || this.keys['W']) dir.y = -1;
        if (this.keys['ArrowDown'] || this.keys['KeyS'] || this.keys['s'] || this.keys['S']) dir.y = 1;
        if (this.keys['ArrowLeft'] || this.keys['KeyA'] || this.keys['a'] || this.keys['A']) dir.x = -1;
        if (this.keys['ArrowRight'] || this.keys['KeyD'] || this.keys['d'] || this.keys['D']) dir.x = 1;

        return dir;
    }

    private updatePointerPosition(e: FederatedPointerEvent): void {
        // Get global position
        const globalPos = e.global;

        // No need to convert if we are just using global stage coordinates and the stage matches screen
        // But if stage is scaled, we might need conversion. 
        // For this simple setup, global is usually fine if we parent everything to stage/world.
        this.pointerPosition.set(globalPos.x, globalPos.y);
    }
}
