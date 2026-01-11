// Scene Presets Library - Topic-specific 3D animations for video lectures
// This creates automatic 3D scenes based on detected lecture topics

import { Drawing3D, Vector3D } from './lectureStorage';

// Scene preset types
export type SceneCategory =
    | 'science'
    | 'math'
    | 'biology'
    | 'chemistry'
    | 'physics'
    | 'technology'
    | 'astronomy'
    | 'geography'
    | 'history'
    | 'generic';

export interface ScenePreset {
    category: SceneCategory;
    name: string;
    description: string;
    drawings3D: Drawing3D[];
    particleType?: 'stars' | 'electrons' | 'data' | 'energy' | 'bubbles' | 'sparkles';
    backgroundColor?: string;
}

// Helper to create orbital motion
const createOrbit = (
    centerX: number,
    centerY: number,
    radius: number,
    speed: number,
    phase: number = 0
): Vector3D => ({
    x: centerX + radius * Math.cos(phase),
    y: centerY + radius * Math.sin(phase),
    z: 0
});

// ============================================================
// SCENE PRESET DEFINITIONS
// ============================================================

// --- ASTRONOMY / SPACE ---
export const solarSystemScene: ScenePreset = {
    category: 'astronomy',
    name: 'Solar System',
    description: 'Animated solar system with orbiting planets',
    particleType: 'stars',
    drawings3D: [
        // Sun at center
        {
            timestamp: 0,
            duration: 1,
            type: 'sphere',
            position: { x: 400, y: 250, z: 0 },
            size: 120,
            color: '#fbbf24',
            rotationSpeed: { x: 0, y: 0.2, z: 0 },
            opacity: 1,
        },
        // Mercury
        {
            timestamp: 0.5,
            duration: 0.8,
            type: 'sphere',
            position: { x: 520, y: 250, z: 0 },
            size: 25,
            color: '#94a3b8',
            rotationSpeed: { x: 0, y: 2.5, z: 0 },
        },
        // Venus
        {
            timestamp: 1,
            duration: 0.8,
            type: 'sphere',
            position: { x: 570, y: 250, z: 0 },
            size: 35,
            color: '#f59e0b',
            rotationSpeed: { x: 0, y: 2, z: 0 },
        },
        // Earth
        {
            timestamp: 1.5,
            duration: 0.8,
            type: 'sphere',
            position: { x: 630, y: 250, z: 0 },
            size: 40,
            color: '#3b82f6',
            rotationSpeed: { x: 0.1, y: 1.5, z: 0 },
        },
        // Mars
        {
            timestamp: 2,
            duration: 0.8,
            type: 'sphere',
            position: { x: 700, y: 250, z: 0 },
            size: 32,
            color: '#ef4444',
            rotationSpeed: { x: 0, y: 1.2, z: 0 },
        },
    ],
};

// --- SCIENCE / ATOMS ---
export const atomScene: ScenePreset = {
    category: 'science',
    name: 'Atomic Structure',
    description: 'Bohr model with nucleus and orbiting electrons',
    particleType: 'electrons',
    drawings3D: [
        // Nucleus (protons + neutrons)
        {
            timestamp: 0,
            duration: 1,
            type: 'sphere',
            position: { x: 400, y: 250, z: 0 },
            size: 80,
            color: '#ef4444',
            rotationSpeed: { x: 0.3, y: 0.3, z: 0 },
        },
        // Electron 1 - orbit ring effect via torus
        {
            timestamp: 0.5,
            duration: 0.8,
            type: 'torus',
            position: { x: 400, y: 250, z: 0 },
            size: 150,
            color: '#60a5fa',
            rotation: { x: 90, y: 0, z: 0 },
            rotationSpeed: { x: 0, y: 0, z: 1 },
            wireframe: true,
            opacity: 0.6,
        },
        // Electron 2 - perpendicular orbit
        {
            timestamp: 0.8,
            duration: 0.8,
            type: 'torus',
            position: { x: 400, y: 250, z: 0 },
            size: 180,
            color: '#a78bfa',
            rotation: { x: 45, y: 45, z: 0 },
            rotationSpeed: { x: 0, y: 0.8, z: 0 },
            wireframe: true,
            opacity: 0.5,
        },
        // Electron sphere (visual)
        {
            timestamp: 1,
            duration: 0.5,
            type: 'sphere',
            position: { x: 550, y: 250, z: 0 },
            size: 20,
            color: '#22c55e',
            rotationSpeed: { x: 0, y: 3, z: 0 },
        },
    ],
};

