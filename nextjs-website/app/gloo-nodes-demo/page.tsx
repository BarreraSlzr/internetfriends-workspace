'use client'

import React, { useState } from 'react'
import { ComponentNode } from '../(internetfriends)/design-system/nodes/component.gloo.node'
import { HookNode } from '../(internetfriends)/design-system/nodes/hook.gloo.node'
import styles from './gloo-nodes-demo.styles.module.scss'

export default function GlooNodesDemo() {
  const [glooEnabled, setGlooEnabled] = useState(true)

  const componentNodes = [
    {
      id: 'button-atomic',
      data: {
        label: 'Button',
        category: 'atomic' as const,
        description: 'Basic interactive button component',
        useGloo: glooEnabled,
      }
    },
    {
      id: 'form-molecular',
      data: {
        label: 'ContactForm',
        category: 'molecular' as const,
        description: 'Contact form with validation',
        useGloo: glooEnabled,
      }
    },
    {
      id: 'header-organism',
      data: {
        label: 'SiteHeader',
        category: 'organism' as const,
        description: 'Main site navigation header',
        useGloo: glooEnabled,
      }
    },
    {
      id: 'layout-template',
      data: {
        label: 'PageLayout',
        category: 'template' as const,
        description: 'Standard page layout template',
        useGloo: glooEnabled,
      }
    },
    {
      id: 'auth-page',
      data: {
        label: 'AuthPage',
        category: 'page' as const,
        description: 'Authentication page implementation',
        useGloo: glooEnabled,
      }
    },
  ]

  const hookNodes = [
    {
      id: 'use-state',
      data: {
        label: 'useState',
        hookType: 'state' as const,
        description: 'React state management',
        useGloo: glooEnabled,
      }
    },
    {
      id: 'use-effect',
      data: {
        label: 'useEffect',
        hookType: 'effect' as const,
        description: 'Side effect management',
        useGloo: glooEnabled,
      }
    },
    {
      id: 'use-auth',
      data: {
        label: 'useAuth',
        hookType: 'custom' as const,
        description: 'Authentication hook',
        useGloo: glooEnabled,
      }
    },
    {
      id: 'auth-context',
      data: {
        label: 'AuthContext',
        hookType: 'context' as const,
        description: 'Authentication context provider',
        useGloo: glooEnabled,
      }
    },
  ]

  return (
    <div className={styles.demoContainer}>
      <div className={styles.demoHeader}>
        <h1 className={styles.title}>Gloo-Enhanced Design System Nodes</h1>
        <p className={styles.subtitle}>
          Octopus.do flat design meets InternetFriends glass morphism with WebGL effects
        </p>
        
        <div className={styles.controls}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={glooEnabled}
              onChange={(e) => setGlooEnabled(e.target.checked)}
              className={styles.toggle}
            />
            <span className={styles.toggleText}>
              {glooEnabled ? '✨ Gloo Enabled' : '⭐ Enable Gloo'}
            </span>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Component Hierarchy</h2>
        <div className={styles.nodeGrid}>
          {componentNodes.map((node) => (
            <div key={node.id} className={styles.nodeWrapper}>
              <ComponentNode
                id={node.id}
                data={node.data}
                type="component"
                position={{ x: 0, y: 0 }}
                selected={false}
                isConnectable={false}
                xPos={0}
                yPos={0}
                zIndex={1}
                dragging={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>React Hooks</h2>
        <div className={styles.nodeGrid}>
          {hookNodes.map((node) => (
            <div key={node.id} className={styles.nodeWrapper}>
              <HookNode
                id={node.id}
                data={node.data}
                type="hook"
                position={{ x: 0, y: 0 }}
                selected={false}
                isConnectable={false}
                xPos={0}
                yPos={0}
                zIndex={1}
                dragging={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.features}>
        <h2 className={styles.sectionTitle}>Features</h2>
        <div className={styles.featureList}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎨</span>
            <span>Category-specific Gloo effects and color palettes</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✨</span>
            <span>WebGL-powered background animations</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🔧</span>
            <span>Glass morphism with backdrop blur</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📱</span>
            <span>Responsive and performance optimized</span>
          </div>
        </div>
      </div>
    </div>
  )
}