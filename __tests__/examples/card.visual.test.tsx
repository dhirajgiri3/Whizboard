/**
 * Visual regression test for Card component
 * 
 * This test demonstrates how to use the visual regression testing utilities
 * to test UI components for visual regressions.
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { setupVisualRegressionTesting } from '../utils/visual-regression-setup';

// Mock a card component for testing
const Card = ({ 
  title = 'Card Title',
  content = 'Card content goes here',
  footer = 'Card Footer',
  variant = 'default',
}) => {
  // Styles based on variant
  const variantStyles = {
    default: {
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
    },
    elevated: {
      backgroundColor: 'white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    outlined: {
      backgroundColor: 'white',
      border: '2px solid #3b82f6',
    },
  }[variant] || variantStyles.default;
  
  return (
    <div
      style={{
        ...variantStyles,
        borderRadius: '8px',
        overflow: 'hidden',
        width: '300px',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: 'bold',
          fontSize: '18px',
        }}
      >
        {title}
      </div>
      <div
        style={{
          padding: '16px',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        {content}
      </div>
      {footer && (
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            fontSize: '14px',
            color: '#6b7280',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

describe('Card Component Visual Tests', () => {
  // Set up visual regression testing
  const visualTest = setupVisualRegressionTesting();
  
  it('should render a card with different variants', async () => {
    // Test default card
    await visualTest.renderComponent(
      <Card
        title="Default Card"
        content="This is a default card with a border."
        footer="Card Footer"
        variant="default"
      />
    );
    await visualTest.takePageScreenshot({ name: 'card-default' });
    
    // Test elevated card
    await visualTest.renderComponent(
      <Card
        title="Elevated Card"
        content="This is an elevated card with a shadow."
        footer="Card Footer"
        variant="elevated"
      />
    );
    await visualTest.takePageScreenshot({ name: 'card-elevated' });
    
    // Test outlined card
    await visualTest.renderComponent(
      <Card
        title="Outlined Card"
        content="This is an outlined card with a colored border."
        footer="Card Footer"
        variant="outlined"
      />
    );
    await visualTest.takePageScreenshot({ name: 'card-outlined' });
  });
  
  it('should render a card without a footer', async () => {
    // Test card without footer
    await visualTest.renderComponent(
      <Card
        title="No Footer Card"
        content="This card has no footer section."
        footer=""
      />
    );
    await visualTest.takePageScreenshot({ name: 'card-no-footer' });
  });
  
  it('should render a card with a long content', async () => {
    // Test card with long content
    await visualTest.renderComponent(
      <Card
        title="Long Content Card"
        content="This card has a very long content that should wrap to multiple lines. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        footer="Card Footer"
      />
    );
    await visualTest.takePageScreenshot({ name: 'card-long-content' });
  });
  
  it('should render cards with different themes', async () => {
    // Test card with different themes
    await visualTest.renderComponentWithThemes(
      <Card
        title="Themed Card"
        content="This card is rendered with different themes."
        footer="Card Footer"
      />,
      {
        themes: ['light', 'dark'],
        name: 'card-themed',
      }
    );
  });
});
