import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { gql } from '@apollo/client';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { googleDriveService } from '@/lib/integrations/googleDriveService';
import { getToken } from '@/lib/integrations/tokenStore';

function createApolloClientForRequest(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const uri = `${origin}/api/graphql`;
  const httpLink = createHttpLink({
    uri,
    fetch,
    credentials: 'include',
    headers: {
      cookie: request.headers.get('cookie') || '',
    },
  } as any);

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
}

export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    const resolvedParams = params;
    const client = createApolloClientForRequest(request);
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'png';
    const resolution = searchParams.get('resolution') || '1x';
    const background = searchParams.get('background') || 'transparent';
    const area = searchParams.get('area') || 'all';
    const customBackground = searchParams.get('customBackground') || undefined;
    const bounds = searchParams.get('bounds') || undefined;
    const viewport = searchParams.get('viewport') || undefined;
    const quality = searchParams.get('quality') || 'high';
    const includeMetadata = searchParams.get('includeMetadata') === 'true';
    const compression = searchParams.get('compression') !== 'false';
    const saveToGoogleDrive = searchParams.get('saveToGoogleDrive') === 'true';
    const googleDriveFolderId = searchParams.get('googleDriveFolderId') || undefined;

    // Get board with elements
    const { data: boardData } = await client.query({
      query: gql`
        query GetBoard($id: String!) {
          getBoard(id: $id) {
            id
            name
            isPublic
            createdBy
            collaborators {
              id
              email
            }
            elements {
              id
              type
              data
              style
              createdBy
              createdAt
              updatedAt
            }
          }
        }
      `,
      variables: { id: resolvedParams.id },
      fetchPolicy: 'no-cache',
    });

    if (!boardData?.getBoard) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const board = boardData.getBoard;
    const userEmail = session.user.email;
    const userId = (session as any).user?.id;
    const hasAccess = board.isPublic || (board.createdBy === userId) || (Array.isArray(board.collaborators) && board.collaborators.some(
      (collaborator: any) => collaborator?.email === userEmail || collaborator?.id === userId
    ));

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const elements = board.elements || [];

    // Check if user wants to save to Google Drive
    if (saveToGoogleDrive) {
      // Check if user has Google Drive connected
      const token = await getToken(userEmail, 'googleDrive');
      if (!token) {
        return NextResponse.json({ error: 'Google Drive not connected. Please connect your Google Drive account in settings.' }, { status: 403 });
      }

             return await handleGoogleDriveExport(board, elements, format, resolution, background, area, userEmail, quality, includeMetadata, compression, customBackground, bounds, viewport, googleDriveFolderId);
    }

    switch (format.toLowerCase()) {
      case 'png':
        return await handlePNGExport(board, elements, resolution, background, area, customBackground, bounds, viewport, quality, compression);
      case 'svg':
        return await handleSVGExport(board, elements, resolution, background, area, customBackground, bounds, viewport, quality);
      case 'json':
      default:
        return await handleJSONExport(board, elements, includeMetadata);
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export board' },
      { status: 500 }
    );
  }
}

import { createCanvas } from 'canvas';

/**
 * Enhanced bounding box calculation that considers all element types
 * and provides comprehensive coverage of the canvas content
 */
