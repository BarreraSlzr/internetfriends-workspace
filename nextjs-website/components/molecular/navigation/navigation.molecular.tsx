"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonAtomic } from "@/components/atomic/button";
import { HeaderAtomic } from "@/components/atomic/header";
import { NavigationMolecularProps, NavigationItem } from "./types";

export const NavigationMolecular: React.FC<NavigationMolecularProps> = ({
  items,
  logo,
  actions,
  className,
  variant = "transparent",
  mobileBreakpoint = "lg",
  showMobileToggle = true,
  activeItem,
  onItemClick,
  ...props
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setOpenDropdown(null);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleItemClick = (item: NavigationItem) => {
    onItemClick?.(item);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (itemId: string) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
  };

  const renderNavigationItem = (item: NavigationItem, mobile = false) => {
    const isActive = activeItem === item.id || item.active;
    const hasDropdown = item.children && item.children.length > 0;

    if (hasDropdown) {
      return (
        <div key={item.id} className="relative group">
          <button
            onClick={() => toggleDropdown(item.id)}
            className={cn(
              "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-200",
              "hover:text-if-primary focus:outline-none focus:text-if-primary",
              isActive ? "text-if-primary" : "text-foreground",
              mobile && "w-full justify-between text-left",
            )}
            aria-expanded={openDropdown === item.id}
          >
            <span className="flex items-center gap-2">
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                openDropdown === item.id && "rotate-180",
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {openDropdown === item.id && (
            <div
              className={cn(
                "absolute top-full left-0 mt-1 min-w-[200px] bg-glass-header backdrop-blur-glass border border-glass-border rounded-compact-md shadow-glass z-50",
                mobile &&
                  "relative top-0 mt-2 shadow-none border-l-2 border-l-if-primary bg-transparent ml-4",
              )}
            >
              {item.children?.map((child: NavigationItem) => (
                <Link
                  key={child.id}
                  href={child.href}
                  onClick={() => handleItemClick(child)}
                  className={cn(
                    "block px-4 py-2 text-sm text-foreground hover:bg-if-primary-light hover:text-if-primary transition-colors duration-200",
                    "first:rounded-t-compact-md last:rounded-b-compact-md",
                    child.disabled && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {child.icon && <child.icon className="w-4 h-4" />}
                    <span>{child.label}</span>
                    {child.badge && (
                      <span className="ml-auto px-2 py-0.5 bg-if-primary text-white text-xs rounded-compact-sm">
                        {child.badge}
                      </span>
                    )}
                  </div>
                  {child.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {child.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={() => handleItemClick(item)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200",
          "hover:text-if-primary focus-dashed",
          isActive ? "text-if-primary" : "text-foreground",
          item.disabled && "opacity-50 cursor-not-allowed",
          mobile && "w-full",
        )}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
      >
        {item.icon && <item.icon className="w-4 h-4" />}
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-auto px-2 py-0.5 bg-if-primary text-white text-xs rounded-compact-sm">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <HeaderAtomic
      transparent={variant === "transparent"}
      className={cn("navigation-molecular", className)}
      {...props}
    >
      {/* Logo */}
      <div className="flex items-center">
        {logo && (
          <Link
            href={logo.href || "/"}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus-dashed"
            onClick={() => logo.onClick?.()}
          >
            {logo.src ? (
              <img
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
              <span className="font-semibold text-lg text-foreground">
                {logo.text}
              </span>
            )}
          </Link>
        )}
      </div>

      {/* Desktop Navigation */}
      <nav
        className={cn("hidden items-center space-x-1", {
          "lg:flex": mobileBreakpoint === "lg",
          "md:flex": mobileBreakpoint === "md",
          "sm:flex": mobileBreakpoint === "sm",
        })}
      >
        {items.map((item) => renderNavigationItem(item))}
      </nav>

      {/* Actions & Mobile Menu Button */}
      <div className="flex items-center gap-3">
        {/* Desktop Actions */}
        {actions && (
          <div
            className={cn("hidden items-center gap-2", {
              "lg:flex": mobileBreakpoint === "lg",
              "md:flex": mobileBreakpoint === "md",
              "sm:flex": mobileBreakpoint === "sm",
            })}
          >
            {actions}
          </div>
        )}

        {/* Mobile Menu Toggle */}
        {showMobileToggle && (
          <ButtonAtomic
            variant="ghost"
            size="sm"
            className={cn("flex", {
              "lg:hidden": mobileBreakpoint === "lg",
              "md:hidden": mobileBreakpoint === "md",
              "sm:hidden": mobileBreakpoint === "sm",
            })}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </ButtonAtomic>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-glass-header backdrop-blur-glass border-l border-glass-border z-50 animate-slide-up">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-glass-border">
                <div className="flex items-center gap-2">
                  {logo?.src ? (
                    <img
                      src={logo.src}
                      alt={logo.alt || "Logo"}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-if-primary rounded-compact-sm flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {logo?.text?.[0] || "L"}
                      </span>
                    </div>
                  )}
                  <span className="font-medium text-foreground">
                    {logo?.text || "Menu"}
                  </span>
                </div>
                <ButtonAtomic
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </ButtonAtomic>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {items.map((item) => renderNavigationItem(item, true))}
              </nav>

              {/* Mobile Actions */}
              {actions && (
                <div className="p-4 border-t border-glass-border">
                  <div className="space-y-2">{actions}</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </HeaderAtomic>
  );
};

NavigationMolecular.displayName = "NavigationMolecular";
