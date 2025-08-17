/**
 * Enhanced Auth Components Integration
 * Combines go-rich-auth with session repository patterns and Octopus.do design
 */

import React from 'react';
import { AuthCardOrganism } from '../organisms/auth/auth-card.organism';
import { OAuthButtonMolecular } from '../molecular/auth/oauth-button.molecular';
import { useAuth } from '../../lib/auth/go-rich-auth';
import { Button } from '../ui/button';
import styles from './enhanced-auth.styles.module.scss';

interface EnhancedAuthPageProps {
  mode?: 'login' | 'register' | 'reset';
  onModeChange?: (mode: 'login' | 'register' | 'reset') => void;
}

export const EnhancedAuthPage: React.FC<EnhancedAuthPageProps> = ({
  mode = 'login',
  onModeChange,
}) => {
  const { login, isLoading, error } = useAuth();
  
  const handleOAuthSignIn = async (provider: string) => {
    try {
      // Enhanced OAuth flow combining both patterns
      const success = await login({ 
        provider: provider as any,
        // Additional session repository patterns can be added here
      });
      
      if (success) {
        // Handle successful authentication
        console.log(`Successfully authenticated with ${provider}`);
      }
    } catch (error) {
      console.error('OAuth authentication failed:', error);
    }
  };

  const handleDemoLogin = async () => {
    await login({ provider: 'demo' });
  };

  return (
    <div className={styles.authPage}>
      <AuthCardOrganism
        title={mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
        subtitle={mode === 'login' ? 'Sign in to your InternetFriends account' : mode === 'register' ? 'Join the InternetFriends community' : 'Enter your email to reset your password'}
        mode={mode}
        isLoading={isLoading}
        footer={
          <div className={styles.authFooter}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={() => onModeChange?.('register')}
                  className={styles.linkButton}
                >
                  Sign up
                </button>
              </>
            ) : mode === 'register' ? (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => onModeChange?.('login')}
                  className={styles.linkButton}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Remember your password?{' '}
                <button 
                  onClick={() => onModeChange?.('login')}
                  className={styles.linkButton}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        }
      >
        {/* OAuth Buttons - Session repository inspired */}
        <div className={styles.oauthSection}>
          <OAuthButtonMolecular
            provider="google"
            mode={mode === 'reset' ? 'login' : mode}
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
          />
          <OAuthButtonMolecular
            provider="github"
            mode={mode === 'reset' ? 'login' : mode}
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
          />
        </div>

        {/* Separator */}
        <div className={styles.separator}>
          <span>or</span>
        </div>

        {/* Demo Access Button - Your existing pattern */}
        <Button
          variant="outline"
          className={styles.demoButton}
          onClick={handleDemoLogin}
          disabled={isLoading}
        >
          🚀 Demo Access (Full Premium Features)
        </Button>

        {/* Error Display */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
      </AuthCardOrganism>
    </div>
  );
};

export default EnhancedAuthPage;