function calculateComprehensiveBoardBounds(elements: any[]) {
  if (elements.length === 0) {
    return { x: 0, y: 0, width: 1200, height: 800 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let hasValidElements = false;

  elements.forEach(element => {
    try {
      const data = typeof element.data === 'string' ? JSON.parse(element.data) : element.data;
      const style = typeof element.style === 'string' ? JSON.parse(element.style) : element.style || {};
      
      // Handle different element structures
      let elementData = data;
      let elementStyle = style;
      
      // If the element itself is a line (no type field), treat it as a drawing line
      if (data && data.points && Array.isArray(data.points) && !data.type) {
        // This is a direct line object (ILine format)
        elementData = data;
        elementStyle = {};
      } else if (element.type) {
        // This is a typed element (DrawingElement format)
        elementData = data;
        elementStyle = style;
      }
      
      // Check if this is a drawing line (either by type or by structure)
      if (element.type === 'path' || element.type === 'line' || 
          (elementData && elementData.points && Array.isArray(elementData.points))) {
        
        if (elementData.points && Array.isArray(elementData.points)) {
          const points = elementData.points;
          const strokeWidth = elementData.strokeWidth || elementStyle.strokeWidth || 2;
          const strokePadding = strokeWidth / 2;
          
          for (let i = 0; i < points.length; i += 2) {
            const x = points[i];
            const y = points[i + 1];
            if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
              minX = Math.min(minX, x - strokePadding);
              minY = Math.min(minY, y - strokePadding);
              maxX = Math.max(maxX, x + strokePadding);
              maxY = Math.max(maxY, y + strokePadding);
              hasValidElements = true;
            }
          }
        }
      } else if (element.type === 'text') {
          
        const textX = elementData.x || 0;
        const textY = elementData.y || 0;
        const textWidth = elementData.width || 200;
        const textHeight = elementData.height || 50;
        const fontSize = elementData.fontSize || elementStyle.fontSize || 16;
        
        minX = Math.min(minX, textX);
        minY = Math.min(minY, textY - fontSize); // Account for text baseline
        maxX = Math.max(maxX, textX + textWidth);
        maxY = Math.max(maxY, textY + textHeight);
        hasValidElements = true;
      } else if (element.type === 'shape' || element.type === 'rectangle' || element.type === 'circle') {
        const shapeX = elementData.x || elementData.position?.x || 0;
        const shapeY = elementData.y || elementData.position?.y || 0;
        const shapeWidth = elementData.width || elementData.dimensions?.width || 100;
        const shapeHeight = elementData.height || elementData.dimensions?.height || 100;
        
        minX = Math.min(minX, shapeX);
        minY = Math.min(minY, shapeY);
        maxX = Math.max(maxX, shapeX + shapeWidth);
        maxY = Math.max(maxY, shapeY + shapeHeight);
        hasValidElements = true;
      } else if (element.type === 'sticky-note') {
        const noteX = elementData.x || 0;
        const noteY = elementData.y || 0;
        const noteWidth = elementData.width || 200;
        const noteHeight = elementData.height || 150;
        
        minX = Math.min(minX, noteX);
        minY = Math.min(minY, noteY);
        maxX = Math.max(maxX, noteX + noteWidth);
        maxY = Math.max(maxY, noteY + noteHeight);
        hasValidElements = true;
      } else if (element.type === 'frame') {
        const frameX = elementData.x || 0;
        const frameY = elementData.y || 0;
        const frameWidth = elementData.width || 400;
        const frameHeight = elementData.height || 300;
        
        minX = Math.min(minX, frameX);
        minY = Math.min(minY, frameY);
        maxX = Math.max(maxX, frameX + frameWidth);
        maxY = Math.max(maxY, frameY + frameHeight);
        hasValidElements = true;
      }
    } catch (error) {
      console.error('Error parsing element data for bounds calculation:', error);
    }
  });

  // If no valid elements found, return default bounds
  if (!hasValidElements) {
    return { x: 0, y: 0, width: 1200, height: 800 };
  }

  // Add padding to ensure all content is captured
  const padding = 50;
  const bounds = {
    x: Math.floor(minX - padding),
    y: Math.floor(minY - padding),
    width: Math.ceil(maxX - minX + padding * 2),
    height: Math.ceil(maxY - minY + padding * 2),
  };

  // Ensure minimum dimensions
  bounds.width = Math.max(bounds.width, 800);
  bounds.height = Math.max(bounds.height, 600);

  return bounds;
}

/**
 * Get resolution multiplier for high-quality exports
 */
function getResolutionMultiplier(resolution: string): number {
  switch (resolution) {
    case '2x': return 2;
    case '4x': return 4;
    case '8x': return 8;
    default: return 1;
  }
}

/**
 * Enhanced PNG export with comprehensive element rendering
 */
async function handlePNGExport(board: any, elements: any[], resolution: string, background: string, area: string, customBackground?: string, bounds?: string, viewport?: string, quality: string = 'high', compression: boolean = true) {
  console.log('Exporting board:', board.name, 'with', elements.length, 'elements');
  console.log('Export settings:', { resolution, background, area, quality, compression });
  
  // Parse viewport information if provided
  let viewportData = null;
  if (viewport) {
    try {
      viewportData = JSON.parse(viewport);
      console.log('Viewport data:', viewportData);
    } catch (error) {
      console.error('Error parsing viewport data:', error);
    }
  }
  
  // Calculate bounds based on area type
  let boardBounds;
  if (area === 'viewport' && viewportData) {
    // Use viewport bounds for viewport export
    boardBounds = {
      x: viewportData.position?.x || 0,
      y: viewportData.position?.y || 0,
      width: viewportData.bounds?.width || 1200,
      height: viewportData.bounds?.height || 800,
    };
  } else {
    // Use comprehensive bounds for full export
    boardBounds = calculateComprehensiveBoardBounds(elements);
  }
  
  console.log('Export bounds:', boardBounds);
  
  // Adjust scale based on quality setting
  let scale = getResolutionMultiplier(resolution);
  if (quality === 'ultra') {
    scale *= 1.5;
  } else if (quality === 'standard') {
    scale *= 0.75;
  }
  
  // Create high-resolution canvas
  const canvasWidth = boardBounds.width * scale;
  const canvasHeight = boardBounds.height * scale;
  
  let canvas;
  let ctx;
  
  try {
    canvas = createCanvas(canvasWidth, canvasHeight);
    ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
  } catch (error) {
    console.error('Canvas creation error:', error);
    // Fallback to SVG
    const fallbackSvg = `<svg width="${boardBounds.width}" height="${boardBounds.height}" viewBox="0 0 ${boardBounds.width} ${boardBounds.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#666666" text-anchor="middle" dominant-baseline="middle">Canvas Export Failed - Using SVG Fallback</text>
    </svg>`;
    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${board.name}-export.svg"`,
      },
    });
  }

  // Set background
  if (background === 'transparent') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    const bgColor = background === 'custom' ? customBackground : background === 'white' ? '#ffffff' : '#000000';
    ctx.fillStyle = bgColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Scale and translate context for high-resolution rendering
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-boardBounds.x, -boardBounds.y);

  // Render all elements with enhanced quality
  for (const element of elements) {
    console.log('Rendering element:', element.type, element.data);
    await renderElementToCanvasEnhanced(ctx, element, scale);
  }
  
  // If no elements were rendered, add a placeholder
  if (elements.length === 0) {
    console.log('No elements found, adding placeholder');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
    ctx.fillStyle = '#666666';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Empty Canvas', (canvas.width / scale) / 2, (canvas.height / scale) / 2);
  }

  ctx.restore();

  // Convert to PNG buffer with quality settings
  const compressionLevel = compression ? 6 : 0; // 0 = no compression, 6 = max compression
  const buffer = canvas.toBuffer('image/png', { compressionLevel });
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${board.name}-export.png"`,
    },
  });
}

