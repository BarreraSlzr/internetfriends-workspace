/**
 * Sticky Header Organism - Octopus.do inspired navigation
 * Implements sticky behavior with glass morphism and flat design
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './sticky-header.styles.module.scss';

interface StickyHeaderProps {
  title?: string;
  showLogo?: boolean;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'minimal' | 'auth';
}

export const StickyHeaderOrganism: React.FC<StickyHeaderProps> = ({
  title = 'InternetFriends',
  showLogo = true,
  actions,
  className = '',
  variant = 'default',
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`
        ${styles.stickyHeader} 
        ${styles[variant]}
        ${isScrolled ? styles.scrolled : ''} 
        ${className}
      `}
    >
      <div className={styles.container}>
        {/* Logo/Brand Section */}
        {showLogo && (
          <div className={styles.brand}>
            <div className={styles.logo}>
              {/* Placeholder logo - replace with actual logo */}
              <div className={styles.logoIcon}>🌐</div>
            </div>
            <span className={styles.title}>{title}</span>
            <Badge variant="secondary" className={styles.betaBadge}>
              Beta
            </Badge>
          </div>
        )}

        {/* Navigation Actions */}
        <nav className={styles.navigation}>
          {actions || (
            <div className={styles.defaultActions}>
              <Button variant="ghost" size="sm">
                Features
              </Button>
              <Button variant="ghost" size="sm">
                Pricing
              </Button>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm">
                Get Started
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button className={styles.mobileToggle} aria-label="Toggle menu">
          <span className={styles.hamburger}></span>
        </button>
      </div>

      {/* Progress Bar (optional) */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ 
            transform: `scaleX(${Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight), 1)})` 
          }}
        />
      </div>
    </header>
  );
};

export default StickyHeaderOrganism;