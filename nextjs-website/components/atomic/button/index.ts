// InternetFriends Atomic Button Component Exports
// Clean exports for the button component and all related utilities

// Main component export
export { ButtonAtomic } from './button.atomic';
export { ButtonAtomic as default } from './button.atomic';

// Component variants export
export { buttonVariants } from './button.atomic';

// Type exports
export type {
  ButtonAtomicProps,
  ButtonVariant,
  ButtonSize,
  ButtonState,
  ButtonTheme,
  ButtonA11yProps,
  ButtonAtomicA11yProps,
  ButtonGroupProps,
  ButtonFormConfig,
  ButtonAtomicCompleteProps,
  ButtonEventHandlers,
  ButtonRenderProps,
  ButtonRenderProp,
} from './types';

// Type guard exports
export { isButtonVariant, isButtonSize, BUTTON_DEFAULTS } from './types';

// Re-export for convenience (common usage patterns)
export { ButtonAtomic as Button } from './button.atomic';