/**
 * Enhanced SVG export with comprehensive element support
 */
async function handleSVGExport(board: any, elements: any[], resolution: string, background: string, area: string, customBackground?: string, bounds?: string, viewport?: string, quality: string = 'high') {
  console.log('Exporting SVG for board:', board.name, 'with', elements.length, 'elements');
  
  // Calculate comprehensive board bounds
  const boardBounds = calculateComprehensiveBoardBounds(elements);
  console.log('SVG board bounds:', boardBounds);
  
  // Generate enhanced SVG content
  const svgContent = generateEnhancedSVGContent(board, elements, boardBounds, background, customBackground);
  
  // If no elements were found, add a placeholder
  if (elements.length === 0) {
    console.log('No elements found for SVG, adding placeholder');
    const placeholderSvg = `<svg width="${boardBounds.width}" height="${boardBounds.height}" viewBox="0 0 ${boardBounds.width} ${boardBounds.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#666666" text-anchor="middle" dominant-baseline="middle">Empty Canvas</text>
    </svg>`;
    return new NextResponse(placeholderSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${board.name}-export.svg"`,
      },
    });
  }
  
  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `attachment; filename="${board.name}-export.svg"`,
    },
  });
}

/**
 * Enhanced JSON export with comprehensive metadata
 */
async function handleJSONExport(board: any, elements: any[], includeMetadata: boolean = true) {
  const exportData = {
    version: '1.0.0',
    board: {
      id: board.id,
      name: board.name,
      isPublic: board.isPublic,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      createdBy: board.createdBy,
      elements: elements.map(element => ({
        id: element.id,
        type: element.type,
        data: typeof element.data === 'string' ? JSON.parse(element.data) : element.data,
        style: typeof element.style === 'string' ? JSON.parse(element.style) : element.style,
        createdBy: element.createdBy,
        createdAt: element.createdAt,
        updatedAt: element.updatedAt,
      })),
      metadata: includeMetadata ? {
        exportedAt: new Date().toISOString(),
        totalElements: elements.length,
        exportFormat: 'json',
        bounds: calculateComprehensiveBoardBounds(elements),
        elementTypes: elements.reduce((acc: any, el) => {
          acc[el.type] = (acc[el.type] || 0) + 1;
          return acc;
        }, {}),
        exportSettings: {
          includeMetadata,
          quality: 'high',
          compression: false,
        },
      } : undefined,
    },
  };

  return NextResponse.json(exportData, {
    headers: {
      'Content-Disposition': `attachment; filename="${board.name}-export.json"`,
    },
  });
}

