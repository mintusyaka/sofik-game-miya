
import { PixelCollision } from './PixelCollision';
import { GameConfig } from '../config/GameConfig';

export class Collision {
    // AABB (Square) Collision with Shrink/Padding
    // Shrink the bounding box slightly to make collision feel 'fairer' (closer to visual sprite center)
    // Upgraded to Pixel Perfect if Sprites are available and enabled
    public static check(a: any, b: any): boolean {
        // Try Pixel Perfect first if enabled and both support it
        if (GameConfig.usePixelCollision && a.getHitSprite && b.getHitSprite) {
            const spriteA = a.getHitSprite();
            const spriteB = b.getHitSprite();

            if (spriteA && spriteB) {
                // Delegate to PixelCollision
                return PixelCollision.check(spriteA, spriteB);
            }
        }

        // Fallback to simple AABB if one is a shape/container without sprite
        const boundsA = a.getBounds();
        const boundsB = b.getBounds();

        const paddingA = boundsA.width * 0.2; // 20% shrinking
        const paddingB = boundsB.width * 0.2;

        return (
            boundsA.x + paddingA < boundsB.x + boundsB.width - paddingB &&
            boundsA.x + boundsA.width - paddingA > boundsB.x + paddingB &&
            boundsA.y + paddingA < boundsB.y + boundsB.height - paddingB &&
            boundsA.y + boundsA.height - paddingA > boundsB.y + paddingB
        );
    }
}

