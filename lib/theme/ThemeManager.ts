export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'auto';
  colorPalette: ColorPalette;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spacing: 'compact' | 'comfortable' | 'spacious';
  fontFamily: 'sans' | 'serif' | 'mono';
  fontSize: 'small' | 'medium' | 'large';
}

export interface LayoutPreferences {
  sidebarPosition: 'left' | 'right';
  sidebarWidth: number;
  toolbarPosition: 'top' | 'bottom' | 'left' | 'right';
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

class ThemeManager {
  private themes: Map<string, Theme> = new Map();
  private currentTheme!: Theme;
  private layoutPreferences!: LayoutPreferences;
  private subscribers: Set<(theme: Theme) => void> = new Set();

  constructor() {
    this.initializeDefaultThemes();
    this.loadUserPreferences();
  }

  private initializeDefaultThemes() {
    const defaultPalettes: ColorPalette[] = [
      {
        id: 'default-light',
        name: 'Default Light',
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      {
        id: 'default-dark',
        name: 'Default Dark',
        primary: '#3b82f6',
        secondary: '#94a3b8',
        accent: '#f59e0b',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        border: '#334155',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      {
        id: 'ocean',
        name: 'Ocean',
        primary: '#0891b2',
        secondary: '#64748b',
        accent: '#06b6d4',
        background: '#f0f9ff',
        surface: '#e0f2fe',
        text: '#0c4a6e',
        textSecondary: '#0369a1',
        border: '#0284c7',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
      },
      {
        id: 'forest',
        name: 'Forest',
        primary: '#059669',
        secondary: '#64748b',
        accent: '#10b981',
        background: '#f0fdf4',
        surface: '#dcfce7',
        text: '#14532d',
        textSecondary: '#15803d',
        border: '#16a34a',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
      },
      {
        id: 'sunset',
        name: 'Sunset',
        primary: '#ea580c',
        secondary: '#64748b',
        accent: '#f97316',
        background: '#fff7ed',
        surface: '#fed7aa',
        text: '#7c2d12',
        textSecondary: '#c2410c',
        border: '#fb923c',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
      },
    ];

    const defaultThemes: Theme[] = [
      {
        id: 'default-light',
        name: 'Default Light',
        type: 'light',
        colorPalette: defaultPalettes[0],
        borderRadius: 'md',
        spacing: 'comfortable',
        fontFamily: 'sans',
        fontSize: 'medium',
      },
      {
        id: 'default-dark',
        name: 'Default Dark',
        type: 'dark',
        colorPalette: defaultPalettes[1],
        borderRadius: 'md',
        spacing: 'comfortable',
        fontFamily: 'sans',
        fontSize: 'medium',
      },
      {
        id: 'ocean-light',
        name: 'Ocean Light',
        type: 'light',
        colorPalette: defaultPalettes[2],
        borderRadius: 'lg',
        spacing: 'comfortable',
        fontFamily: 'sans',
        fontSize: 'medium',
      },
      {
        id: 'forest-light',
        name: 'Forest Light',
        type: 'light',
        colorPalette: defaultPalettes[3],
        borderRadius: 'md',
        spacing: 'spacious',
        fontFamily: 'sans',
        fontSize: 'medium',
      },
      {
        id: 'sunset-light',
        name: 'Sunset Light',
        type: 'light',
        colorPalette: defaultPalettes[4],
        borderRadius: 'xl',
        spacing: 'comfortable',
        fontFamily: 'sans',
        fontSize: 'medium',
      },
    ];

    defaultThemes.forEach(theme => {
      this.themes.set(theme.id, theme);
    });

    this.currentTheme = defaultThemes[0];
  }

  private loadUserPreferences() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }
      
      const savedTheme = localStorage.getItem('whizboard-theme');
      if (savedTheme) {
        const theme = this.themes.get(savedTheme);
        if (theme) {
          this.currentTheme = theme;
        }
      }

      const savedLayout = localStorage.getItem('whizboard-layout');
      if (savedLayout) {
        this.layoutPreferences = JSON.parse(savedLayout);
      } else {
        this.layoutPreferences = {
          sidebarPosition: 'left',
          sidebarWidth: 280,
          toolbarPosition: 'top',
          showGrid: true,
          showRulers: false,
          snapToGrid: false,
          gridSize: 20,
        };
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
  }

  public getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  public getAvailableThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  public setTheme(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (theme) {
      this.currentTheme = theme;
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('whizboard-theme', themeId);
      }
      this.applyTheme(theme);
      this.notifySubscribers();
    }
  }

  public createCustomTheme(theme: Omit<Theme, 'id'>): string {
    const id = `custom-${Date.now()}`;
    const newTheme: Theme = { ...theme, id };
    this.themes.set(id, newTheme);
    return id;
  }

