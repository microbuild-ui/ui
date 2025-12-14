'use client';

import React from 'react';
import { Box, Text, useMantineTheme } from '@mantine/core';
import { 
  IconInfoCircle, 
  IconCircleCheck, 
  IconAlertTriangle, 
  IconCircleX 
} from '@tabler/icons-react';

export type NoticeType = 'info' | 'success' | 'warning' | 'danger';

export interface NoticeProps {
  /** Type of notice that determines the default styling */
  type?: NoticeType;
  /** Custom icon or false to hide the icon */
  icon?: React.ReactNode | boolean;
  /** Whether to center the content */
  center?: boolean;
  /** Whether to allow multiline content with wrapping */
  multiline?: boolean;
  /** Whether to indent content to align with title (when icon is shown) */
  indentContent?: boolean;
  /** Title/heading for the notice */
  title?: string;
  /** Content for the notice body */
  children?: React.ReactNode;
  /** Custom text color */
  color?: string;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom border color */
  borderColor?: string;
  /** Custom icon color */
  iconColor?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * Get default icon for notice type
 */
const getDefaultIcon = (type: NoticeType): React.ReactNode => {
  const iconProps = { size: 24 };
  
  switch (type) {
    case 'success':
      return <IconCircleCheck {...iconProps} />;
    case 'warning':
      return <IconAlertTriangle {...iconProps} />;
    case 'danger':
      return <IconCircleX {...iconProps} />;
    case 'info':
    default:
      return <IconInfoCircle {...iconProps} />;
  }
};

/**
 * Get type-based colors from Mantine theme
 */
const getTypeColors = (type: NoticeType, theme: ReturnType<typeof useMantineTheme>) => {
  switch (type) {
    case 'success':
      return {
        iconColor: theme.colors.green[6],
        borderColor: theme.colors.green[6],
        textColor: theme.colors.gray[7],
        backgroundColor: theme.colors.gray[0],
      };
    case 'warning':
      return {
        iconColor: theme.colors.yellow[6],
        borderColor: theme.colors.yellow[6],
        textColor: theme.colors.gray[7],
        backgroundColor: theme.colors.gray[0],
      };
    case 'danger':
      return {
        iconColor: theme.colors.red[6],
        borderColor: theme.colors.red[6],
        textColor: theme.colors.red[7],
        backgroundColor: theme.colors.gray[0],
      };
    default:
      return {
        iconColor: theme.colors.blue[6],
        borderColor: theme.colors.blue[6],
        textColor: theme.colors.gray[7],
        backgroundColor: theme.colors.gray[0],
      };
  }
};

/**
 * Notice Interface Component
 * 
 * A notice/alert component that matches the Directus v-notice interface functionality.
 * Provides visual feedback for information, success, warning, and error states.
 * 
 * Features:
 * - Four notice types: info, success, warning, danger
 * - Customizable icons or hide icon completely
 * - Centered layout option
 * - Multiline text support with wrapping
 * - Content indentation to align with title
 * - Separate title and content slots
 * - Custom color theming
 * - Left border accent following Directus design
 * - Accessibility support with proper roles
 * 
 * @param props - Notice interface props
 * @returns React component
 * 
 * @example
 * ```tsx
 * // Info notice with title and content
 * <Notice type="info" title="Information">
 *   This is an informational message.
 * </Notice>
 * 
 * // Success notice with custom icon
 * <Notice type="success" icon={<CustomIcon />}>
 *   Operation completed successfully!
 * </Notice>
 * 
 * // Warning notice without icon
 * <Notice type="warning" icon={false} title="Warning">
 *   Please review your input.
 * </Notice>
 * 
 * // Danger notice centered
 * <Notice type="danger" center>
 *   An error has occurred.
 * </Notice>
 * ```
 */
export const Notice: React.FC<NoticeProps> = ({
  type = 'info',
  icon = null,
  center = false,
  multiline = false,
  indentContent = false,
  title,
  children,
  color,
  backgroundColor,
  borderColor,
  iconColor,
  'data-testid': testId,
}) => {
  const theme = useMantineTheme();
  
  // Get type-based colors
  const typeColors = getTypeColors(type, theme);
  
  // Resolve final colors (custom overrides type defaults)
  const finalIconColor = iconColor || typeColors.iconColor;
  const finalBorderColor = borderColor || typeColors.borderColor;
  const finalTextColor = color || typeColors.textColor;
  const finalBackgroundColor = backgroundColor || typeColors.backgroundColor;
  
  // Determine if icon should be shown
  const showIcon = icon !== false;
  
  // Get the icon to display
  const displayIcon = icon && icon !== true ? icon : getDefaultIcon(type);
  
  // Calculate indent padding (icon width + icon margin)
  const iconPaddingInlineEnd = 16; // 16px gap
  const iconSizeDefault = 24; // 24px icon
  const indentPadding = iconPaddingInlineEnd + iconSizeDefault;

  return (
    <Box
      data-testid={testId}
      role="alert"
      aria-live="polite"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: center ? 'center' : 'flex-start',
        justifyContent: center ? 'center' : 'flex-start',
        flexWrap: multiline ? 'wrap' : 'nowrap',
        width: 'auto',
        minHeight: '52px',
        padding: '12px 16px',
        color: finalTextColor,
        lineHeight: '22px',
        backgroundColor: finalBackgroundColor,
        borderRadius: 'var(--mantine-radius-md)',
        overflow: 'hidden',
      }}
    >
      {/* Left border accent */}
      <Box
        data-testid={testId ? `${testId}-border` : undefined}
        style={{
          content: '""',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: finalBorderColor,
        }}
      />
      
      {/* Title row with icon */}
      <Box
        data-testid={testId ? `${testId}-title` : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: 600,
          color: finalTextColor,
        }}
      >
        {showIcon && (
          <Box
            data-testid={testId ? `${testId}-icon` : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: `${iconPaddingInlineEnd}px`,
              color: finalIconColor,
            }}
          >
            {displayIcon}
          </Box>
        )}
        {title && (
          <Text
            component="span"
            fw={600}
            data-testid={testId ? `${testId}-title-text` : undefined}
          >
            {title}
          </Text>
        )}
      </Box>
      
      {/* Content */}
      {children && (
        <Box
          data-testid={testId ? `${testId}-content` : undefined}
          style={{
            width: multiline ? '100%' : 'auto',
            paddingLeft: indentContent && showIcon ? `${indentPadding}px` : undefined,
            marginTop: multiline && (title || showIcon) ? '8px' : undefined,
            marginLeft: !multiline && (title || showIcon) ? '8px' : undefined,
          }}
        >
          <Text
            size="sm"
            style={{
              color: finalTextColor,
            }}
          >
            {children}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default Notice;
