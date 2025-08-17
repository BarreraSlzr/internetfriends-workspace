'use client'

import { useState, useCallback, useEffect } from 'react';
import { Heart, Share2, RotateCcw, Bookmark } from 'lucide-react';
import { GlooDesignToken, describeGlooEffect, generateGlooToken } from './design-tokens';

interface GlooControlsProps {
  currentParams: {
    speed: number;
    resolution: number;
    depth: number;
    seed: number;
    color1: number[];
    color2: number[];
    color3: number[];
    effectName: string;
  };
  onRegenerate: () => void;
  onLoadToken?: (token: string) => void;
  context?: 'hero' | 'card' | 'background' | 'accent';
}

export function GlooControls({ 
  currentParams, 
  onRegenerate, 
  onLoadToken,
  context = 'background' 
}: GlooControlsProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentToken, setCurrentToken] = useState<string>('');
  const [description, setDescription] = useState<GlooDesignToken['description']>();

  // Update description when parameters change
  useEffect(() => {
    const desc = describeGlooEffect(currentParams);
    const token = generateGlooToken(currentParams);
    setDescription(desc);
    setCurrentToken(token);
    
    // Check if this combination is already liked/saved
    const savedEffects = JSON.parse(localStorage.getItem('gloo-liked-effects') || '[]');
    setLiked(savedEffects.includes(token));
    
    const bookmarkedEffects = JSON.parse(localStorage.getItem('gloo-saved-effects') || '[]');
    setSaved(bookmarkedEffects.includes(token));
  }, [currentParams]);

  const handleLike = useCallback(() => {
    const savedEffects = JSON.parse(localStorage.getItem('gloo-liked-effects') || '[]');
    
    if (liked) {
      // Remove like
      const updated = savedEffects.filter((token: string) => token !== currentToken);
      localStorage.setItem('gloo-liked-effects', JSON.stringify(updated));
      setLiked(false);
    } else {
      // Add like
      const updated = [...savedEffects, currentToken];
      localStorage.setItem('gloo-liked-effects', JSON.stringify(updated));
      
      // Also save the full effect data
      const effectData: GlooDesignToken = {
        token: currentToken,
        description: description!,
        params: currentParams,
        metadata: {
          createdAt: new Date().toISOString(),
          liked: true,
          usageCount: 1,
          tags: [description?.mood || '', description?.colors || ''],
          context
        }
      };
      
      const allEffects = JSON.parse(localStorage.getItem('gloo-effect-library') || '{}');
      allEffects[currentToken] = effectData;
      localStorage.setItem('gloo-effect-library', JSON.stringify(allEffects));
      
      setLiked(true);
    }
  }, [liked, currentToken, description, currentParams, context]);

  const handleSave = useCallback(() => {
    const bookmarkedEffects = JSON.parse(localStorage.getItem('gloo-saved-effects') || '[]');
    
    if (saved) {
      const updated = bookmarkedEffects.filter((token: string) => token !== currentToken);
      localStorage.setItem('gloo-saved-effects', JSON.stringify(updated));
      setSaved(false);
    } else {
      const updated = [...bookmarkedEffects, currentToken];
      localStorage.setItem('gloo-saved-effects', JSON.stringify(updated));
      setSaved(true);
    }
  }, [saved, currentToken]);

  const handleShare = useCallback(() => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?gloo=${currentToken}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${description?.mood} ${description?.colors} Gloo Effect`,
        text: `Check out this ${description?.intensity} ${description?.movement} background effect!`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      // You could show a toast notification here
      console.log('Gloo effect URL copied to clipboard:', shareUrl);
    }
  }, [currentToken, description]);

  if (!description) return null;

  return (
    <div className="absolute top-4 right-4 z-20 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border shadow-lg">
      {/* Effect Description */}
      <div className="text-xs text-muted-foreground mb-3 space-y-1">
        <div className="font-medium text-foreground">
          {description.mood.charAt(0).toUpperCase() + description.mood.slice(1)} • {description.colors}
        </div>
        <div>
          {description.intensity} intensity • {description.movement} movement
        </div>
        <div className="font-mono text-xs opacity-60">
          #{currentToken}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleLike}
          className={`p-2 rounded-md transition-colors ${
            liked 
              ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
          }`}
          title={liked ? 'Unlike this effect' : 'Like this effect'}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
        </button>
        
        <button
          onClick={handleSave}
          className={`p-2 rounded-md transition-colors ${
            saved 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
              : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
          }`}
          title={saved ? 'Remove bookmark' : 'Bookmark this effect'}
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>
        
        <button
          onClick={handleShare}
          className="p-2 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          title="Share this effect"
        >
          <Share2 className="h-4 w-4" />
        </button>
        
        <button
          onClick={onRegenerate}
          className="p-2 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          title="Generate new random effect"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}