  public updateTheme(themeId: string, updates: Partial<Theme>): void {
    const theme = this.themes.get(themeId);
    if (theme) {
      const updatedTheme = { ...theme, ...updates };
      this.themes.set(themeId, updatedTheme);
      
      if (themeId === this.currentTheme.id) {
        this.currentTheme = updatedTheme;
        this.applyTheme(updatedTheme);
        this.notifySubscribers();
      }
    }
  }

  public getLayoutPreferences(): LayoutPreferences {
    return this.layoutPreferences;
  }

  public updateLayoutPreferences(preferences: Partial<LayoutPreferences>): void {
    this.layoutPreferences = { ...this.layoutPreferences, ...preferences };
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('whizboard-layout', JSON.stringify(this.layoutPreferences));
    }
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    const palette = theme.colorPalette;

    // Apply CSS custom properties
    root.style.setProperty('--color-primary', palette.primary);
    root.style.setProperty('--color-secondary', palette.secondary);
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-background', palette.background);
    root.style.setProperty('--color-surface', palette.surface);
    root.style.setProperty('--color-text', palette.text);
    root.style.setProperty('--color-text-secondary', palette.textSecondary);
    root.style.setProperty('--color-border', palette.border);
    root.style.setProperty('--color-success', palette.success);
    root.style.setProperty('--color-warning', palette.warning);
    root.style.setProperty('--color-error', palette.error);

    // Apply theme properties
    root.style.setProperty('--border-radius', this.getBorderRadiusValue(theme.borderRadius));
    root.style.setProperty('--spacing-scale', this.getSpacingValue(theme.spacing));
    root.style.setProperty('--font-family', this.getFontFamilyValue(theme.fontFamily));
    root.style.setProperty('--font-size-scale', this.getFontSizeValue(theme.fontSize));

    // Apply dark/light mode
    if (theme.type === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  private getBorderRadiusValue(borderRadius: string): string {
    const values = {
      none: '0px',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
    };
    return values[borderRadius as keyof typeof values] || '0.375rem';
  }

  private getSpacingValue(spacing: string): string {
    const values = {
      compact: '0.75',
      comfortable: '1',
      spacious: '1.25',
    };
    return values[spacing as keyof typeof values] || '1';
  }

  private getFontFamilyValue(fontFamily: string): string {
    const values = {
      sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    };
    return values[fontFamily as keyof typeof values] || values.sans;
  }

  private getFontSizeValue(fontSize: string): string {
    const values = {
      small: '0.875',
      medium: '1',
      large: '1.125',
    };
    return values[fontSize as keyof typeof values] || '1';
  }

  public subscribe(callback: (theme: Theme) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      callback(this.currentTheme);
    });
  }

  public exportTheme(themeId: string): string {
    const theme = this.themes.get(themeId);
    return theme ? JSON.stringify(theme, null, 2) : '';
  }

  public importTheme(themeData: string): string | null {
    try {
      const theme: Theme = JSON.parse(themeData);
      const id = `imported-${Date.now()}`;
      const importedTheme = { ...theme, id };
      this.themes.set(id, importedTheme);
      return id;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return null;
    }
  }
}

// Lazy-loaded manager to prevent SSR issues
let _themeManager: ThemeManager | null = null;

export const getThemeManager = (): ThemeManager => {
  if (typeof window === 'undefined') {
    // Return a minimal subclass instance for SSR to satisfy type requirements
    class SSRThemeManager extends ThemeManager {
      constructor() {
        super();
      }
      public override getCurrentTheme(): Theme {
        return {
          id: 'default-light',
          name: 'Default Light',
          type: 'light',
          colorPalette: {
            id: 'default-light',
            name: 'Default Light',
            primary: '#3b82f6',
            secondary: '#64748b',
            accent: '#f59e0b',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#1e293b',
            textSecondary: '#64748b',
            border: '#e2e8f0',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
          },
          borderRadius: 'md',
          spacing: 'comfortable',
          fontFamily: 'sans',
          fontSize: 'medium',
        };
      }
      public override getAvailableThemes(): Theme[] { return []; }
      public override setTheme(_: string): void {}
      public override createCustomTheme(_: Omit<Theme, 'id'>): string { return ''; }
      public override updateTheme(_: string, __: Partial<Theme>): void {}
      public override getLayoutPreferences(): LayoutPreferences {
        return {
          sidebarPosition: 'left',
          sidebarWidth: 280,
          toolbarPosition: 'top',
          showGrid: true,
          showRulers: false,
          snapToGrid: false,
          gridSize: 20,
        };
      }
      public override updateLayoutPreferences(_: Partial<LayoutPreferences>): void {}
      public override subscribe(_: (theme: Theme) => void): () => void { return () => {}; }
      public override exportTheme(_: string): string { return ''; }
      public override importTheme(_: string): string | null { return null; }
    }
    return new SSRThemeManager();
  }
  
  if (!_themeManager) {
    _themeManager = new ThemeManager();
  }
  
  return _themeManager;
};