// --- CHEMISTRY / MOLECULES ---
export const moleculeScene: ScenePreset = {
    category: 'chemistry',
    name: 'Molecular Structure',
    description: 'Water molecule (H2O) with bonds',
    particleType: 'bubbles',
    drawings3D: [
        // Oxygen atom (center)
        {
            timestamp: 0,
            duration: 1,
            type: 'sphere',
            position: { x: 400, y: 250, z: 0 },
            size: 80,
            color: '#ef4444',
            rotationSpeed: { x: 0.2, y: 0.3, z: 0 },
        },
        // Hydrogen 1
        {
            timestamp: 0.5,
            duration: 0.8,
            type: 'sphere',
            position: { x: 300, y: 320, z: 0 },
            size: 50,
            color: '#60a5fa',
            rotationSpeed: { x: 0.3, y: 0.2, z: 0 },
        },
        // Hydrogen 2
        {
            timestamp: 0.8,
            duration: 0.8,
            type: 'sphere',
            position: { x: 500, y: 320, z: 0 },
            size: 50,
            color: '#60a5fa',
            rotationSpeed: { x: 0.3, y: 0.2, z: 0 },
        },
        // Bond 1 (cylinder)
        {
            timestamp: 1.2,
            duration: 0.5,
            type: 'cylinder',
            position: { x: 350, y: 285, z: 0 },
            size: 40,
            color: '#94a3b8',
            rotation: { x: 0, y: 0, z: 45 },
            opacity: 0.7,
        },
        // Bond 2 (cylinder)
        {
            timestamp: 1.4,
            duration: 0.5,
            type: 'cylinder',
            position: { x: 450, y: 285, z: 0 },
            size: 40,
            color: '#94a3b8',
            rotation: { x: 0, y: 0, z: -45 },
            opacity: 0.7,
        },
    ],
};

// --- BIOLOGY / DNA ---
export const dnaScene: ScenePreset = {
    category: 'biology',
    name: 'DNA Helix',
    description: 'Double helix structure',
    particleType: 'sparkles',
    drawings3D: [
        // Helix backbone 1
        {
            timestamp: 0,
            duration: 1,
            type: 'torus',
            position: { x: 400, y: 200, z: 0 },
            size: 100,
            color: '#3b82f6',
            rotation: { x: 90, y: 0, z: 0 },
            rotationSpeed: { x: 0, y: 1, z: 0 },
            wireframe: true,
        },
        // Helix backbone 2
        {
            timestamp: 0.3,
            duration: 1,
            type: 'torus',
            position: { x: 400, y: 300, z: 0 },
            size: 100,
            color: '#ef4444',
            rotation: { x: 90, y: 45, z: 0 },
            rotationSpeed: { x: 0, y: 1, z: 0 },
            wireframe: true,
        },
        // Base pair spheres
        {
            timestamp: 0.8,
            duration: 0.5,
            type: 'sphere',
            position: { x: 350, y: 250, z: 0 },
            size: 30,
            color: '#22c55e',
            rotationSpeed: { x: 0, y: 1, z: 0 },
        },
        {
            timestamp: 1,
            duration: 0.5,
            type: 'sphere',
            position: { x: 450, y: 250, z: 0 },
            size: 30,
            color: '#fbbf24',
            rotationSpeed: { x: 0, y: 1, z: 0 },
        },
    ],
};

