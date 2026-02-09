import { Sprite, Texture, Assets, Point } from 'pixi.js';

interface HitMap {
    width: number;
    height: number;
    data: Uint8ClampedArray;
}

export class PixelCollision {
    private static cache: Map<Texture, HitMap> = new Map();

    /**
     * Pre-generates a hitmap for a given texture alias.
     * Must be called after assets are loaded.
     */
    public static generate(alias: string): void {
        const texture = Assets.get(alias);
        if (!texture) {
            console.warn(`PixelCollision: Texture not found for alias '${alias}'`);
            return;
        }

        // Check if already cached
        if (this.cache.has(texture)) return;

        // We need the base texture source
        const source = texture.source;
        if (!source) return;

        // Create a temporary canvas to draw it
        const canvas = document.createElement('canvas');
        canvas.width = texture.width;
        canvas.height = texture.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        const resource = source.resource;

        try {
            if (resource instanceof Image || resource instanceof HTMLCanvasElement || resource instanceof HTMLVideoElement || resource instanceof ImageBitmap) {
                ctx.drawImage(resource, 0, 0, texture.width, texture.height);
            } else {
                console.warn(`PixelCollision: Could not draw resource for '${alias}'`);
                return;
            }

            const imageData = ctx.getImageData(0, 0, texture.width, texture.height);

            this.cache.set(texture, {
                width: texture.width,
                height: texture.height,
                data: imageData.data
            });
            console.log(`PixelCollision: Generated hitmap for '${alias}'`);

        } catch (e) {
            console.warn(`PixelCollision: Failed to generate hitmap for '${alias}'`, e);
        }
    }

    public static check(spriteA: Sprite, spriteB: Sprite): boolean {
        // 1. Fast AABB Check
        const boundsA = spriteA.getBounds();
        const boundsB = spriteB.getBounds();

        if (
            boundsA.x >= boundsB.x + boundsB.width ||
            boundsA.x + boundsA.width <= boundsB.x ||
            boundsA.y >= boundsB.y + boundsB.height ||
            boundsA.y + boundsA.height <= boundsB.y
        ) {
            return false;
        }

        // 2. Get HitMaps from Textures
        const mapA = this.cache.get(spriteA.texture);
        const mapB = this.cache.get(spriteB.texture);

        if (!mapA || !mapB) {
            // Fallback to strict AABB intersection if hitmaps missing
            return true;
        }

        // 3. Pixel Perfect Check
        // Calculate intersection rectangle in screen space
        const intersectX = Math.max(boundsA.x, boundsB.x);
        const intersectY = Math.max(boundsA.y, boundsB.y);
        const intersectW = Math.min(boundsA.x + boundsA.width, boundsB.x + boundsB.width) - intersectX;
        const intersectH = Math.min(boundsA.y + boundsA.height, boundsB.y + boundsB.height) - intersectY;

        if (intersectW <= 0 || intersectH <= 0) return false;

        // Iterate pixels (checking every 6th pixel for performance, can tune)
        const resolution = 6; // Performance trade-off (higher = faster but less precise)

        const localA = new Point();
        const localB = new Point();

        for (let y = 0; y < intersectH; y += resolution) {
            for (let x = 0; x < intersectW; x += resolution) {
                const globalX = intersectX + x;
                const globalY = intersectY + y;

                // Transform visual point to local Sprite space
                spriteA.toLocal({ x: globalX, y: globalY }, undefined, localA);
                spriteB.toLocal({ x: globalX, y: globalY }, undefined, localB);

                // Calculate Texture Coordinates based on Anchor and Size
                const mapXA = localA.x + (spriteA.anchor.x * mapA.width);
                const mapYA = localA.y + (spriteA.anchor.y * mapA.height);

                const mapXB = localB.x + (spriteB.anchor.x * mapB.width);
                const mapYB = localB.y + (spriteB.anchor.y * mapB.height);

                if (this.getAlpha(mapA, mapXA, mapYA) > 0 && this.getAlpha(mapB, mapXB, mapYB) > 0) {
                    return true;
                }
            }
        }

        return false;
    }

    private static getAlpha(map: HitMap, x: number, y: number): number {
        const ix = Math.floor(x);
        const iy = Math.floor(y);

        if (ix < 0 || ix >= map.width || iy < 0 || iy >= map.height) return 0;

        // Data is RGBA (4 bytes per pixel)
        const index = (iy * map.width + ix) * 4;
        return map.data[index + 3]; // Alpha channel
    }
}
