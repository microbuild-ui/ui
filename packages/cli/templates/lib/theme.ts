"use client";

import { createTheme } from "@mantine/core";

export const theme = createTheme({
  colors: {
    primary: [
      "var(--ds-primary-100, #ece6fb)",
      "var(--ds-primary-200, #cfcbfd)",
      "var(--ds-primary-300, #a29bfb)",
      "var(--ds-primary-400, #7857ff)",
      "var(--ds-primary, #5925dc)",
      "var(--ds-primary-600, #491db6)",
      "var(--ds-primary-700, #39178e)",
      "var(--ds-primary-800, #291167)",
      "var(--ds-primary-900, #190a3f)",
      "var(--ds-primary-950, #0f0629)"
    ],
    secondary: [
      "var(--ds-secondary-100, #ebf1ff)",
      "var(--ds-secondary-200, #d3e2ff)",
      "var(--ds-secondary-300, #99bbff)",
      "var(--ds-secondary-400, #70a0ff)",
      "var(--ds-secondary, #1f69ff)",
      "var(--ds-secondary-600, #004ff0)",
      "var(--ds-secondary-700, #0040c2)",
      "var(--ds-secondary-800, #003194)",
      "var(--ds-secondary-900, #002266)",
      "var(--ds-secondary-950, #001a4d)"
    ],
    success: [
      "var(--ds-success-100, #ecfbee)",
      "var(--ds-success-200, #c4e8c8)",
      "var(--ds-success-300, #9dd9a3)",
      "var(--ds-success-400, #58be62)",
      "var(--ds-success-500, #3bb346)",
      "var(--ds-success, #198754)",
      "var(--ds-success-700, #2da337)",
      "var(--ds-success-800, #196f25)",
      "var(--ds-success-900, #0d4f15)",
      "var(--ds-success-950, #0a3e11)"
    ],
    info: [
      "var(--ds-info-100, #e6f3fb)",
      "var(--ds-info-200, #b9d8ee)",
      "var(--ds-info-300, #90c1e4)",
      "var(--ds-info-400, #58a1d4)",
      "var(--ds-info-500, #59a1d4)",
      "var(--ds-info, #0f71bb)",
      "var(--ds-info-700, #0c5b97)",
      "var(--ds-info-800, #0a4776)",
      "var(--ds-info-900, #08395e)",
      "var(--ds-info-950, #062b47)"
    ],
    warning: [
      "var(--ds-warning-100, #fffaeb)",
      "var(--ds-warning-200, #fef0c7)",
      "var(--ds-warning-300, #fedf89)",
      "var(--ds-warning-400, #fec84b)",
      "var(--ds-warning-500, #fdb022)",
      "var(--ds-warning, #f79009)",
      "var(--ds-warning-700, #dc6803)",
      "var(--ds-warning-800, #b7571e)",
      "var(--ds-warning-900, #8f4419)",
      "var(--ds-warning-950, #6d3314)"
    ],
    danger: [
      "var(--ds-danger-100, #fff4f3)",
      "var(--ds-danger-200, #ffcfc8)",
      "var(--ds-danger-300, #fc9c90)",
      "var(--ds-danger-400, #fb7463)",
      "var(--ds-danger-500, #fa5741)",
      "var(--ds-danger, #d7260f)",
      "var(--ds-danger-700, #f8331c)",
      "var(--ds-danger-800, #c4281a)",
      "var(--ds-danger-900, #9a1f15)",
      "var(--ds-danger-950, #72170f)"
    ],
    gray: [
      "var(--ds-gray-100, #f7f7f9)",
      "var(--ds-gray-200, #e4e7ec)",
      "var(--ds-gray-300, #d0d5dd)",
      "var(--ds-gray-400, #98a2b3)",
      "var(--ds-gray-500, #667085)",
      "var(--ds-gray-600, #344054)",
      "var(--ds-gray-700, #1d2939)",
      "var(--ds-gray-800, #101828)",
      "var(--ds-gray-900, #000000)",
      "var(--ds-gray-950, #000000)"
    ]
  },
  primaryColor: "primary",
  fontFamily: "var(--ds-font-family)",
  fontFamilyMonospace:
    "SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
  headings: {
    fontWeight: "700",
    fontFamily: "var(--ds-font-family)"
  },
  fontSizes: {
    xs: "var(--ds-font-size-xs)",
    sm: "var(--ds-font-size-sm)",
    md: "var(--ds-font-size-base)",
    lg: "var(--ds-font-size-lg)",
    xl: "var(--ds-font-size-2xl)"
  },
  spacing: {
    xs: "var(--ds-spacing-2)",
    sm: "var(--ds-spacing-4)",
    md: "var(--ds-spacing-6)",
    lg: "var(--ds-spacing-8)",
    xl: "var(--ds-spacing-10)"
  },
  radius: {
    xs: "var(--ds-radius-sm)",
    sm: "var(--ds-radius)",
    md: "var(--ds-radius-md)",
    lg: "var(--ds-radius-lg)",
    xl: "var(--ds-radius-xl)"
  },
  shadows: {
    xs: "var(--ds-shadow-sm)",
    sm: "var(--ds-shadow-sm)",
    md: "var(--ds-shadow)",
    lg: "var(--ds-shadow-lg)",
    xl: "var(--ds-shadow-xl)"
  },
  components: {
    Button: {
      styles: {
        root: {
          borderRadius: "var(--mantine-radius-xs)",
          fontWeight: "400",
          fontSize: "var(--mantine-font-size-md)",
          padding: "0.5rem 1rem",
          transition:
            "color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
        }
      }
    },
    Input: {
      styles: {
        input: {
          borderRadius: "var(--mantine-radius-xs)",
          borderColor: "var(--mantine-color-gray-4)",
          fontSize: "var(--mantine-font-size-md)",
          padding: "0.5rem 1rem",
          transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
        }
      }
    },
    Card: {
      styles: {
        root: {
          borderRadius: "var(--mantine-radius-xs)",
          borderColor: "var(--mantine-color-gray-4)",
          padding: "1.5rem"
        }
      }
    },
    Paper: {
      styles: {
        root: {
          borderRadius: "var(--mantine-radius-xs)"
        }
      }
    },
    Modal: {
      styles: {
        header: {
          borderBottom: "1px solid var(--ds-gray-200)",
          padding: "var(--ds-spacing-4)",
          marginBottom: 0
        },
        title: {
          fontWeight: 600,
          fontSize: "var(--ds-font-size-lg)"
        },
        body: {
          padding: "var(--ds-spacing-4)"
        },
        content: {
          borderRadius: "var(--ds-radius-lg)"
        },
        close: {
          color: "var(--ds-gray-500)"
        }
      }
    },
    Popover: {
      styles: {
        dropdown: {
          borderRadius: "var(--mantine-radius-sm)",
          boxShadow: "var(--mantine-shadow-md)",
          padding: "var(--mantine-spacing-md)"
        }
      }
    },
    Badge: {
      styles: {
        root: {
          borderRadius: "var(--mantine-radius-xs)",
          fontSize: "0.875rem",
          fontWeight: "700",
          padding: "0.285em 0.571em"
        }
      }
    },
    TextInput: {
      styles: {
        label: {
          fontSize: "var(--mantine-font-size-sm)",
          fontWeight: "500",
          marginBottom: "var(--mantine-spacing-xs)"
        },
        input: {
          fontFamily: "var(--mantine-font-family)"
        }
      }
    },
    NumberInput: {
      styles: {
        label: {
          fontSize: "var(--mantine-font-size-sm)",
          fontWeight: "500",
          marginBottom: "var(--mantine-spacing-xs)"
        }
      }
    },
    Group: {
      defaultProps: {
        gap: "sm"
      }
    },
    Stack: {
      defaultProps: {
        gap: "md"
      }
    }
  }
});
