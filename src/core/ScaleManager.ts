
import { Application } from 'pixi.js';
import { GameConfig } from '../config/GameConfig';

export class ScaleManager {
    private app: Application;

    constructor(app: Application) {
        this.app = app;
        window.addEventListener('resize', this.resize.bind(this));
        this.resize();
    }

    public resize(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calculate the scale to fit the window while maintaining aspect ratio
        const scaleX = windowWidth / GameConfig.width;
        const scaleY = windowHeight / GameConfig.height;
        const scale = Math.min(scaleX, scaleY);

        // Update canvas size
        const newWidth = Math.floor(GameConfig.width * scale);
        const newHeight = Math.floor(GameConfig.height * scale);

        this.app.canvas.style.width = `${newWidth}px`;
        this.app.canvas.style.height = `${newHeight}px`;

        // Center the canvas
        this.app.canvas.style.position = 'absolute';
        this.app.canvas.style.left = `${(windowWidth - newWidth) / 2}px`;
        this.app.canvas.style.top = `${(windowHeight - newHeight) / 2}px`;
    }
}
