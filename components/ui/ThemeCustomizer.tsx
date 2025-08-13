'use client';

import { useState, useEffect } from 'react';
import { getThemeManager, Theme, ColorPalette, LayoutPreferences } from '@/lib/theme/ThemeManager';
import { Palette, Layout, Eye, Download, Upload, Settings, Monitor, Moon, Sun } from 'lucide-react';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeCustomizer = ({ isOpen, onClose }: ThemeCustomizerProps) => {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [layoutPreferences, setLayoutPreferences] = useState<LayoutPreferences | null>(null);
  const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'layout' | 'accessibility'>('themes');
  const [customPalette, setCustomPalette] = useState<ColorPalette | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const manager = getThemeManager();
      setCurrentTheme(manager.getCurrentTheme());
      setLayoutPreferences(manager.getLayoutPreferences());
      setCustomPalette(manager.getCurrentTheme().colorPalette);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const manager = getThemeManager();
    const unsubscribe = manager.subscribe((theme) => {
      setCurrentTheme(theme);
      setCustomPalette(theme.colorPalette);
    });

    return unsubscribe;
  }, [isMounted]);

  const handleThemeChange = (themeId: string) => {
    getThemeManager().setTheme(themeId);
  };

  const handleColorChange = (colorKey: keyof ColorPalette, value: string) => {
    const updatedPalette = { ...customPalette, [colorKey]: value };
    setCustomPalette(updatedPalette);
    
    const updatedTheme = { ...currentTheme, colorPalette: updatedPalette };
    getThemeManager().updateTheme(currentTheme.id, updatedTheme);
  };

  const handleLayoutChange = (key: keyof LayoutPreferences, value: any) => {
    const updatedLayout = { ...layoutPreferences, [key]: value };
    setLayoutPreferences(updatedLayout);
    getThemeManager().updateLayoutPreferences(updatedLayout);
  };

  const exportCurrentTheme = () => {
    const themeData = getThemeManager().exportTheme(currentTheme.id);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTheme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const themeData = e.target?.result as string;
        const manager = getThemeManager();
        const themeId = manager.importTheme(themeData);
        if (themeId) {
          manager.setTheme(themeId);
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen || !isMounted || !currentTheme || !layoutPreferences || !customPalette) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Theme Customization</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => setActiveTab('themes')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'themes' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Palette className="w-5 h-5" />
                Themes
              </button>
              <button
                onClick={() => setActiveTab('colors')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'colors' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Palette className="w-5 h-5" />
                Colors
              </button>
              <button
                onClick={() => setActiveTab('layout')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'layout' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Layout className="w-5 h-5" />
                Layout
              </button>
              <button
                onClick={() => setActiveTab('accessibility')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'accessibility' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Eye className="w-5 h-5" />
                Accessibility
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'themes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Available Themes</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={exportCurrentTheme}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <label className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Import
                      <input type="file" accept=".json" onChange={importTheme} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getThemeManager().getAvailableThemes().map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        currentTheme.id === theme.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{theme.name}</h4>
                        <div className="flex items-center gap-1">
                          {theme.type === 'light' && <Sun className="w-4 h-4" />}
                          {theme.type === 'dark' && <Moon className="w-4 h-4" />}
                          {theme.type === 'auto' && <Monitor className="w-4 h-4" />}
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-1">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colorPalette.primary }} />
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colorPalette.secondary }} />
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colorPalette.accent }} />
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colorPalette.background }} />
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: theme.colorPalette.surface }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'colors' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Color Palette</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(customPalette).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => handleColorChange(key as keyof ColorPalette, e.target.value)}
                          className="w-12 h-8 rounded border"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleColorChange(key as keyof ColorPalette, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Layout Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Sidebar Position</label>
                    <select
                      value={layoutPreferences.sidebarPosition}
                      onChange={(e) => handleLayoutChange('sidebarPosition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sidebar Width</label>
                    <input
                      type="range"
                      min="200"
                      max="400"
                      step="10"
                      value={layoutPreferences.sidebarWidth}
                      onChange={(e) => handleLayoutChange('sidebarWidth', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-500">{layoutPreferences.sidebarWidth}px</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Toolbar Position</label>
                    <select
                      value={layoutPreferences.toolbarPosition}
                      onChange={(e) => handleLayoutChange('toolbarPosition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layoutPreferences.showGrid}
                        onChange={(e) => handleLayoutChange('showGrid', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Show Grid</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layoutPreferences.showRulers}
                        onChange={(e) => handleLayoutChange('showRulers', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Show Rulers</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layoutPreferences.snapToGrid}
                        onChange={(e) => handleLayoutChange('snapToGrid', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Snap to Grid</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Grid Size</label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={layoutPreferences.gridSize}
                      onChange={(e) => handleLayoutChange('gridSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-500">{layoutPreferences.gridSize}px</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Accessibility Features</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Font Size</label>
                    <select
                      value={currentTheme.fontSize}
                      onChange={(e) => getThemeManager().updateTheme(currentTheme.id, { fontSize: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Font Family</label>
                    <select
                      value={currentTheme.fontFamily}
                      onChange={(e) => getThemeManager().updateTheme(currentTheme.id, { fontFamily: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="sans">Sans Serif</option>
                      <option value="serif">Serif</option>
                      <option value="mono">Monospace</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Border Radius</label>
                    <select
                      value={currentTheme.borderRadius}
                      onChange={(e) => getThemeManager().updateTheme(currentTheme.id, { borderRadius: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="none">None</option>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Spacing</label>
                    <select
                      value={currentTheme.spacing}
                      onChange={(e) => getThemeManager().updateTheme(currentTheme.id, { spacing: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    >
                      <option value="compact">Compact</option>
                      <option value="comfortable">Comfortable</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium mb-2">High Contrast Mode</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Enhance text and element contrast for better visibility.
                    </p>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                      Enable High Contrast
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
