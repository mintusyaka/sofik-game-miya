
import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { GameConfig } from '../config/GameConfig';

export class VictoryScreen extends Container {
    private background: Graphics;
    private messageText: Text;
    private subText: Text;

    // Callback for restart
    public onRestart?: () => void;

    constructor() {
        super();
        this.visible = false;

        this.background = new Graphics();
        this.background.rect(0, 0, GameConfig.width, GameConfig.height);
        this.background.fill({ color: 0x4a1850, alpha: 0.9 }); // Deep purple background
        this.addChild(this.background);
        // Cache static background for performance
        this.background.cacheAsBitmap = true;

        const titleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 40,
            fontWeight: 'bold',
            fill: '#FFD700', // Gold
            align: 'center',
            dropShadow: {
                color: '#000000',
                blur: 4,
                angle: Math.PI / 6,
                distance: 6,
            },
            wordWrap: true,
            wordWrapWidth: GameConfig.width - 40
        });

        this.messageText = new Text({ text: "Вітаємо!\nВи розблокували значок\n\"Сила чарівності!\"", style: titleStyle });
        this.messageText.anchor.set(0.5);
        this.messageText.x = GameConfig.width / 2;
        this.messageText.y = GameConfig.height / 2 - 50;
        this.addChild(this.messageText);

        const subStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 30,
            fill: '#ffffff',
            align: 'center'
        });

        this.subText = new Text({ text: "Натисніть щоб грати знову", style: subStyle });
        this.subText.anchor.set(0.5);
        this.subText.x = GameConfig.width / 2;
        this.subText.y = GameConfig.height / 2 + 100;
        this.addChild(this.subText);

        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.on('pointerdown', () => {
            if (this.onRestart) this.onRestart();
        });
    }

    public show(): void {
        this.visible = true;
    }

    public hide(): void {
        this.visible = false;
    }
}
