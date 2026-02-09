import { Assets } from 'pixi.js';
import { PixelCollision } from '../systems/PixelCollision';

export class AssetLoader {
    public static async loadAssets(): Promise<void> {
        // Load textures
        // We use a manifest or direct loading
        const assets = [
            { alias: 'character', src: 'assets/character.png' }, // Static fallback
            { alias: 'character_1', src: 'assets/character_1.png' },
            { alias: 'character_2', src: 'assets/character_2.png' },
            { alias: 'character_3', src: 'assets/character_3.png' },
            { alias: 'item_good', src: 'assets/item_good.png' },
            { alias: 'item_bad', src: 'assets/item_bad.png' },
            { alias: 'item_freeze', src: 'assets/item_freeze.png' },
        ];

        // Load assets individually to prevent one failure blocking all
        const promises = assets.map(async (asset) => {
            try {
                await Assets.load(asset);
                console.log(`Loaded ${asset.alias}`);
            } catch (e) {
                console.warn(`Failed to load asset: ${asset.alias}`, e);
            }
        });

        await Promise.all(promises);

        // Generate HitMaps for Pixel Collision
        const hitMapAssets = [
            'character', 'character_1', 'character_2', 'character_3',
            'item_good', 'item_bad', 'item_freeze'
        ];

        hitMapAssets.forEach(alias => PixelCollision.generate(alias));
    }
}
