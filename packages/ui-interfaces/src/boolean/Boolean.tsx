import React from 'react';
import { Switch, SwitchProps } from '@mantine/core';

/**
 * Props for the Boolean interface component
 * Based on Directus boolean interface configuration
 */
export interface BooleanProps {
  /** Current boolean value */
  value?: boolean | null;
  
  /** Whether the switch is disabled */
  disabled?: boolean;
  
  /** Whether the switch is readonly */
  readOnly?: boolean;
  
  /** Whether the field is required */
  required?: boolean;
  
  /** Label displayed next to the switch */
  label?: string;
  
  /** Description text displayed below the label */
  description?: string;
  
  /** Error message to display */
  error?: string;
  
  /** Icon to show when switch is on */
  iconOn?: React.ReactNode;
  
  /** Icon to show when switch is off */
  iconOff?: React.ReactNode;
  
  /** Color when switch is on */
  colorOn?: string;
  
  /** Color when switch is off */
  colorOff?: string;
  
  /** Size of the switch */
  size?: SwitchProps['size'];
  
  /** Callback fired when value changes */
  onChange?: (value: boolean) => void;
  
  /** Additional props to pass to the Switch component */
  switchProps?: Omit<SwitchProps, 'checked' | 'onChange' | 'disabled' | 'label' | 'size'>;
}

/**
 * Boolean Interface Component
 * 
 * A toggle switch interface that matches the Directus boolean interface functionality.
 * Uses Mantine's Switch component for consistent styling and behavior.
 * 
 * Features:
 * - Boolean value handling with null state support
 * - Custom icons for on/off states
 * - Color customization
 * - Disabled and readonly states
 * - Error handling
 * - Accessibility support
 * 
 * @param props - Boolean interface props
 * @returns React component
 */
export const Boolean: React.FC<BooleanProps> = ({
  value,
  disabled = false,
  readOnly = false,
  required = false,
  label,
  description,
  error,
  iconOn,
  iconOff,
  colorOn,
  colorOff,
  size = 'sm',
  onChange,
  switchProps = {},
  ...rest
}) => {
  // Handle the change event
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) {
      return;
    }
    
    const newValue = event.currentTarget.checked;
    onChange?.(newValue);
  };

  // Determine the checked state
  // null values are treated as unchecked (false)
  const checked = value === true;

  // Build the Switch props
  const switchComponentProps: SwitchProps = {
    ...switchProps,
    checked,
    onChange: handleChange,
    disabled: disabled || readOnly,
    label: label ? (required ? `${label} *` : label) : undefined,
    description,
    error,
    size,
    ...rest,
  };

  // Add custom styling if colors are provided
  if (colorOn || colorOff) {
    const customStyles = {
      track: {
        ...(colorOff && {
          backgroundColor: colorOff,
          borderColor: colorOff,
        }),
      },
    };
    
    // Apply styles to the component props
    switchComponentProps.styles = typeof switchComponentProps.styles === 'function' 
      ? switchComponentProps.styles 
      : { ...switchComponentProps.styles, ...customStyles };
      
    // Use CSS custom properties for checked state styling
    if (colorOn) {
      switchComponentProps.style = {
        ...switchComponentProps.style,
        '--mantine-color-primary-filled': colorOn,
      };
    }
  }

  // Add icon labels if provided
  if (iconOn || iconOff) {
    if (iconOn) {
      switchComponentProps.onLabel = iconOn;
    }
    if (iconOff) {
      switchComponentProps.offLabel = iconOff;
    }
  }

  return <Switch {...switchComponentProps} />;
};

export default Boolean;
