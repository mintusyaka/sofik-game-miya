
import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { GameConfig } from '../config/GameConfig';

export class GameOver extends Container {
    private background: Graphics;
    private messageText: Text;

    // Callback for restart
    public onRestart?: () => void;

    constructor() {
        super();
        this.visible = false;

        this.background = new Graphics();
        this.background.rect(0, 0, GameConfig.width, GameConfig.height);
        this.background.fill({ color: 0x000000, alpha: 0.8 });
        this.addChild(this.background);
        // Cache static background for performance
        this.background.cacheAsBitmap = true;

        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 50,
            fontWeight: 'bold',
            fill: '#ffffff',
            align: 'center'
        });

        this.messageText = new Text({ text: "GAME OVER\nTap to Restart", style });
        this.messageText.anchor.set(0.5);
        this.messageText.x = GameConfig.width / 2;
        this.messageText.y = GameConfig.height / 2;
        this.addChild(this.messageText);

        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', () => {
            if (this.onRestart) this.onRestart();
        });
    }

    public show(finalScore: number): void {
        this.messageText.text = `GAME OVER\nScore: ${finalScore}\n\nTap to Restart`;
        this.visible = true;
    }

    public hide(): void {
        this.visible = false;
    }
}
