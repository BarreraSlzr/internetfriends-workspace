/**
 * Auth Card Organism - Octopus.do inspired authentication interface
 * Combines session repository patterns with modern flat design
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './auth-card.styles.module.scss';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  mode?: 'login' | 'register' | 'reset';
  isLoading?: boolean;
  className?: string;
}

export const AuthCardOrganism: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
  footer,
  mode = 'login',
  isLoading = false,
  className = '',
}) => {
  return (
    <div className={`${styles.authContainer} ${className}`}>
      <Card className={styles.authCard}>
        {/* Header with Octopus.do inspired design */}
        <div className={styles.authHeader}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          
          {/* Mode indicator badge */}
          <Badge 
            variant={mode === 'login' ? 'default' : 'secondary'}
            className={styles.modeBadge}
          >
            {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Sign Up' : 'Reset'}
          </Badge>
        </div>

        {/* Content area with consistent spacing */}
        <div className={styles.authContent}>
          {children}
        </div>

        {/* Footer with additional actions */}
        {footer && (
          <div className={styles.authFooter}>
            {footer}
          </div>
        )}
        
        {/* Loading overlay */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuthCardOrganism;