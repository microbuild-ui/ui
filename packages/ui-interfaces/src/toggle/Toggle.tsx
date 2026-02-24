import { Box, Switch, SwitchProps, Text, useMantineTheme } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import React from "react";

/**
 * Props for the Toggle interface component
 * Based on DaaS boolean interface with toggle-specific styling
 */
export interface ToggleProps {
  /** Current boolean value */
  value?: boolean | null;

  /** Whether the toggle is disabled */
  disabled?: boolean;

  /** Whether the toggle is readonly */
  readOnly?: boolean;

  /** Whether the field is required */
  required?: boolean;

  /** Label displayed next to the toggle */
  label?: string;

  /** Description text displayed below the label */
  description?: string;

  /** Error message to display */
  error?: string;

  /** Icon to show when toggle is on (ReactNode for JSX; string values from backend options are ignored) */
  iconOn?: string | React.ReactNode;

  /** Icon to show when toggle is off (ReactNode for JSX; string values from backend options are ignored) */
  iconOff?: string | React.ReactNode;

  /** Color when toggle is on */
  colorOn?: string;

  /** Color when toggle is off */
  colorOff?: string;

  /** Size of the toggle */
  size?: SwitchProps["size"];

  /** Callback fired when value changes */
  onChange?: (value: boolean) => void;

  /** Label for the 'on' state */
  labelOn?: string;

  /** Label for the 'off' state */
  labelOff?: string;

  /** Show state labels beside the toggle */
  showStateLabels?: boolean;

  /** Additional props to pass to the Switch component */
  switchProps?: Omit<
    SwitchProps,
    "checked" | "onChange" | "disabled" | "label" | "size"
  >;

  /** Test ID for testing */
  "data-testid"?: string;
}

/**
 * Toggle Interface Component
 *
 * A toggle switch interface that provides a more visual on/off toggle compared to the
 * standard Boolean component. Matches the DaaS toggle interface functionality.
 *
 * Uses Mantine's Switch component with enhanced styling for toggle behavior:
 * - Visual on/off state with icons
 * - Custom colors for states
 * - Optional state labels (On/Off text)
 * - DaaS-compatible API
 *
 * Features:
 * - Boolean value handling with null state support
 * - Custom icons for on/off states
 * - Color customization for both states
 * - State labels (e.g., "On" / "Off")
 * - Disabled and readonly states
 * - Error handling
 * - Accessibility support (ARIA)
 *
 * @param props - Toggle interface props
 * @returns React component
 *
 * @example
 * ```tsx
 * <Toggle
 *   label="Enable notifications"
 *   value={true}
 *   labelOn="Enabled"
 *   labelOff="Disabled"
 *   onChange={(value) => console.log('Toggle changed:', value)}
 * />
 * ```
 */
export const Toggle: React.FC<ToggleProps> = ({
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
  size = "md",
  onChange,
  labelOn = "On",
  labelOff = "Off",
  showStateLabels = false,
  switchProps = {},
  "data-testid": testId,
  ...rest
}) => {
  const theme = useMantineTheme();

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

  // Default colors based on DaaS theme
  const defaultColorOn = colorOn || theme.colors.green[6];
  const defaultColorOff = colorOff || theme.colors.gray[5];

  // Default icons - toggle style icons or check/x for clarity
  // String values from backend options are ignored since we cannot resolve icon names
  // to React components at runtime — the components use their built-in defaults instead.
  const resolvedIconOn = typeof iconOn === "string" ? undefined : iconOn;
  const resolvedIconOff = typeof iconOff === "string" ? undefined : iconOff;
  const defaultIconOn = resolvedIconOn || <IconCheck size={12} stroke={3} />;
  const defaultIconOff = resolvedIconOff || <IconX size={12} stroke={3} />;

  // Build the Switch props with potential test ID
  const baseProps: SwitchProps = {
    ...switchProps,
    checked,
    onChange: handleChange,
    disabled: disabled || readOnly,
    label: label ? (required ? `${label} *` : label) : undefined,
    description,
    error,
    size,
    onLabel: defaultIconOn,
    offLabel: defaultIconOff,
    "aria-label": switchProps?.["aria-label"] || label || "Toggle",
    ...rest,
  };

  // Create props object with test ID support
  const switchComponentProps = testId
    ? { ...baseProps, "data-testid": testId }
    : baseProps;

  // Apply custom styling for colors
  const customStyles: SwitchProps["styles"] = {
    track: {
      backgroundColor: checked ? defaultColorOn : defaultColorOff,
      borderColor: checked ? defaultColorOn : defaultColorOff,
      cursor: disabled || readOnly ? "not-allowed" : "pointer",
    },
    thumb: {
      backgroundColor: "white",
      borderColor: checked ? defaultColorOn : defaultColorOff,
    },
    label: {
      cursor: disabled || readOnly ? "not-allowed" : "pointer",
    },
  };

  switchComponentProps.styles = customStyles;

  // Render with or without state labels
  if (showStateLabels) {
    return (
      <Box data-testid={testId ? `${testId}-container` : undefined}>
        <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Text
            size="sm"
            c={!checked ? "dimmed" : undefined}
            fw={!checked ? 500 : 400}
            data-testid={testId ? `${testId}-label-off` : undefined}
          >
            {labelOff}
          </Text>
          <Switch {...switchComponentProps} label={undefined} />
          <Text
            size="sm"
            c={checked ? undefined : "dimmed"}
            fw={checked ? 500 : 400}
            data-testid={testId ? `${testId}-label-on` : undefined}
          >
            {labelOn}
          </Text>
        </Box>
        {label && (
          <Text size="sm" mt={4}>
            {required ? `${label} *` : label}
          </Text>
        )}
        {description && (
          <Text size="xs" c="dimmed" mt={2}>
            {description}
          </Text>
        )}
        {error && (
          <Text size="xs" c="red" mt={2}>
            {error}
          </Text>
        )}
      </Box>
    );
  }

  return <Switch {...switchComponentProps} />;
};

export default Toggle;
