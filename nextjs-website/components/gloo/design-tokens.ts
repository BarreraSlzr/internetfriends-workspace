/**
 * Gloo Design Token System
 * A non-technical interface for describing and saving WebGL background effects
 */

export interface GlooDesignToken {
  // Unique identifier for this combination
  token: string;
  
  // Human-readable description
  description: {
    mood: 'elegant' | 'energetic' | 'calm' | 'dramatic' | 'playful';
    intensity: 'subtle' | 'moderate' | 'bold';
    movement: 'gentle' | 'flowing' | 'dynamic' | 'pulsing';
    colors: 'warm' | 'cool' | 'vibrant' | 'muted' | 'monochrome';
  };
  
  // Technical parameters (hidden from designers)
  params: {
    speed: number;
    resolution: number;
    depth: number;
    seed: number;
    color1: number[];
    color2: number[];
    color3: number[];
    effectName: string;
  };
  
  // Usage metadata
  metadata: {
    createdAt: string;
    liked: boolean;
    usageCount: number;
    tags: string[];
    context: 'hero' | 'card' | 'background' | 'accent';
  };
}

// Design-friendly presets
export const GLOO_DESIGN_PRESETS: Record<string, Partial<GlooDesignToken['description']>> = {
  'corporate-elegant': {
    mood: 'elegant',
    intensity: 'subtle',
    movement: 'gentle',
    colors: 'cool'
  },
  'startup-energy': {
    mood: 'energetic',
    intensity: 'bold',
    movement: 'dynamic',
    colors: 'vibrant'
  },
  'portfolio-artistic': {
    mood: 'dramatic',
    intensity: 'moderate',
    movement: 'flowing',
    colors: 'warm'
  },
  'landing-friendly': {
    mood: 'playful',
    intensity: 'moderate',
    movement: 'pulsing',
    colors: 'vibrant'
  }
};

// Generate design descriptions automatically
export function describeGlooEffect(params: GlooDesignToken['params']): GlooDesignToken['description'] {
  const { speed, depth, color1, color2, color3 } = params;
  
  // Analyze mood from speed
  const mood = speed < 0.2 ? 'elegant' : 
               speed < 0.35 ? 'calm' : 
               speed < 0.45 ? 'energetic' : 'dramatic';
  
  // Analyze intensity from depth and color vibrancy
  const colorVibrancy = (color1[0] + color1[1] + color1[2]) / 3;
  const intensity = depth === 1 ? 'subtle' :
                   depth <= 2 && colorVibrancy < 0.6 ? 'moderate' : 'bold';
  
  // Analyze movement from speed and effect
  const movement = speed < 0.25 ? 'gentle' :
                  speed < 0.4 ? 'flowing' : 
                  speed < 0.5 ? 'dynamic' : 'pulsing';
  
  // Analyze color temperature
  const warmth = (color1[0] + color2[0] + color3[0]) / 3;
  const coolness = (color1[2] + color2[2] + color3[2]) / 3;
  const saturation = Math.max(...color1, ...color2, ...color3);
  
  const colors = saturation > 0.8 ? 'vibrant' :
                warmth > coolness ? 'warm' :
                coolness > warmth ? 'cool' : 'muted';
  
  return { mood, intensity, movement, colors };
}

// Generate shareable tokens
export function generateGlooToken(params: GlooDesignToken['params']): string {
  // Create a short, shareable token like "elegant-cool-gentle-A7K9"
  const description = describeGlooEffect(params);
  const hash = btoa(JSON.stringify(params)).slice(0, 4);
  return `${description.mood}-${description.colors}-${description.movement}-${hash}`;
}

// Parse token back to parameters
export function parseGlooToken(token: string): GlooDesignToken | null {
  try {
    // Implementation would decode the token back to parameters
    // This is a simplified version
    return null; // Would return full token object
  } catch {
    return null;
  }
}