/**
 * Enhanced element rendering with high-quality output
 */
async function renderElementToCanvasEnhanced(ctx: any, element: any, scale: number = 1) {
  try {
    const data = typeof element.data === 'string' ? JSON.parse(element.data) : element.data;
    const style = typeof element.style === 'string' ? JSON.parse(element.style) : element.style || {};

    // Handle different element structures
    let elementData = data;
    let elementStyle = style;
    
    // If the element itself is a line (no type field), treat it as a drawing line
    if (data && data.points && Array.isArray(data.points) && !data.type) {
      // This is a direct line object (ILine format)
      elementData = data;
      elementStyle = {};
    } else if (element.type) {
      // This is a typed element (DrawingElement format)
      elementData = data;
      elementStyle = style;
    }

    // Check if this is a drawing line (either by type or by structure)
    if (element.type === 'path' || element.type === 'line' || 
        (elementData && elementData.points && Array.isArray(elementData.points))) {
      
      if (elementData.points && Array.isArray(elementData.points)) {
        const points = elementData.points;
        if (points.length >= 4) {
          const strokeColor = elementData.color || elementStyle.stroke || elementStyle.color || '#000000';
          const strokeWidth = (elementData.strokeWidth || elementStyle.strokeWidth || 2) * scale;
          
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(points[0], points[1]);
          for (let i = 2; i < points.length; i += 2) {
            ctx.lineTo(points[i], points[i + 1]);
          }
          ctx.stroke();
        }
      }
    } else if (element.type === 'text') {
      const textX = elementData.x || 0;
      const textY = elementData.y || 0;
      const textContent = elementData.text || '';
      const fontSize = (elementData.fontSize || elementStyle.fontSize || 16) * scale;
      const fontFamily = elementData.fontFamily || elementStyle.fontFamily || 'Arial';
      const textColor = elementData.color || elementStyle.color || '#000000';
      
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'top';
      ctx.fillText(textContent, textX, textY);
    } else if (element.type === 'shape' || element.type === 'rectangle') {
        
            const rectX = elementData.x || elementData.position?.x || 0;
      const rectY = elementData.y || elementData.position?.y || 0;
      const rectWidth = elementData.width || elementData.dimensions?.width || 100;
      const rectHeight = elementData.height || elementData.dimensions?.height || 100;
      
      const fillColor = elementData.fill || elementStyle.fill || '#ffffff';
      const strokeColor = elementData.stroke || elementStyle.stroke || '#000000';
      const strokeWidth = (elementData.strokeWidth || elementStyle.strokeWidth || 1) * scale;
      
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      
      ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
      ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
    } else if (element.type === 'circle') {
      const circleX = elementData.x || elementData.position?.x || 0;
      const circleY = elementData.y || elementData.position?.y || 0;
      const circleWidth = elementData.width || elementData.dimensions?.width || 100;
      const circleHeight = elementData.height || elementData.dimensions?.height || 100;
      const radius = Math.min(circleWidth, circleHeight) / 2;
      
      const circleFillColor = elementData.fill || elementStyle.fill || '#ffffff';
      const circleStrokeColor = elementData.stroke || elementStyle.stroke || '#000000';
      const circleStrokeWidth = (elementData.strokeWidth || elementStyle.strokeWidth || 1) * scale;
      
      ctx.fillStyle = circleFillColor;
      ctx.strokeStyle = circleStrokeColor;
      ctx.lineWidth = circleStrokeWidth;
      
      ctx.beginPath();
      ctx.arc(circleX + radius, circleY + radius, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    } else if (element.type === 'sticky-note') {
      const noteX = elementData.x || 0;
      const noteY = elementData.y || 0;
      const noteWidth = elementData.width || 200;
      const noteHeight = elementData.height || 150;
      const noteColor = elementData.color || '#ffff00';
      const noteText = elementData.text || '';
      
      // Draw sticky note background with shadow
      ctx.fillStyle = noteColor;
      ctx.fillRect(noteX, noteY, noteWidth, noteHeight);
      
      // Draw border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(noteX, noteY, noteWidth, noteHeight);
      
      // Draw text with proper positioning
      ctx.fillStyle = '#000000';
      ctx.font = `${14 * scale}px Arial`;
      ctx.textBaseline = 'top';
      ctx.fillText(noteText, noteX + 10, noteY + 10);
    } else if (element.type === 'frame') {
              const frameX = elementData.x || 0;
      const frameY = elementData.y || 0;
      const frameWidth = elementData.width || 400;
      const frameHeight = elementData.height || 300;
      const frameName = elementData.name || 'Frame';
      
      // Draw frame background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
      
      // Draw frame border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);
      
      // Draw frame title
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${16 * scale}px Arial`;
      ctx.textBaseline = 'top';
      ctx.fillText(frameName, frameX + 10, frameY + 10);
    }
  } catch (error) {
    console.error('Error rendering element to canvas:', error);
  }
}

/**
 * Generate enhanced SVG content with comprehensive element support
 */
function generateEnhancedSVGContent(board: any, elements: any[], bounds: any, background: string, customBackground?: string) {
  const bgColor = background === 'custom' ? customBackground : background === 'white' ? '#ffffff' : background === 'black' ? '#000000' : 'none';
  
  let svg = `<svg width="${bounds.width}" height="${bounds.height}" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" xmlns="http://www.w3.org/2000/svg">`;
  
  if (bgColor !== 'none') {
    svg += `<rect width="100%" height="100%" fill="${bgColor}"/>`;
  }

  // Add elements as SVG with enhanced quality
  elements.forEach(element => {
    try {
      const data = typeof element.data === 'string' ? JSON.parse(element.data) : element.data;
      const style = typeof element.style === 'string' ? JSON.parse(element.style) : element.style || {};

      // Handle different element structures
      let elementData = data;
      let elementStyle = style;
      
      // If the element itself is a line (no type field), treat it as a drawing line
      if (data && data.points && Array.isArray(data.points) && !data.type) {
        // This is a direct line object (ILine format)
        elementData = data;
        elementStyle = {};
      } else if (element.type) {
        // This is a typed element (DrawingElement format)
        elementData = data;
        elementStyle = style;
      }

      // Check if this is a drawing line (either by type or by structure)
      if (element.type === 'path' || element.type === 'line' || 
          (elementData && elementData.points && Array.isArray(elementData.points))) {
        
        if (elementData.points && Array.isArray(elementData.points)) {
          const points = elementData.points;
          if (points.length >= 4) {
            let pathData = `M ${points[0]} ${points[1]}`;
            for (let i = 2; i < points.length; i += 2) {
              pathData += ` L ${points[i]} ${points[i + 1]}`;
            }
            const strokeColor = elementData.color || elementStyle.stroke || elementStyle.color || '#000000';
            const strokeWidth = elementData.strokeWidth || elementStyle.strokeWidth || 2;
            svg += `<path d="${pathData}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
          }
        }
      } else if (element.type === 'text') {
        const textX = elementData.x || 0;
        const textY = elementData.y || 0;
        const textContent = elementData.text || '';
        const fontSize = elementData.fontSize || elementStyle.fontSize || 16;
        const fontFamily = elementData.fontFamily || elementStyle.fontFamily || 'Arial';
        const textColor = elementData.color || elementStyle.color || '#000000';
        
        svg += `<text x="${textX}" y="${textY + fontSize}" font-family="${fontFamily}" font-size="${fontSize}" fill="${textColor}">${textContent}</text>`;
      } else if (element.type === 'shape' || element.type === 'rectangle') {
          
        const rectX = elementData.x || elementData.position?.x || 0;
        const rectY = elementData.y || elementData.position?.y || 0;
        const rectWidth = elementData.width || elementData.dimensions?.width || 100;
        const rectHeight = elementData.height || elementData.dimensions?.height || 100;
        const rectFill = elementData.fill || elementStyle.fill || '#ffffff';
        const rectStroke = elementData.stroke || elementStyle.stroke || '#000000';
        const rectStrokeWidth = elementData.strokeWidth || elementStyle.strokeWidth || 1;
        
        svg += `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="${rectFill}" stroke="${rectStroke}" stroke-width="${rectStrokeWidth}"/>`;
      } else if (element.type === 'circle') {
        const circleX = elementData.x || elementData.position?.x || 0;
        const circleY = elementData.y || elementData.position?.y || 0;
        const circleWidth = elementData.width || elementData.dimensions?.width || 100;
        const circleHeight = elementData.height || elementData.dimensions?.height || 100;
        const radius = Math.min(circleWidth, circleHeight) / 2;
        const circleFill = elementData.fill || elementStyle.fill || '#ffffff';
        const circleStroke = elementData.stroke || elementStyle.stroke || '#000000';
        const circleStrokeWidth = elementData.strokeWidth || elementStyle.strokeWidth || 1;
        
        svg += `<circle cx="${circleX + radius}" cy="${circleY + radius}" r="${radius}" fill="${circleFill}" stroke="${circleStroke}" stroke-width="${circleStrokeWidth}"/>`;
      } else if (element.type === 'sticky-note') {
        const noteX = elementData.x || 0;
        const noteY = elementData.y || 0;
        const noteWidth = elementData.width || 200;
        const noteHeight = elementData.height || 150;
        const noteColor = elementData.color || '#ffff00';
        const noteText = elementData.text || '';
        
        svg += `<rect x="${noteX}" y="${noteY}" width="${noteWidth}" height="${noteHeight}" fill="${noteColor}" stroke="#000000" stroke-width="1"/>`;
        svg += `<text x="${noteX + 10}" y="${noteY + 20}" font-family="Arial" font-size="14" fill="#000000">${noteText}</text>`;
      } else if (element.type === 'frame') {
        const frameX = elementData.x || 0;
        const frameY = elementData.y || 0;
        const frameWidth = elementData.width || 400;
        const frameHeight = elementData.height || 300;
        const frameName = elementData.name || 'Frame';
        
        svg += `<rect x="${frameX}" y="${frameY}" width="${frameWidth}" height="${frameHeight}" fill="rgba(255,255,255,0.1)" stroke="#000000" stroke-width="2"/>`;
        svg += `<text x="${frameX + 10}" y="${frameY + 25}" font-family="Arial" font-size="16" font-weight="bold" fill="#000000">${frameName}</text>`;
      }
    } catch (error) {
      console.error('Error rendering element to SVG:', error);
    }
  });

  svg += '</svg>';
  return svg;
} 

/**
 * Handle Google Drive export
 */
async function handleGoogleDriveExport(
  board: any, 
  elements: any[], 
  format: string, 
  resolution: string, 
  background: string, 
  area: string, 
  userEmail: string,
  quality: string = 'high', 
  includeMetadata: boolean = true, 
  compression: boolean = true,
  customBackground?: string, 
  bounds?: string, 
  viewport?: string, 
  folderId?: string
) {
  try {
    let fileData: string | Buffer;
    let fileName: string;
    let mimeType: string;

    // Generate the export data based on format
    switch (format.toLowerCase()) {
      case 'png':
        const pngBuffer = await generatePNGBuffer(board, elements, resolution, background, area, customBackground, bounds, viewport, quality, compression);
        fileData = pngBuffer;
        fileName = `${board.name}-export.png`;
        mimeType = 'image/png';
        break;
      case 'svg':
        const svgContent = generateSVGContent(board, elements, resolution, background, area, customBackground, bounds, viewport, quality);
        fileData = svgContent;
        fileName = `${board.name}-export.svg`;
        mimeType = 'image/svg+xml';
        break;
      case 'json':
      default:
        const jsonContent = generateJSONContent(board, elements, includeMetadata);
        fileData = JSON.stringify(jsonContent, null, 2);
        fileName = `${board.name}-export.json`;
        mimeType = 'application/json';
        break;
    }

    // Get or create Whizboard folder if no specific folder is provided
    let targetFolderId = folderId;
    if (!targetFolderId) {
      const whizboardFolder = await googleDriveService.getOrCreateWhizboardFolder(userEmail);
      if (whizboardFolder) {
        targetFolderId = whizboardFolder.id;
        console.log(`Using Whizboard folder: ${whizboardFolder.id}`);
      }
    }

    // Upload to Google Drive
    const result = await googleDriveService.uploadFile(
      userEmail,
      fileName,
      fileData,
      mimeType,
      targetFolderId || undefined
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to upload to Google Drive' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Board exported successfully to Google Drive',
      fileId: result.fileId,
      fileName: fileName,
      file: result.file,
      googleDriveUrl: result.file?.webViewLink
    });

  } catch (error) {
    console.error('Google Drive export error:', error);
    return NextResponse.json({ error: 'Failed to export to Google Drive' }, { status: 500 });
  }
}

/**
 * Generate PNG buffer for Google Drive upload
 */
async function generatePNGBuffer(board: any, elements: any[], resolution: string, background: string, area: string, customBackground?: string, bounds?: string, viewport?: string, quality: string = 'high', compression: boolean = true) {
  // Parse viewport information if provided
  let viewportData = null;
  if (viewport) {
    try {
      viewportData = JSON.parse(viewport);
    } catch (error) {
      console.error('Error parsing viewport data:', error);
    }
  }
  
  // Calculate bounds based on area type
  let boardBounds;
  if (area === 'viewport' && viewportData) {
    boardBounds = {
      x: viewportData.position?.x || 0,
      y: viewportData.position?.y || 0,
      width: viewportData.bounds?.width || 1200,
      height: viewportData.bounds?.height || 800,
    };
  } else {
    boardBounds = calculateComprehensiveBoardBounds(elements);
  }
  
  // Adjust scale based on quality setting
  let scale = getResolutionMultiplier(resolution);
  if (quality === 'ultra') {
    scale *= 1.5;
  } else if (quality === 'standard') {
    scale *= 0.75;
  }
  
  // Create high-resolution canvas
  const canvasWidth = boardBounds.width * scale;
  const canvasHeight = boardBounds.height * scale;
  
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // Set background
  if (background === 'transparent') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    const bgColor = background === 'custom' ? customBackground : background === 'white' ? '#ffffff' : '#000000';
    ctx.fillStyle = bgColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Scale and translate context for high-resolution rendering
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-boardBounds.x, -boardBounds.y);

  // Render all elements
  for (const element of elements) {
    await renderElementToCanvasEnhanced(ctx, element, scale);
  }
  
  // If no elements were rendered, add a placeholder
  if (elements.length === 0) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
    ctx.fillStyle = '#666666';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Empty Canvas', (canvas.width / scale) / 2, (canvas.height / scale) / 2);
  }

  ctx.restore();

  // Convert to PNG buffer
  const compressionLevel = compression ? 6 : 0;
  return canvas.toBuffer('image/png', { compressionLevel });
}

/**
 * Generate SVG content for Google Drive upload
 */
function generateSVGContent(board: any, elements: any[], resolution: string, background: string, area: string, customBackground?: string, bounds?: string, viewport?: string, quality: string = 'high') {
  const boardBounds = calculateComprehensiveBoardBounds(elements);
  return generateEnhancedSVGContent(board, elements, boardBounds, background, customBackground);
}

/**
 * Generate JSON content for Google Drive upload
 */
function generateJSONContent(board: any, elements: any[], includeMetadata: boolean = true) {
  return {
    version: '1.0.0',
    board: {
      id: board.id,
      name: board.name,
      isPublic: board.isPublic,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      createdBy: board.createdBy,
      elements: elements.map(element => ({
        id: element.id,
        type: element.type,
        data: typeof element.data === 'string' ? JSON.parse(element.data) : element.data,
        style: typeof element.style === 'string' ? JSON.parse(element.style) : element.style,
        createdBy: element.createdBy,
        createdAt: element.createdAt,
        updatedAt: element.updatedAt,
      })),
      metadata: includeMetadata ? {
        exportedAt: new Date().toISOString(),
        totalElements: elements.length,
        exportFormat: 'json',
        bounds: calculateComprehensiveBoardBounds(elements),
        elementTypes: elements.reduce((acc: any, el) => {
          acc[el.type] = (acc[el.type] || 0) + 1;
          return acc;
        }, {}),
        exportSettings: {
          includeMetadata,
          quality: 'high',
          compression: false,
        },
      } : undefined,
    },
  };
} 