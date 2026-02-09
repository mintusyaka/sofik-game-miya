
import { Container } from 'pixi.js';

export class Collision {
    // Simple circle collision
    public static check(a: Container, b: Container, radiusA: number, radiusB: number): boolean {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < (radiusA + radiusB);
    }
}
