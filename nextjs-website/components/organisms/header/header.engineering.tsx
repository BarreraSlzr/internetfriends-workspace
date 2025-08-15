"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export interface HeaderEngineeringProps {
  logo?: {
    src?: string;
    text?: string;
    alt?: string;
    href?: string;
  };
  navigation?: {
    items: Array<{
      label: string;
      href: string;
      active?: boolean;
    }>;
  };
  actions?: Array<{
    label: string;
    href: string;
    variant?: "primary" | "secondary";
  }>;
  className?: string;
}

export const HeaderEngineering: React.FC<HeaderEngineeringProps> = ({
  logo,
  navigation,
  actions,
  className,
}) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`header-engineering ${className || ""}`}>
      <div className="header-container">
        <Link href={logo?.href || "/"} className="logo">
          {logo?.src ? (
            <Image
              src={logo.src}
              alt={logo.alt || "InternetFriends"}
              width={32}
              height={32}
              className="logo-image"
            />
          ) : (
            <div className="logo-fallback">{logo?.text?.[0] || "IF"}</div>
          )}
          {logo?.text && <span className="logo-text">{logo.text}</span>}
        </Link>

        {/* Desktop Navigation */}
        {navigation?.items && (
          <nav className="nav-tabs hidden md:flex">
            {navigation.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-tab ${pathname === item.href ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Desktop Actions */}
        {actions && (
          <div className="header-actions hidden md:flex">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`btn ${
                  action.variant === "secondary"
                    ? "btn-secondary"
                    : "btn-primary"
                }`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="mobile-menu-button md:hidden"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu md:hidden">
          <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
          <div className="mobile-menu-content">
            {navigation?.items && (
              <nav className="mobile-nav">
                {navigation.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mobile-nav-item ${pathname === item.href ? "active" : ""}`}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
            
            {actions && (
              <div className="mobile-actions">
                {actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`btn ${
                      action.variant === "secondary"
                        ? "btn-secondary"
                        : "btn-primary"
                    } w-full`}
                    onClick={closeMobileMenu}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

HeaderEngineering.displayName = "HeaderEngineering";
