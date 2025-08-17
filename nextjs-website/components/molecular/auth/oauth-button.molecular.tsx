/**
 * OAuth Button Molecular - Inspired by session repository patterns
 * Enhanced with Octopus.do flat design principles
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import styles from './oauth-button.styles.module.scss';

interface OAuthButtonProps {
  provider: 'google' | 'github' | 'discord' | 'twitter';
  mode?: 'login' | 'register';
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: '🔍', // Will be replaced with proper icon
    bgColor: '#4285f4',
    textColor: '#ffffff',
  },
  github: {
    name: 'GitHub', 
    icon: '💻',
    bgColor: '#333333',
    textColor: '#ffffff',
  },
  discord: {
    name: 'Discord',
    icon: '🎮', 
    bgColor: '#5865f2',
    textColor: '#ffffff',
  },
  twitter: {
    name: 'Twitter',
    icon: '🐦',
    bgColor: '#1da1f2',
    textColor: '#ffffff',
  },
};

export const OAuthButtonMolecular: React.FC<OAuthButtonProps> = ({
  provider,
  mode = 'login',
  className = '',
  disabled = false,
  isLoading = false,
  onClick,
  onStart,
  onSuccess,
  onError,
}) => {
  const config = providerConfig[provider];
  
  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    try {
      onStart?.();
      onClick?.();
      
      // Simulated OAuth flow - replace with actual implementation
      // const result = await authenticateWithOAuth(provider, mode);
      // onSuccess?.();
      
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  return (
    <Button
      variant="outline"
      className={`${styles.oauthButton} ${styles[provider]} ${className}`}
      style={{
        '--provider-bg': config.bgColor,
        '--provider-text': config.textColor,
      } as React.CSSProperties}
      disabled={disabled || isLoading}
      onClick={handleClick}
    >
      <span className={styles.icon}>
        {isLoading ? (
          <div className={styles.spinner} />
        ) : (
          config.icon
        )}
      </span>
      
      <span className={styles.text}>
        {mode === 'login' ? 'Sign in' : 'Sign up'} with {config.name}
      </span>
    </Button>
  );
};

export default OAuthButtonMolecular;