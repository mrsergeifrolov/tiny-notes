// Anthropic-inspired dark theme colors
export const theme = {
  colors: {
    // Background colors
    background: '#1a1a1a',
    backgroundSecondary: '#242424',
    backgroundTertiary: '#2d2d2d',

    // Surface colors (for cards, dialogs)
    surface: '#2d2d2d',
    surfaceHover: '#363636',
    surfaceActive: '#404040',

    // Text colors
    textPrimary: '#f5f5f5',
    textSecondary: '#a0a0a0',
    textMuted: '#6b6b6b',

    // Border colors
    border: '#404040',
    borderLight: '#505050',

    // Task priority colors (Anthropic palette)
    taskDefault: '#3d3d3d',
    taskOrange: '#D97706',
    taskTerracotta: '#C2410C',
    taskGrayBlue: '#64748B',
    taskGreen: '#059669',
    taskLavender: '#7C3AED',

    // State colors
    completed: '#4a4a4a',
    completedText: '#6b6b6b',

    // Accent colors
    accent: '#D97706',
    accentHover: '#B45309',
    danger: '#DC2626',
    dangerHover: '#B91C1C',

    // Today highlight
    today: '#D97706',
    todayBackground: 'rgba(217, 119, 6, 0.1)',
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
    sm: '4px',
    md: '8px',
    lg: '12px',
  },

  fontSize: {
    xs: '11px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '18px',
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
  },

  transition: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },

  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
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
