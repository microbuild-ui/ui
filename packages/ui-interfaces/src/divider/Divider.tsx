'use client';

import React from 'react';
import { Box, Text, useMantineTheme } from '@mantine/core';

export interface DividerProps {
  /** Title content for the divider */
  title?: string;
  /** Icon to display before the title */
  icon?: React.ReactNode;
  /** Whether the divider is vertical */
  vertical?: boolean;
  /** Whether the title is displayed inline with the divider line */
  inlineTitle?: boolean;
  /** Whether to use larger styling */
  large?: boolean;
  /** Whether the divider is disabled (affects text color) */
  disabled?: boolean;
  /** Color of the divider line */
  color?: string;
  /** Color of the label text */
  labelColor?: string;
  /** Thickness of the divider line */
  thickness?: number;
  /** Margin around the divider */
  margin?: number | string;
  /** Test ID for testing purposes */
  'data-testid'?: string;
}

/**
 * Divider Interface Component
 * 
 * A flexible divider component that supports:
 * - Horizontal and vertical orientations
 * - Optional title/label with icon
 * - Inline or stacked title positioning
 * - Large styling variant
 * - Customizable colors and thickness
 * 
 * Matches the DaaS divider interface functionality.
 * 
 * @example
 * // Simple horizontal divider
 * <Divider />
 * 
 * @example
 * // Divider with title
 * <Divider title="Section Title" />
 * 
 * @example
 * // Inline title with icon
 * <Divider title="Settings" icon={<IconSettings />} inlineTitle />
 * 
 * @example
 * // Vertical divider
 * <Divider vertical />
 * 
 * @example
 * // Large styled divider
 * <Divider title="Main Section" large />
 */
export const Divider: React.FC<DividerProps> = ({
  title,
  icon,
  vertical = false,
  inlineTitle = false,
  large = false,
  disabled = false,
  color,
  labelColor,
  thickness,
  margin,
  'data-testid': testId,
}) => {
  const theme = useMantineTheme();
  
  // Use title as the text content
  const textContent = title;
  const hasContent = Boolean(textContent || icon);
  
  // Determine colors
  const dividerColor = color || theme.colors.gray[3];
  const textColor = labelColor || (disabled ? theme.colors.gray[5] : theme.colors.gray[7]);
  const dividerThickness = thickness || 1;
  
  // Vertical divider styling
  if (vertical) {
    return (
      <Box
        data-testid={testId}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          alignSelf: 'stretch',
          height: '100%',
          margin: typeof margin === 'number' ? margin : undefined,
        }}
        aria-orientation="vertical"
      >
        {hasContent && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginBottom: 8,
              color: textColor,
            }}
            data-testid={testId ? `${testId}-wrapper` : undefined}
          >
            {icon && (
              <Box 
                data-testid={testId ? `${testId}-icon` : undefined}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {icon}
              </Box>
            )}
            {textContent && (
              <Text
                size={large ? 'xl' : 'sm'}
                fw={large ? 700 : 600}
                c={textColor}
                data-testid={testId ? `${testId}-label` : undefined}
                style={{
                  fontFamily: large ? theme.headings.fontFamily : undefined,
                }}
              >
                {textContent}
              </Text>
            )}
          </Box>
        )}
        <Box
          data-testid={testId ? `${testId}-line` : undefined}
          style={{
            flex: 1,
            width: dividerThickness,
            minHeight: 20,
            backgroundColor: dividerColor,
          }}
          role="separator"
          aria-orientation="vertical"
        />
      </Box>
    );
  }
  
  // Horizontal divider with inline title
  if (inlineTitle && hasContent) {
    return (
      <Box
        data-testid={testId}
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          overflow: 'visible',
          margin: typeof margin === 'number' ? margin : undefined,
        }}
        aria-orientation="horizontal"
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginRight: 8,
            color: textColor,
          }}
          data-testid={testId ? `${testId}-wrapper` : undefined}
        >
          {icon && (
            <Box 
              data-testid={testId ? `${testId}-icon` : undefined}
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                transform: 'translateY(-1px)',
              }}
            >
              {icon}
            </Box>
          )}
          {textContent && (
            <Text
              size={large ? 'xl' : 'sm'}
              fw={large ? 700 : 600}
              c={textColor}
              data-testid={testId ? `${testId}-label` : undefined}
              style={{
                fontFamily: large ? theme.headings.fontFamily : undefined,
                transition: 'color 150ms ease',
              }}
            >
              {textContent}
            </Text>
          )}
        </Box>
        <Box
          data-testid={testId ? `${testId}-line` : undefined}
          style={{
            flex: 1,
            height: dividerThickness,
            backgroundColor: dividerColor,
          }}
          role="separator"
          aria-orientation="horizontal"
        />
      </Box>
    );
  }
  
  // Horizontal divider with stacked title (not inline)
  if (!inlineTitle && hasContent) {
    return (
      <Box
        data-testid={testId}
        style={{
          flex: '1 1 0',
          flexWrap: 'wrap',
          alignItems: 'center',
          overflow: 'visible',
          margin: typeof margin === 'number' ? margin : undefined,
        }}
        aria-orientation="horizontal"
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: textColor,
          }}
          data-testid={testId ? `${testId}-wrapper` : undefined}
        >
          {icon && (
            <Box 
              data-testid={testId ? `${testId}-icon` : undefined}
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                transform: 'translateY(-1px)',
              }}
            >
              {icon}
            </Box>
          )}
          {textContent && (
            <Text
              size={large ? 'xl' : 'sm'}
              fw={large ? 700 : 600}
              c={textColor}
              data-testid={testId ? `${testId}-label` : undefined}
              style={{
                width: '100%',
                fontFamily: large ? theme.headings.fontFamily : undefined,
                transition: 'color 150ms ease',
              }}
            >
              {textContent}
            </Text>
          )}
        </Box>
        <Box
          data-testid={testId ? `${testId}-line` : undefined}
          style={{
            flexGrow: 1,
            maxWidth: '100%',
            marginTop: 8,
            height: dividerThickness,
            backgroundColor: dividerColor,
          }}
          role="separator"
          aria-orientation="horizontal"
        />
      </Box>
    );
  }
  
  // Simple horizontal divider (no content)
  return (
    <Box
      data-testid={testId}
      style={{
        width: '100%',
        margin: typeof margin === 'number' ? margin : undefined,
      }}
      aria-orientation="horizontal"
    >
      <Box
        data-testid={testId ? `${testId}-line` : undefined}
        style={{
          width: '100%',
          height: dividerThickness,
          backgroundColor: dividerColor,
        }}
        role="separator"
        aria-orientation="horizontal"
      />
    </Box>
  );
};

export default Divider;
