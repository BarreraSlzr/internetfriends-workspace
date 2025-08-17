import React from "react";
import styles from "./button.flat.module.scss";
import { cn } from "@/lib/utils";

export interface FlatButtonBaseProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "minimal" | "glass";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  href?: string;
  target?: string;
  as?: "button" | "a";
}

export type FlatButtonProps = FlatButtonBaseProps & 
  (React.ButtonHTMLAttributes<HTMLButtonElement> | React.AnchorHTMLAttributes<HTMLAnchorElement>);

export const FlatButton: React.FC<FlatButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = "left",
  children,
  className,
  href,
  target,
  as,
  ...props
}) => {
  const disabled = 'disabled' in props ? props.disabled : false;
  const Component = as || (href ? "a" : "button") as any;
  
  const buttonClasses = cn(
    styles.flatButton,
    styles[variant],
    styles[size],
    {
      [styles.fullWidth]: fullWidth,
      [styles.loading]: loading,
      [styles.disabled]: disabled || loading,
      [styles.withIcon]: !!icon,
      [styles.iconRight]: icon && iconPosition === "right",
    },
    className
  );

  const commonProps = {
    className: buttonClasses,
    ...(Component === "button" && { disabled: disabled || loading }),
    ...(href && { href, target }),
    ...props,
  };

  return (
    <Component {...commonProps}>
      {loading && (
        <span className={styles.spinner}>
          <div className={styles.spinnerDot} />
          <div className={styles.spinnerDot} />
          <div className={styles.spinnerDot} />
        </span>
      )}
      
      {icon && iconPosition === "left" && !loading && (
        <span className={styles.icon}>{icon}</span>
      )}
      
      {children && (
        <span className={styles.content}>
          {children}
        </span>
      )}
      
      {icon && iconPosition === "right" && !loading && (
        <span className={styles.icon}>{icon}</span>
      )}
    </Component>
  );
};

export default FlatButton;