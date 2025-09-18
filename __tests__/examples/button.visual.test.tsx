/**
 * Visual regression test for Button component
 * 
 * This test demonstrates how to use the visual regression testing utilities
 * to test UI components for visual regressions.
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { setupVisualRegressionTesting } from '../utils/visual-regression-setup';

// Mock a simple button component for testing
const Button = ({ 
  variant = 'primary',
  size = 'medium',
  children = 'Button',
  disabled = false,
}) => {
  // Styles based on variant
  const variantStyles = {
    primary: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'white',
      color: '#3b82f6',
      border: '1px solid #3b82f6',
    },
    danger: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
    },
  }[variant] || variantStyles.primary;
  
  // Styles based on size
  const sizeStyles = {
    small: {
      padding: '4px 8px',
      fontSize: '12px',
      borderRadius: '4px',
    },
    medium: {
      padding: '8px 16px',
      fontSize: '14px',
      borderRadius: '6px',
    },
    large: {
      padding: '12px 24px',
      fontSize: '16px',
      borderRadius: '8px',
    },
  }[size] || sizeStyles.medium;
  
  // Disabled styles
  const disabledStyles = disabled ? {
    opacity: 0.5,
    cursor: 'not-allowed',
  } : {
    cursor: 'pointer',
  };
  
  return (
    <button
      style={{
        ...variantStyles,
        ...sizeStyles,
        ...disabledStyles,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        transition: 'all 0.2s ease',
      }}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

describe('Button Component Visual Tests', () => {
  // Set up visual regression testing
  const visualTest = setupVisualRegressionTesting();
  
  it('should render a button with different variants', async () => {
    // Test primary button
    await visualTest.renderComponent(
      <Button variant="primary">Primary Button</Button>
    );
    await visualTest.takePageScreenshot({ name: 'button-primary' });
    
    // Test secondary button
    await visualTest.renderComponent(
      <Button variant="secondary">Secondary Button</Button>
    );
    await visualTest.takePageScreenshot({ name: 'button-secondary' });
    
    // Test danger button
    await visualTest.renderComponent(
      <Button variant="danger">Danger Button</Button>
    );
    await visualTest.takePageScreenshot({ name: 'button-danger' });
  });
  
  it('should render a button with different sizes', async () => {
    // Test small button
    await visualTest.renderComponent(
      <Button size="small">Small Button</Button>
    );
    await visualTest.takePageScreenshot({ name: 'button-small' });
    
    // Test medium button
    await visualTest.renderComponent(
      <Button size="medium">Medium Button</Button>
    );
    await visualTest.takePageScreenshot({ name: 'button-medium' });
    
    // Test large button
    await visualTest.renderComponent(
      <Button size="large">Large Button</Button>
    );
    await visualTest.takePageScreenshot({ name: 'button-large' });
  });
  
  it('should render a disabled button', async () => {
    // Test disabled button
    await visualTest.renderComponent(
      <Button disabled>Disabled Button</Button>
    );
    await visualTest.takePageScreenshot({ name: 'button-disabled' });
  });
  
  it('should render buttons with different themes', async () => {
    // Test button with different themes
    await visualTest.renderComponentWithThemes(
      <Button variant="primary">Themed Button</Button>,
      {
        themes: ['light', 'dark'],
        name: 'button-themed',
      }
    );
  });
});
