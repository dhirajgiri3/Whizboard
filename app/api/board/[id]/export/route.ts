import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { gql } from '@apollo/client';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

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

const GET_BOARD_ELEMENTS = gql`
  query GetBoardElements($boardId: String!) {
    getBoardElements(boardId: $boardId) {
      id
      type
      data
      style
      position
      dimensions
      createdAt
      updatedAt
    }
  }
`;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    const customBackground = searchParams.get('customBackground');
    const bounds = searchParams.get('bounds');

    // Check board access
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
          }
        }
      `,
      variables: { id: params.id },
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

    // Get board elements
    const { data: elementsData } = await client.query({
      query: GET_BOARD_ELEMENTS,
      variables: { boardId: params.id },
      fetchPolicy: 'no-cache',
    });

    const elements = elementsData?.getBoardElements || [];

    switch (format.toLowerCase()) {
      case 'png':
        return await handlePNGExport(board, elements, resolution, background, area, customBackground, bounds);
      case 'svg':
        return await handleSVGExport(board, elements, resolution, background, area, customBackground, bounds);
      case 'json':
      default:
        return await handleJSONExport(board, elements);
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export board' },
      { status: 500 }
    );
  }
}

async function handlePNGExport(board: any, elements: any[], resolution: string, background: string, area: string, customBackground?: string, bounds?: string) {
  // Calculate board bounds
  const boardBounds = calculateBoardBounds(elements);
  
  // Create canvas for rendering
  const canvas = new OffscreenCanvas(
    boardBounds.width * getResolutionMultiplier(resolution),
    boardBounds.height * getResolutionMultiplier(resolution)
  );
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set background
  if (background === 'transparent') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    const bgColor = background === 'custom' ? customBackground : background === 'white' ? '#ffffff' : '#000000';
    ctx.fillStyle = bgColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Render elements to canvas
  await renderBoardToCanvas(ctx as OffscreenCanvasRenderingContext2D, elements, boardBounds, getResolutionMultiplier(resolution));

  // Convert to blob
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  
  return new NextResponse(blob, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${board.name}-export.png"`,
    },
  });
}

async function handleSVGExport(board: any, elements: any[], resolution: string, background: string, area: string, customBackground?: string, bounds?: string) {
  // Calculate board bounds
  const boardBounds = calculateBoardBounds(elements);
  
  // Generate SVG content
  const svgContent = generateSVGContent(board, elements, boardBounds, background, customBackground);
  
  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': `attachment; filename="${board.name}-export.svg"`,
    },
  });
}

async function handleJSONExport(board: any, elements: any[]) {
  const exportData = {
    version: '1.0.0',
    board: {
      id: board.id,
      name: board.name,
      elements: elements,
      metadata: {
        exportedAt: new Date().toISOString(),
        totalElements: elements.length,
      },
    },
  };

  return NextResponse.json(exportData, {
    headers: {
      'Content-Disposition': `attachment; filename="${board.name}-export.json"`,
    },
  });
}

function calculateBoardBounds(elements: any[]) {
  if (elements.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  elements.forEach(element => {
    const pos = element.position || { x: 0, y: 0 };
    const dims = element.dimensions || { width: 100, height: 100 };
    
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + dims.width);
    maxY = Math.max(maxY, pos.y + dims.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function getResolutionMultiplier(resolution: string): number {
  switch (resolution) {
    case '2x': return 2;
    case '4x': return 4;
    default: return 1;
  }
}

async function renderBoardToCanvas(ctx: OffscreenCanvasRenderingContext2D, elements: any[], bounds: any, scale: number) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-bounds.x, -bounds.y);

  for (const element of elements) {
    await renderElementToCanvas(ctx, element);
  }

  ctx.restore();
}

async function renderElementToCanvas(ctx: OffscreenCanvasRenderingContext2D, element: any) {
  const pos = element.position || { x: 0, y: 0 };
  const dims = element.dimensions || { width: 100, height: 100 };
  const style = element.style || {};

  ctx.save();
  ctx.translate(pos.x, pos.y);

  switch (element.type) {
    case 'text':
      ctx.font = `${style.fontSize || 16}px ${style.fontFamily || 'Arial'}`;
      ctx.fillStyle = style.color || '#000000';
      ctx.fillText(element.data?.text || '', 0, 0);
      break;
      
    case 'shape':
      ctx.fillStyle = style.fillColor || '#ffffff';
      ctx.strokeStyle = style.strokeColor || '#000000';
      ctx.lineWidth = style.strokeWidth || 1;
      
      if (element.data?.shape === 'rectangle') {
        ctx.fillRect(0, 0, dims.width, dims.height);
        ctx.strokeRect(0, 0, dims.width, dims.height);
      } else if (element.data?.shape === 'circle') {
        const radius = Math.min(dims.width, dims.height) / 2;
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      break;
      
    case 'image':
      // Placeholder rendering for images
      ctx.fillStyle = '#cccccc';
      ctx.fillRect(0, 0, dims.width, dims.height);
      break;
      
    case 'line':
      ctx.strokeStyle = style.strokeColor || '#000000';
      ctx.lineWidth = style.strokeWidth || 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(dims.width, dims.height);
      ctx.stroke();
      break;
  }

  ctx.restore();
}

function generateSVGContent(board: any, elements: any[], bounds: any, background: string, customBackground?: string) {
  const bgColor = background === 'custom' ? customBackground : background === 'white' ? '#ffffff' : background === 'black' ? '#000000' : 'none';
  
  let svg = `<svg width="${bounds.width}" height="${bounds.height}" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" xmlns="http://www.w3.org/2000/svg">`;
  
  if (bgColor !== 'none') {
    svg += `<rect width="100%" height="100%" fill="${bgColor}"/>`;
  }

  // Add elements as SVG
  elements.forEach(element => {
    const pos = element.position || { x: 0, y: 0 };
    const dims = element.dimensions || { width: 100, height: 100 };
    const style = element.style || {};

    switch (element.type) {
      case 'text':
        svg += `<text x="${pos.x}" y="${pos.y}" font-family="${style.fontFamily || 'Arial'}" font-size="${style.fontSize || 16}" fill="${style.color || '#000000'}">${element.data?.text || ''}</text>`;
        break;
        
      case 'shape':
        if (element.data?.shape === 'rectangle') {
          svg += `<rect x="${pos.x}" y="${pos.y}" width="${dims.width}" height="${dims.height}" fill="${style.fillColor || '#ffffff'}" stroke="${style.strokeColor || '#000000'}" stroke-width="${style.strokeWidth || 1}"/>`;
        } else if (element.data?.shape === 'circle') {
          const radius = Math.min(dims.width, dims.height) / 2;
          svg += `<circle cx="${pos.x + radius}" cy="${pos.y + radius}" r="${radius}" fill="${style.fillColor || '#ffffff'}" stroke="${style.strokeColor || '#000000'}" stroke-width="${style.strokeWidth || 1}"/>`;
        }
        break;
        
      case 'line':
        svg += `<line x1="${pos.x}" y1="${pos.y}" x2="${pos.x + dims.width}" y2="${pos.y + dims.height}" stroke="${style.strokeColor || '#000000'}" stroke-width="${style.strokeWidth || 2}"/>`;
        break;
    }
  });

  svg += '</svg>';
  return svg;
} 