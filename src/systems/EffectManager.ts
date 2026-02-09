
import type { ItemType } from '../entities/Item';

export class EffectManager {
    public score: number = 0;

    public applyEffect(type: ItemType): void {
        if (type === 'GOOD') {
            this.score += 10;
            console.log("Collected GOOD! Score:", this.score);
        } else {
            this.score -= 5;
            if (this.score < 0) this.score = 0;
            console.log("Hit BAD! Score:", this.score);

            // Trigger visual feedback (shake, flash, etc) - todo
        }
    }

    public getScore(): number {
        return this.score;
    }
}
