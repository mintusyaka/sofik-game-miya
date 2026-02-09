
export const GameConfig = {
    width: 600, // Logical width
    height: 1066, // 9:16 aspect ratio
    backgroundColor: 0x87CEEB, // Sky blue
    timeScale: 1.0,
    gravity: 0.5,
    minSpeed: 4, // Item fall speed min
    maxSpeed: 8, // Item fall speed max

    // Character Movement Config
    mobileLerp: 0.04, // Lower = smoother/slower follow

    // PC Physics Config
    pcAcceleration: 0.8,
    pcFriction: 0.92,
    pcMaxSpeed: 12,
};
