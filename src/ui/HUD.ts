
import { Container, Text, TextStyle } from 'pixi.js';
import { GameConfig } from '../config/GameConfig';

export class HUD extends Container {
    private scoreText: Text;
    public debugText: Text;

    constructor() {
        super();

        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontWeight: 'bold',
            fill: '#ffffff',
            stroke: { color: '#4a1850', width: 5 },
            dropShadow: {
                color: '#000000',
                blur: 4,
                angle: Math.PI / 6,
                distance: 6,
            },
        });

        this.scoreText = new Text({ text: 'Score: 0 / 300', style });
        this.scoreText.x = 20;
        this.scoreText.y = 20;

        const debugStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 20,
            fill: '#ff0000',
        });
        this.debugText = new Text({ text: '', style: debugStyle });
        this.debugText.x = 20;
        this.debugText.y = 80;

        this.addChild(this.scoreText);
        this.addChild(this.debugText);
    }

    public updateScore(score: number): void {
        this.scoreText.text = `Score: ${score} / 300`;
    }

    private freezeText: Text | null = null;

    public showFreezeTimer(seconds: number): void {
        if (!this.freezeText) {
            const style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: 48,
                fontWeight: 'bold',
                fill: '#00FFFF',
                stroke: { color: '#000000', width: 5 },
                dropShadow: {
                    color: '#000000',
                    blur: 4,
                    angle: Math.PI / 6,
                    distance: 6,
                },
            });
            this.freezeText = new Text({ text: '', style });
            this.freezeText.anchor.set(0.5);
            this.freezeText.x = GameConfig.width / 2;
            this.freezeText.y = 150; // Lowered slightly
            this.addChild(this.freezeText);
        }
        this.freezeText.text = `FREEZE: ${seconds.toFixed(1)}s`;
        this.freezeText.visible = true;
    }

    public updateFreezeTimer(seconds: number): void {
        if (this.freezeText) {
            this.freezeText.text = `FREEZE: ${seconds.toFixed(1)}s`;
        }
    }

    public hideFreezeTimer(): void {
        if (this.freezeText) {
            this.freezeText.visible = false;
        }
    }
    private slowText: Text | null = null;

    public showSlowTimer(seconds: number): void {
        if (!this.slowText) {
            const style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: 48,
                fontWeight: 'bold',
                fill: '#FF0000', // Red
                stroke: { color: '#000000', width: 5 },
                dropShadow: {
                    color: '#000000',
                    blur: 4,
                    angle: Math.PI / 6,
                    distance: 6,
                },
            });
            this.slowText = new Text({ text: '', style });
            this.slowText.anchor.set(0.5);
            this.slowText.x = GameConfig.width / 2;
            this.slowText.y = 220; // Lowered below Freeze timer
            this.addChild(this.slowText);
        }
        this.slowText.text = `SLOW: ${seconds.toFixed(1)}s`;
        this.slowText.visible = true;
    }

    public updateSlowTimer(seconds: number): void {
        if (this.slowText) {
            this.slowText.text = `SLOW: ${seconds.toFixed(1)}s`;
        }
    }

    public hideSlowTimer(): void {
        if (this.slowText) {
            this.slowText.visible = false;
        }
    }
}