// --- MATH / GEOMETRY ---
export const geometryScene: ScenePreset = {
    category: 'math',
    name: 'Geometric Shapes',
    description: 'Platonic solids and transformations',
    particleType: 'sparkles',
    drawings3D: [
        // Rotating cube
        {
            timestamp: 0,
            duration: 1,
            type: 'cube',
            position: { x: 250, y: 200, z: 0 },
            size: 80,
            color: '#60a5fa',
            rotationSpeed: { x: 0.5, y: 0.5, z: 0 },
            wireframe: true,
        },
        // Pyramid
        {
            timestamp: 0.5,
            duration: 1,
            type: 'pyramid',
            position: { x: 400, y: 200, z: 0 },
            size: 90,
            color: '#fbbf24',
            rotationSpeed: { x: 0.3, y: 0.6, z: 0 },
        },
        // Sphere
        {
            timestamp: 1,
            duration: 1,
            type: 'sphere',
            position: { x: 550, y: 200, z: 0 },
            size: 70,
            color: '#22c55e',
            rotationSpeed: { x: 0.4, y: 0.4, z: 0 },
            wireframe: true,
        },
        // Torus
        {
            timestamp: 1.5,
            duration: 1,
            type: 'torus',
            position: { x: 400, y: 350, z: 0 },
            size: 80,
            color: '#a78bfa',
            rotationSpeed: { x: 0.3, y: 0.5, z: 0.2 },
        },
    ],
};

// --- PHYSICS / WAVES ---
export const waveScene: ScenePreset = {
    category: 'physics',
    name: 'Wave Motion',
    description: 'Oscillating wave patterns',
    particleType: 'energy',
    drawings3D: [
        // Wave particles (spheres in wave pattern)
        ...Array.from({ length: 8 }, (_, i) => ({
            timestamp: i * 0.2,
            duration: 0.5,
            type: 'sphere' as const,
            position: { x: 150 + i * 80, y: 250 + Math.sin(i * 0.8) * 50, z: 0 },
            size: 35,
            color: i % 2 === 0 ? '#60a5fa' : '#a78bfa',
            rotationSpeed: { x: 0, y: 1 + i * 0.1, z: 0 },
        })),
    ],
};

// --- TECHNOLOGY / NEURAL NETWORK ---
export const neuralNetworkScene: ScenePreset = {
    category: 'technology',
    name: 'Neural Network',
    description: 'Interconnected nodes representing AI',
    particleType: 'data',
    drawings3D: [
        // Input layer
        {
            timestamp: 0,
            duration: 0.5,
            type: 'sphere',
            position: { x: 200, y: 150, z: 0 },
            size: 40,
            color: '#60a5fa',
            rotationSpeed: { x: 0, y: 0.5, z: 0 },
        },
        {
            timestamp: 0.2,
            duration: 0.5,
            type: 'sphere',
            position: { x: 200, y: 250, z: 0 },
            size: 40,
            color: '#60a5fa',
            rotationSpeed: { x: 0, y: 0.5, z: 0 },
        },
        {
            timestamp: 0.4,
            duration: 0.5,
            type: 'sphere',
            position: { x: 200, y: 350, z: 0 },
            size: 40,
            color: '#60a5fa',
            rotationSpeed: { x: 0, y: 0.5, z: 0 },
        },
        // Hidden layer
        {
            timestamp: 0.8,
            duration: 0.5,
            type: 'sphere',
            position: { x: 400, y: 180, z: 0 },
            size: 45,
            color: '#a78bfa',
            rotationSpeed: { x: 0.3, y: 0.3, z: 0 },
        },
        {
            timestamp: 1,
            duration: 0.5,
            type: 'sphere',
            position: { x: 400, y: 320, z: 0 },
            size: 45,
            color: '#a78bfa',
            rotationSpeed: { x: 0.3, y: 0.3, z: 0 },
        },
        // Output layer
        {
            timestamp: 1.4,
            duration: 0.5,
            type: 'sphere',
            position: { x: 600, y: 250, z: 0 },
            size: 50,
            color: '#22c55e',
            rotationSpeed: { x: 0, y: 0.8, z: 0 },
        },
    ],
};

