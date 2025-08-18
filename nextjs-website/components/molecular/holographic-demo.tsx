import React, { useState } from 'react';
import styles from './holographic-demo.module.scss';

interface HolographicDemoProps {
  className?: string;
}

export default function HolographicDemo({ className = '' }: HolographicDemoProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>('medium');
  const [isInteractive, setIsInteractive] = useState(true);
  const [showPrism, setShowPrism] = useState(false);

  const variants = [
    { id: 'subtle', name: 'Subtle', class: 'glass-holographic-subtle' },
    { id: 'medium', name: 'Medium', class: 'glass-holographic-medium' },
    { id: 'strong', name: 'Strong', class: 'glass-holographic-strong' },
  ];

  const getHoloClasses = (variant: string) => {
    const baseClass = variants.find(v => v.id === variant)?.class || 'glass-holographic-medium';
    const interactiveClass = isInteractive ? 'glass-holographic-interactive glass-holographic-focus' : '';
    const prismClass = showPrism ? 'glass-holographic-prism' : '';
    
    return `${baseClass} ${interactiveClass} ${prismClass}`.trim();
  };

  return (
    <div className={`${styles.holoDemo} ${className}`}>
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Holographic Strength:</label>
          <div className={styles.variantButtons}>
            {variants.map(variant => (
              <button
                key={variant.id}
                className={`${styles.variantButton} ${selectedVariant === variant.id ? styles.active : ''}`}
                onClick={() => setSelectedVariant(variant.id)}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            <input
              type="checkbox"
              checked={isInteractive}
              onChange={(e) => setIsInteractive(e.target.checked)}
              className={styles.checkbox}
            />
            Interactive Effects
          </label>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            <input
              type="checkbox"
              checked={showPrism}
              onChange={(e) => setShowPrism(e.target.checked)}
              className={styles.checkbox}
            />
            Prism Mode
          </label>
        </div>
      </div>

      <div className={styles.showcase}>
        {/* Card Example */}
        <div className={`${styles.holoCard} holo-card ${getHoloClasses(selectedVariant)}`}>
          <h3 className={styles.cardTitle}>Holographic Card</h3>
          <p className={styles.cardDescription}>
            This card demonstrates the holographic glass morphism effect with rainbow shimmer overlays,
            chromatic aberration shadows, and animated noise textures.
          </p>
          <div className={styles.cardActions}>
            <button className={`${styles.cardButton} holo-button`}>
              Primary Action
            </button>
            <button className={`${styles.cardButton} ${styles.secondary}`}>
              Secondary
            </button>
          </div>
        </div>

        {/* Button Examples */}
        <div className={styles.buttonGrid}>
          <button className={`holo-button ${getHoloClasses(selectedVariant)}`}>
            Holographic Button
          </button>
          <div className={`${styles.chip} ${getHoloClasses(selectedVariant)}`}>
            Status Chip
          </div>
          <div className={`${styles.badge} ${getHoloClasses(selectedVariant)}`}>
            Badge
          </div>
        </div>

        {/* Header Example with Chunky Glass */}
        <header className={`${styles.holoHeader} glass-chunky-header ${getHoloClasses(selectedVariant)}`}>
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <div className={`${styles.logoIcon} glass-dramatic ${getHoloClasses(selectedVariant)}`}>
                IF
              </div>
              <span className={styles.logoText}>Thick Glass UI</span>
            </div>
            <nav className={styles.nav}>
              <a href="#" className={`${styles.navLink} glass-thick-border`}>Features</a>
              <a href="#" className={`${styles.navLink} glass-thick-border`}>Gallery</a>
              <a href="#" className={`${styles.navLink} glass-extreme`}>Contact</a>
            </nav>
          </div>
        </header>

        {/* Interactive Elements Grid with Thick Glass */}
        <div className={styles.elementsGrid}>
          <div className={`${styles.element} glass-dramatic ${getHoloClasses(selectedVariant)}`}>
            <div className={styles.elementIcon}>🎨</div>
            <span>Thick Glass</span>
          </div>
          <div className={`${styles.element} glass-ultra-thick ${getHoloClasses(selectedVariant)}`}>
            <div className={styles.elementIcon}>⚡</div>
            <span>Ultra Thick</span>
          </div>
          <div className={`${styles.element} glass-extreme ${getHoloClasses(selectedVariant)}`}>
            <div className={styles.elementIcon}>🔮</div>
            <span>Extreme Glass</span>
          </div>
          <div className={`${styles.element} glass-massive-border ${getHoloClasses(selectedVariant)}`}>
            <div className={styles.elementIcon}>💎</div>
            <span>Massive Border</span>
          </div>
        </div>
      </div>

      <div className={styles.technicalInfo}>
        <h4>Technical Features:</h4>
        <ul>
          <li>🌈 Rainbow shimmer overlays with custom CSS gradients</li>
          <li>🔍 Chromatic aberration shadow effects</li>
          <li>📺 Animated holographic noise textures</li>
          <li>🎯 Interactive hover and focus states</li>
          <li>♿ Accessibility-aware (respects reduced motion)</li>
          <li>🖨️ Print-friendly (effects disabled for print)</li>
          <li>🌙 Dark mode optimized</li>
          <li>⚡ Hardware-accelerated animations</li>
        </ul>
      </div>
    </div>
  );
}