"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  X,
  Search,
  Globe,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonAtomic } from "@/components/atomic/button";
import { NavigationMolecular } from "@/components/molecular/navigation";
import { useTheme } from "@/hooks/use-theme";
import { useHeaderOrbit } from "@/hooks/use-header-orbit";
import { useI18n } from "@/i18n";
import { LOCALES } from "@/i18n/config";
import {
  HeaderOrganismProps,
  HeaderState,
  HeaderContextValue,
  HeaderAction,
  HEADER_DEFAULTS,
  HEADER_STICKY_DEFAULTS,
  HEADER_RESPONSIVE_DEFAULTS,
} from "./types";
import styles from "./header.organism.module.scss";

// Header context
const HeaderContext = createContext<HeaderContextValue | null>(null);

// Hook to use header context
export const useHeader = (): HeaderContextValue => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within HeaderOrganism");
  }
  return context;
};

// Skip to main content component
const SkipToMainContent: React.FC<{ selector: string }> = ({ selector }) => {
  const { t } = useI18n();

  const handleSkipToMain = (e: React.MouseEvent) => {
    e.preventDefault();
    const mainElement = document.querySelector(selector);
    if (mainElement) {
      (mainElement as HTMLElement).focus();
      mainElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Link
      href="#main-content"
      className={cn(
        styles.skipToMain,
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
        "z-50 bg-if-primary text-white px-4 py-2 rounded-compact-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      )}
      onClick={handleSkipToMain}
    >
      {t("accessibility.skipToMain")}
    </Link>
  );
};

// Theme toggle component
const ThemeToggle: React.FC<{
  config?: HeaderOrganismProps["themeToggle"];
}> = ({ config }) => {
  const { theme, setTheme, isDark, isLight } = useTheme();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    {
      value: "light" as const,
      label: config?.lightLabel || t("theme.light"),
      icon: Sun,
      active: isLight,
    },
    {
      value: "dark" as const,
      label: config?.darkLabel || t("theme.dark"),
      icon: Moon,
      active: isDark,
    },
    {
      value: "system" as const,
      label: config?.systemLabel || t("theme.system"),
      icon: Monitor,
      active: theme.mode === "system",
    },
  ];

  const activeTheme = themeOptions.find((option) => option.active);

  if (!config?.show) return null;

  return (
    <div className="relative">
      <ButtonAtomic
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t("theme.toggleTheme")}
        className={cn("gap-2", config?.buttonProps?.className)}
        {...config?.buttonProps}
      >
        {activeTheme?.icon && <activeTheme.icon className="w-4 h-4" />}
        {config?.showLabels && <span>{activeTheme?.label}</span>}
        <ChevronDown
          className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")}
        />
      </ButtonAtomic>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-full right-0 mt-2 w-48 bg-glass-bg-header backdrop-blur-glass border border-glass-border rounded-compact-md shadow-lg z-50">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                  "hover:bg-if-primary-light hover:text-if-primary",
                  "first:rounded-t-compact-md last:rounded-b-compact-md",
                  option.active && "bg-if-primary-light text-if-primary",
                )}
              >
                <option.icon className="w-4 h-4" />
                <span>{option.label}</span>
                {option.active && (
                  <div className="w-2 h-2 bg-if-primary rounded-full ml-auto" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Language selector component
const LanguageSelector: React.FC<{
  config?: HeaderOrganismProps["languageSelector"];
}> = ({ config }) => {
  const { locale: currentLocale, setLocale, t } = useI18n();
  const availableLocales = Object.values(LOCALES);
  const [isOpen, setIsOpen] = useState(false);

  if (!config?.show || availableLocales.length <= 1) return null;

  const currentLang = availableLocales.find(
    (lang) => lang.code === currentLocale,
  );

  return (
    <div className="relative">
      <ButtonAtomic
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t("language.selectLanguage")}
        className={cn("gap-2", config?.buttonProps?.className)}
        {...config?.buttonProps}
      >
        <Globe className="w-4 h-4" />
        {config?.showFlags && currentLang?.flag && (
          <span className="text-lg">{currentLang.flag}</span>
        )}
        {config?.showNames && <span>{currentLang?.name}</span>}
        {config?.showCodesOnly && (
          <span className="uppercase">{currentLang?.code}</span>
        )}
        <ChevronDown
          className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")}
        />
      </ButtonAtomic>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-full right-0 mt-2 w-48 bg-glass-bg-header backdrop-blur-glass border border-glass-border rounded-compact-md shadow-lg z-50">
            {availableLocales.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code as "fr" | "en" | "es");
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                  "hover:bg-if-primary-light hover:text-if-primary",
                  "first:rounded-t-compact-md last:rounded-b-compact-md",
                  lang.code === currentLocale &&
                    "bg-if-primary-light text-if-primary",
                )}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
                <span className="text-xs opacity-75 uppercase ml-auto">
                  {lang.code}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Header actions component
const HeaderActions: React.FC<{ actions?: HeaderAction[] }> = ({ actions }) => {
  if (!actions?.length) return null;

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => {
        if (action.href) {
          return (
            <Link
              key={action.id}
              href={action.href}
              target={action.external ? "_blank" : undefined}
            >
              <ButtonAtomic
                variant={action.variant || "primary"}
                size={action.size || "sm"}
                disabled={action.disabled}
                loading={action.loading}
                className={cn(
                  action.desktopOnly && "hidden lg:flex",
                  action.mobileOnly && "lg:hidden",
                  action.buttonProps?.className,
                )}
                {...action.buttonProps}
              >
                {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                <span>{action.label}</span>
              </ButtonAtomic>
            </Link>
          );
        }

        return (
          <ButtonAtomic
            key={action.id}
            variant={action.variant || "primary"}
            size={action.size || "sm"}
            onClick={action.onClick}
            disabled={action.disabled}
            loading={action.loading}
            className={cn(
              action.desktopOnly && "hidden lg:flex",
              action.mobileOnly && "lg:hidden",
              action.buttonProps?.className,
            )}
            {...action.buttonProps}
          >
            {action.icon && <span className="w-4 h-4">{action.icon}</span>}
            <span>{action.label}</span>
          </ButtonAtomic>
        );
      })}
    </div>
  );
};