// --- GENERIC / KNOWLEDGE ---
export const genericScene: ScenePreset = {
    category: 'generic',
    name: 'Knowledge Cubes',
    description: 'Abstract floating cubes representing ideas',
    particleType: 'sparkles',
    drawings3D: [
        {
            timestamp: 0,
            duration: 1,
            type: 'cube',
            position: { x: 300, y: 200, z: 0 },
            size: 70,
            color: '#60a5fa',
            rotationSpeed: { x: 0.4, y: 0.4, z: 0 },
        },
        {
            timestamp: 0.5,
            duration: 1,
            type: 'cube',
            position: { x: 500, y: 200, z: 0 },
            size: 60,
            color: '#a78bfa',
            rotationSpeed: { x: 0.3, y: 0.5, z: 0.1 },
        },
        {
            timestamp: 1,
            duration: 1,
            type: 'cube',
            position: { x: 400, y: 320, z: 0 },
            size: 80,
            color: '#22c55e',
            rotationSpeed: { x: 0.5, y: 0.3, z: 0.2 },
        },
        {
            timestamp: 1.5,
            duration: 0.8,
            type: 'sphere',
            position: { x: 400, y: 200, z: 1 },
            size: 40,
            color: '#fbbf24',
            rotationSpeed: { x: 0.2, y: 0.6, z: 0 },
        },
    ],
};

// --- GEOGRAPHY / EARTH ---
export const earthScene: ScenePreset = {
    category: 'geography',
    name: 'Planet Earth',
    description: 'Rotating globe',
    particleType: 'stars',
    drawings3D: [
        // Earth
        {
            timestamp: 0,
            duration: 1.5,
            type: 'sphere',
            position: { x: 400, y: 250, z: 0 },
            size: 180,
            color: '#3b82f6',
            rotationSpeed: { x: 0.05, y: 0.3, z: 0 },
        },
        // Moon
        {
            timestamp: 1,
            duration: 1,
            type: 'sphere',
            position: { x: 580, y: 180, z: 0 },
            size: 40,
            color: '#94a3b8',
            rotationSpeed: { x: 0, y: 0.8, z: 0 },
        },
    ],
};

// --- HISTORY ---
export const historyScene: ScenePreset = {
    category: 'history',
    name: 'Timeline Cubes',
    description: 'Abstract representation of historical events',
    particleType: 'sparkles',
    drawings3D: [
        // Timeline blocks
        ...Array.from({ length: 5 }, (_, i) => ({
            timestamp: i * 0.4,
            duration: 0.8,
            type: 'cube' as const,
            position: { x: 150 + i * 130, y: 250, z: 0 },
            size: 60,
            color: ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a78bfa'][i],
            rotationSpeed: { x: 0.2, y: 0.3 + i * 0.1, z: 0 },
        })),
    ],
};

// ============================================================
// SCENE REGISTRY
// ============================================================

export const scenePresets: Record<SceneCategory, ScenePreset> = {
    astronomy: solarSystemScene,
    science: atomScene,
    chemistry: moleculeScene,
    biology: dnaScene,
    math: geometryScene,
    physics: waveScene,
    technology: neuralNetworkScene,
    geography: earthScene,
    history: historyScene,
    generic: genericScene,
};

// ============================================================
// TOPIC DETECTION
// ============================================================

