
export const GameConfig = {
    width: 600, // Logical width
    height: 1066, // 9:16 aspect ratio
    backgroundColor: 0x87CEEB, // Sky blue
    timeScale: 1.0,
    gravity: 0.5,
    minSpeed: 4, // Item fall speed min
    maxSpeed: 8, // Item fall speed max

    // Debug
    debug: false, // Set to true for dev logging

    // Performance
    usePixelCollision: true, // Set to false for faster AABB-only collision
    maxResolution: 2, // Cap device pixel ratio
    antialias: false, // Disable for performance

    // Character Movement Config
    mobileLerp: 0.04, // Lower = smoother/slower follow

    // PC Physics Config
    pcAcceleration: 0.8,
    pcFriction: 0.92,
    pcMaxSpeed: 12,

    // Item Config
    itemDrift: 3,
    itemWaveAmplitude: 50, // How wide the wave is
    itemWaveFrequency: 0.05, // How fast it undulates
};