// Announcement bar component
const AnnouncementBar: React.FC<{
  config?: HeaderOrganismProps["announcement"];
}> = ({ config }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (config?.autoHide && config.autoHide > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, config.autoHide);

      return () => clearTimeout(timer);
    }
  }, [config?.autoHide]);

  if (!config?.show || !isVisible) return null;

  const variantStyles = {
    info: "bg-blue-50 text-blue-900 border-blue-200",
    warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
    success: "bg-green-50 text-green-900 border-green-200",
    error: "bg-red-50 text-red-900 border-red-200",
  };

  return (
    <div
      className={cn(
        "w-full px-4 py-2 border-b text-sm text-center relative",
        variantStyles[config.variant || "info"],
        config.onClick && "cursor-pointer hover:opacity-80",
        config.className,
      )}
      onClick={config.onClick}
    >
      {config.content}
      {config.dismissible && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-75"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Main HeaderOrganism component
export const HeaderOrganism: React.FC<HeaderOrganismProps> = ({
  logo,
  navigation,
  actions,
  themeToggle,
  languageSelector,
  search,
  announcement,
  sticky = HEADER_STICKY_DEFAULTS,
  responsive = HEADER_RESPONSIVE_DEFAULTS,
  variant = HEADER_DEFAULTS.variant,
  size = HEADER_DEFAULTS.size,
  className,
  children,
  skipToMain = HEADER_DEFAULTS.skipToMain,
  mainContentSelector = HEADER_DEFAULTS.mainContentSelector,
  "data-testid": testId,
  id,
  "aria-label": ariaLabel,
  ...props
}) => {
  const pathname = usePathname();
  const { t } = useI18n();

  // Header state
  const [headerState, setHeaderState] = useState<HeaderState>({
    isSticky: true,
    isMobileMenuOpen: false,
    scrollPosition: 0,
    isHidden: false,
    isSearchActive: false,
    searchQuery: "",
    isAnnouncementVisible: announcement?.show || false,
  });

  // Refined orbital motion system
  const {
    state: orbitState,
    headerRef,
    cssProperties,
    orbitStyles,
  } = useHeaderOrbit({
    threshold: sticky?.offset || 64,
    range: 400,
    amplitudeX: 6,
    amplitudeY: 3,
    scaleRange: [1, 0.75],
    respectReducedMotion: true,
    throttle: 16,
  });

  // Update header state based on orbit state
  useEffect(() => {
    setHeaderState((prev) => ({
      ...prev,
      isSticky: orbitState.isScrolled,
      isHidden: false, // Disable auto-hide when using orbital motion
      scrollPosition: orbitState.scrollY,
    }));
  }, [orbitState.isScrolled, orbitState.scrollY]);

  // Context value
  const contextValue: HeaderContextValue = {
    ...headerState,
    toggleMobileMenu: () =>
      setHeaderState((prev) => ({
        ...prev,
        isMobileMenuOpen: !prev.isMobileMenuOpen,
      })),
    closeMobileMenu: () =>
      setHeaderState((prev) => ({
        ...prev,
        isMobileMenuOpen: false,
      })),
    toggleSearch: () =>
      setHeaderState((prev) => ({
        ...prev,
        isSearchActive: !prev.isSearchActive,
      })),
    setSearchQuery: (query: string) =>
      setHeaderState((prev) => ({ ...prev, searchQuery: query })),
    dismissAnnouncement: () =>
      setHeaderState((prev) => ({ ...prev, isAnnouncementVisible: false })),
    updateState: (updates: Partial<HeaderState>) =>
      setHeaderState((prev) => ({ ...prev, ...updates })),
  };

  // Close mobile menu on route change
  useEffect(() => {
    contextValue.closeMobileMenu();
  }, [pathname, contextValue]);

  // Header size styles
  const sizeStyles = {
    sm: "h-14",
    md: "h-16",
    lg: "h-20",
  };

  // Combined navigation props
  const navigationProps = {
    ...navigation,
    items: navigation?.items || [],
    logo,
    className: cn(navigation?.className),
    variant:
      variant === "transparent" ? ("transparent" as const) : ("solid" as const),
    mobileBreakpoint: responsive?.mobileBreakpoint,
    showMobileToggle: responsive?.showMobileToggle,
  };

  return (
    <HeaderContext.Provider value={contextValue}>
      <header
        ref={headerRef}
        className={cn(
          styles.headerOrganism,
          styles[variant], // Applies .glass, .solid, or .transparent
          sizeStyles[size],
          "w-full z-40",
          "sticky top-0",
          headerState.isHidden && styles.hidden,
          className,
        )}
        style={{
          ...orbitStyles,
          ...cssProperties,
          transitionDuration: sticky?.transitionDuration,
        }}
        data-testid={testId}
        data-orbit-active={orbitState.progress > 0}
        data-orbit-progress={orbitState.progress}
        data-scrolled={orbitState.isScrolled}
        id={id}
        aria-label={ariaLabel || t("accessibility.skipToContent")}
        {...props}
      >
        {/* Skip to main content */}
        {skipToMain && <SkipToMainContent selector={mainContentSelector} />}

        {/* Announcement bar */}
        {headerState.isAnnouncementVisible && (
          <AnnouncementBar config={announcement} />
        )}

        {/* Main header content */}
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            {logo && (
              <Link
                href={logo.href || "/"}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus-dashed"
                onClick={logo.onClick}
              >
                {logo.src ? (
                  <Image
                    src={logo.src}
                    alt={logo.alt || "Logo"}
                    width={logo.width || 32}
                    height={logo.height || 32}
                    className={cn("object-contain", logo.className)}
                  />
                ) : (
                  <div className="w-8 h-8 bg-if-primary rounded-compact-sm flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {logo.text?.[0] || "L"}
                    </span>
                  </div>
                )}
                {logo.text && (
                  <span className="font-semibold text-foreground hidden sm:inline">
                    {logo.text}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Center section - Navigation */}
          <div className="flex-1 flex justify-center">
            {navigation && <NavigationMolecular {...navigationProps} />}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Search */}
            {search?.show && (
              <ButtonAtomic
                variant="ghost"
                size="sm"
                onClick={contextValue.toggleSearch}
                aria-label={t("common.search")}
                className="hidden md:flex"
              >
                <Search className="w-4 h-4" />
                {search.shortcut && (
                  <kbd className="ml-2 px-1 py-0.5 text-xs bg-muted rounded">
                    {search.shortcut}
                  </kbd>
                )}
              </ButtonAtomic>
            )}

            {/* Language selector */}
            <LanguageSelector config={languageSelector} />

            {/* Theme toggle */}
            <ThemeToggle config={themeToggle} />

            {/* Header actions */}
            <HeaderActions actions={actions} />
          </div>
        </div>

        {/* Custom children */}
        {children}
      </header>
    </HeaderContext.Provider>
  );
};

HeaderOrganism.displayName = "HeaderOrganism";