const topicKeywords: Record<SceneCategory, string[]> = {
    astronomy: [
        'solar system', 'planet', 'sun', 'moon', 'star', 'galaxy', 'universe',
        'orbit', 'space', 'astronomy', 'celestial', 'cosmos', 'satellite',
        'black hole', 'nebula', 'comet', 'asteroid', 'mars', 'jupiter', 'earth'
    ],
    science: [
        'atom', 'electron', 'proton', 'neutron', 'nucleus', 'particle',
        'quantum', 'atomic', 'subatomic', 'energy level', 'bohr model',
        'radioactive', 'isotope'
    ],
    chemistry: [
        'molecule', 'chemical', 'bond', 'compound', 'element', 'reaction',
        'periodic table', 'acid', 'base', 'organic', 'inorganic', 'polymer',
        'oxidation', 'h2o', 'water molecule', 'covalent', 'ionic'
    ],
    biology: [
        'dna', 'cell', 'gene', 'protein', 'rna', 'chromosome', 'mitosis',
        'organism', 'evolution', 'photosynthesis', 'respiration', 'enzyme',
        'bacteria', 'virus', 'anatomy', 'organ', 'tissue', 'helix'
    ],
    physics: [
        'wave', 'force', 'energy', 'motion', 'gravity', 'momentum', 'velocity',
        'acceleration', 'friction', 'thermodynamics', 'electricity', 'magnetism',
        'oscillation', 'frequency', 'amplitude', 'pendulum', 'newton'
    ],
    technology: [
        'ai', 'artificial intelligence', 'machine learning', 'neural network',
        'algorithm', 'computer', 'programming', 'code', 'software', 'hardware',
        'data', 'deep learning', 'robot', 'automation', 'blockchain', 'cloud'
    ],
    geography: [
        'earth', 'continent', 'ocean', 'mountain', 'river', 'climate',
        'weather', 'geography', 'map', 'country', 'region', 'terrain',
        'ecosystem', 'environment', 'tectonic', 'volcano', 'globe'
    ],
    history: [
        'history', 'civilization', 'war', 'empire', 'revolution', 'ancient',
        'medieval', 'century', 'era', 'dynasty', 'kingdom', 'historical',
        'archaeology', 'cultural', 'timeline'
    ],
    math: [
        'geometry', 'algebra', 'calculus', 'equation', 'function', 'graph',
        'triangle', 'circle', 'polygon', 'theorem', 'pythagorean', 'formula',
        'variable', 'integral', 'derivative', 'matrix', 'vector', 'fractal',
        'coordinate', 'dimension', 'cube', 'sphere', 'pyramid'
    ],
    generic: [],
};

/**
 * Detect the scene category based on topic and content
 */
export function detectSceneCategory(topic: string, content?: string): SceneCategory {
    const searchText = `${topic} ${content || ''}`.toLowerCase();

    let bestMatch: SceneCategory = 'generic';
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(topicKeywords)) {
        if (category === 'generic') continue;

        let score = 0;
        for (const keyword of keywords) {
            if (searchText.includes(keyword)) {
                score += keyword.length; // Longer matches = higher score
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = category as SceneCategory;
        }
    }

    return bestMatch;
}

/**
 * Get the appropriate scene preset for a topic
 */
export function getSceneForTopic(topic: string, content?: string): ScenePreset {
    const category = detectSceneCategory(topic, content);
    return scenePresets[category];
}

/**
 * Get drawings3D for a slide based on topic detection
 */
export function getAutoDrawings3D(topic: string, slideIndex: number, totalSlides: number): Drawing3D[] {
    const scene = getSceneForTopic(topic);

    // Adjust timestamps based on slide position
    const baseDelay = slideIndex === 0 ? 0 : 0.5;

    return scene.drawings3D.map(drawing => ({
        ...drawing,
        timestamp: drawing.timestamp + baseDelay,
    }));
}

/**
 * Get particle type for a topic
 */
export function getParticleTypeForTopic(topic: string): ScenePreset['particleType'] {
    const scene = getSceneForTopic(topic);
    return scene.particleType || 'sparkles';
}
