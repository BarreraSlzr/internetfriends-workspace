'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonAtomic } from '@/components/atomic/button';
import { useI18n, LOCALES, type SupportedLocale } from '@/i18n';

export interface LanguageSelectorProps {
  /** Additional CSS classes */
  className?: string;
  /** Show language names */
  showNames?: boolean;
  /** Show flags */
  showFlags?: boolean;
  /** Compact mode (icon only) */
  compact?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Test identifier */
  'data-testid'?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className,
  showNames = true,
  showFlags = true,
  compact = false,
  disabled = false,
  'data-testid': testId,
}) => {
  const { locale, setLocale, t, isLoading } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = LOCALES[locale];
  const availableLocales = Object.values(LOCALES);

  const handleLocaleChange = async (newLocale: SupportedLocale) => {
    if (newLocale === locale || isLoading) return;

    try {
      await setLocale(newLocale);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to change locale:', error);
    }
  };

  const handleToggle = () => {
    if (disabled || isLoading) return;
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-language-selector]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
        case 'ArrowUp':
          event.preventDefault();
          // Could implement keyboard navigation here
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          // Handle selection
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (compact) {
    return (
      <div
        className={cn('relative inline-block', className)}
        data-language-selector
        data-testid={testId}
      >
        <ButtonAtomic
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          disabled={disabled || isLoading}
          className="h-9 w-9 p-0"
          aria-label={t('language.selectLanguage')}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Globe size={16} />
          )}
        </ButtonAtomic>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-50 py-1">
            {availableLocales.map((localeConfig) => (
              <button key={localeConfig.code} onClick={() => handleLocaleChange(localeConfig.code)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                  locale === localeConfig.code && 'bg-accent text-accent-foreground'
                )}
                role="option"
                aria-selected={locale === localeConfig.code}
              >
                {showFlags && (
                  <span className="text-base" aria-hidden="true">
                    {localeConfig.flag}
                  </span>
                )}
                <span className="flex-1 text-left">{localeConfig.name}</span>
                {locale === localeConfig.code && (
                  <Check size={14} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn('relative inline-block', className)}
      data-language-selector
      data-testid={testId}
    >
      <ButtonAtomic
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={disabled || isLoading}
        className="h-9 gap-2"
        aria-label={t('language.selectLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {showFlags && (
              <span className="text-base" aria-hidden="true">
                {currentLocale.flag}
              </span>
            )}
            {showNames && (
              <span className="text-sm font-medium">
                {currentLocale.name}
              </span>
            )}
          </>
        )}
        <ChevronDown
          size={14}
          className={cn(
            'transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </ButtonAtomic>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-50 py-1">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
            {t('language.selectLanguage')}
          </div>
          {availableLocales.map((localeConfig) => (
            <button key={localeConfig.code} onClick={() => handleLocaleChange(localeConfig.code)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                locale === localeConfig.code && 'bg-accent text-accent-foreground'
              )}
              role="option"
              aria-selected={locale === localeConfig.code}
            >
              {showFlags && (
                <span className="text-base" aria-hidden="true">
                  {localeConfig.flag}
                </span>
              )}
              <span className="flex-1 text-left">{localeConfig.name}</span>
              {locale === localeConfig.code && (
                <Check size={14} className="text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

LanguageSelector._displayName = 'LanguageSelector';

export default LanguageSelector;
