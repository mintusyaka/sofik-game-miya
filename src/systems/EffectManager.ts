
import type { ItemType } from '../entities/Item';

export class EffectManager {
    public score: number = 0;

    public applyEffect(type: ItemType): { scoreDelta: number, effect?: string } {
        if (type === 'GOOD') {
            this.score += 10;
            return { scoreDelta: 10 };
        } else if (type === 'BAD') {
            this.score -= 5;
            if (this.score < 0) this.score = 0;
            return { scoreDelta: -5, effect: 'SLOW' };
        } else if (type === 'FREEZE') {
            // Freeze doesn't change score, but triggers effect
            return { scoreDelta: 0, effect: 'FREEZE' };
        }
        return { scoreDelta: 0 };
    }

    public getScore(): number {
        return this.score;
    }
}
