// Anthropic/Claude Design System Theme
export const theme = {
  colors: {
    // Background colors - deep charcoal palette
    background: '#131314',
    backgroundSecondary: '#1a1a1c',
    backgroundTertiary: '#232326',
    backgroundElevated: '#2a2a2d',

    // Surface colors (for cards, dialogs)
    surface: '#1e1e20',
    surfaceHover: '#272729',
    surfaceActive: '#303033',

    // Text colors - warm whites and grays
    textPrimary: '#faf9f0',
    textSecondary: '#b8b5a8',
    textMuted: '#7c7a70',
    textDisabled: '#5a5850',

    // Border colors
    border: '#3a3a3d',
    borderSubtle: '#2d2d30',

    // Task priority colors - refined palette
    taskDefault: '#3d3d40',
    taskOrange: '#d97757',
    taskTerracotta: '#c45a3b',
    taskGrayBlue: '#5a6b7a',
    taskGreen: '#4d8a6e',
    taskLavender: '#7a6ba8',

    // State colors
    completed: '#2a2a2d',
    completedText: '#5a5850',

    // Accent colors - Anthropic terracotta
    accent: '#d97757',
    accentHover: '#c4664a',
    danger: '#d94f4f',
    dangerHover: '#c43d3d',

    // Today highlight
    today: '#d97757',
    todayBackground: 'rgba(217, 119, 87, 0.08)',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },

  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '18px',
  },

  fontSize: {
    xs: '13px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '22px',
    xxl: '28px',
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  transition: {
    fast: '120ms ease-out',
    normal: '200ms ease-out',
    slow: '300ms ease-out',
  },

  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.25)',
    md: '0 4px 12px rgba(0, 0, 0, 0.3)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.4)',
    elevated: '0 12px 40px rgba(0, 0, 0, 0.5)',
  },
};

export type Theme = typeof theme;

// Helper to get task color
export function getTaskColor(color?: string): string {
  switch (color) {
    case 'orange': return theme.colors.taskOrange;
    case 'terracotta': return theme.colors.taskTerracotta;
    case 'gray-blue': return theme.colors.taskGrayBlue;
    case 'green': return theme.colors.taskGreen;
    case 'lavender': return theme.colors.taskLavender;
    default: return theme.colors.taskDefault;
  }
}
