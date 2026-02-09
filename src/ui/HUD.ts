
import { Container, Text, TextStyle } from 'pixi.js';

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

        this.scoreText = new Text({ text: 'Score: 0', style });
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
        this.scoreText.text = `Score: ${score}`;
    }
}
