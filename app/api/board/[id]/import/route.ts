import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
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

const IMPORT_BOARD_ELEMENTS = gql`
  mutation ImportBoardElements($boardId: String!, $elements: [ElementInput!]!) {
    importBoardElements(boardId: $boardId, elements: $elements) {
      id
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
`;

const ADD_BOARD_ACTION = gql`
  mutation AddBoardAction($boardId: String!, $action: String!) {
    addBoardAction(boardId: $boardId, action: $action) {
      id
      elements {
        id
        type
        data
      }
    }
  }
`;

export async function POST(
  request: NextRequest,
  { params }: any
) {
  try {
    const client = createApolloClientForRequest(request);
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const importType = formData.get('type') as string; // 'json', 'image', 'template'
    const importOptions = JSON.parse((formData.get('options') as string) || '{}');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

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

    let elements: any[] = [];

    switch (importType) {
      case 'json':
        elements = await handleJSONImport(file, importOptions);
        break;
      case 'image':
        elements = await handleImageImport(file, importOptions);
        break;
      case 'template':
        elements = await handleTemplateImport(file, importOptions);
        break;
      default:
        return NextResponse.json({ error: 'Invalid import type' }, { status: 400 });
    }

    if (elements.length === 0) {
      return NextResponse.json({ error: 'No valid elements to import' }, { status: 400 });
    }

    // Import elements to board
    const { data: importData } = await client.mutate({
      mutation: IMPORT_BOARD_ELEMENTS,
      variables: {
        boardId: params.id,
        elements: elements.map(element => ({
          type: element.type,
          data: JSON.stringify(element.data),
          style: JSON.stringify(element.style || {}),
          createdBy: session.user.email,
        })),
      },
    });

    // Add import action to history
    await client.mutate({
      mutation: ADD_BOARD_ACTION,
      variables: {
        boardId: params.id,
        action: JSON.stringify({
          type: 'import',
          importType,
          elementCount: elements.length,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      importedElements: elements.length,
      board: importData.importBoardElements,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to import content' },
      { status: 500 }
    );
  }
}

async function handleJSONImport(file: File, options: any): Promise<any[]> {
  const text = await file.text();
  const importData = JSON.parse(text);

  // Validate import format
  if (!importData.version || !importData.board) {
    throw new Error('Invalid JSON import format');
  }

  // Check version compatibility
  const version = importData.version;
  if (!isVersionCompatible(version, options.targetVersion || '1.0.0')) {
    throw new Error(`Version ${version} is not compatible with current version`);
  }

  const elements = importData.board.elements || [];
  
  // Transform elements to current format if needed
  return transformElementsForImport(elements, version, options.targetVersion || '1.0.0');
}

async function handleImageImport(file: File, options: any): Promise<any[]> {
  const arrayBuffer = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  
  // Create image element
  const imageElement = {
    type: 'image',
    data: {
      src: `data:${file.type};base64,${base64}`,
      width: options.width || 300,
      height: options.height || 200,
      x: options.x || 100,
      y: options.y || 100,
    },
    style: {
      opacity: 1,
      rotation: 0,
    },
  };

  return [imageElement];
}

async function handleTemplateImport(file: File, options: any): Promise<any[]> {
  const text = await file.text();
  const templateData = JSON.parse(text);

  if (!templateData.template || !templateData.elements) {
    throw new Error('Invalid template format');
  }

  // Apply template transformations
  const elements = templateData.elements.map((element: any) => {
    // Adjust positions based on import location
    if (options.importPosition) {
      element.x = (element.x || 0) + options.importPosition.x;
      element.y = (element.y || 0) + options.importPosition.y;
    }

    // Apply template scaling if specified
    if (options.scale) {
      element.width = (element.width || 100) * options.scale;
      element.height = (element.height || 100) * options.scale;
      if (element.data && element.data.points) {
        element.data.points = element.data.points.map((point: number, index: number) => {
          return index % 2 === 0 ? point * options.scale : point * options.scale;
        });
      }
    }

    return element;
  });

  return elements;
}

function isVersionCompatible(importVersion: string, targetVersion: string): boolean {
  const [importMajor, importMinor] = importVersion.split('.').map(Number);
  const [targetMajor, targetMinor] = targetVersion.split('.').map(Number);

  // Allow import if major version matches and minor version is not higher
  return importMajor === targetMajor && importMinor <= targetMinor;
}

function transformElementsForImport(elements: any[], fromVersion: string, toVersion: string): any[] {
  // Handle version-specific transformations
  if (fromVersion === '1.0.0' && toVersion === '1.0.0') {
    return elements; // No transformation needed
  }

  // Transform elements to current format
  return elements.map(element => {
    // Handle legacy element formats
    if (element.type === 'drawing' && !element.data) {
      return {
        ...element,
        type: 'path',
        data: {
          points: element.points || [],
          strokeWidth: element.strokeWidth || 2,
          color: element.color || '#000000',
        },
      };
    }

    // Handle legacy sticky note format
    if (element.type === 'sticky-note' && !element.data) {
      return {
        ...element,
        data: {
          text: element.text || '',
          color: element.color || '#ffff00',
          fontSize: element.fontSize || 14,
        },
      };
    }

    return element;
  });
}

// Template library endpoint
export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Return available templates
    const templates = await getAvailableTemplates(category || undefined, search || undefined);

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Template fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

async function getAvailableTemplates(category?: string, search?: string): Promise<any[]> {
  // This would typically fetch from a database or template service
  const templates = [
    {
      id: 'basic-flowchart',
      name: 'Basic Flowchart',
      category: 'workflow',
      description: 'Simple flowchart template with basic shapes',
      thumbnail: '/templates/basic-flowchart.png',
      elements: [
        {
          type: 'shape',
          shapeType: 'rectangle',
          x: 100,
          y: 100,
          width: 120,
          height: 60,
          style: {
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 2,
          },
        },
        {
          type: 'text',
          x: 110,
          y: 120,
          text: 'Start',
          formatting: {
            fontSize: 16,
            color: '#000000',
            fontFamily: 'Arial',
          },
        },
      ],
    },
    {
      id: 'mind-map',
      name: 'Mind Map',
      category: 'organization',
      description: 'Mind mapping template with central topic and branches',
      thumbnail: '/templates/mind-map.png',
      elements: [
        {
          type: 'shape',
          shapeType: 'circle',
          x: 300,
          y: 200,
          width: 80,
          height: 80,
          style: {
            fill: '#e3f2fd',
            stroke: '#1976d2',
            strokeWidth: 3,
          },
        },
        {
          type: 'text',
          x: 320,
          y: 230,
          text: 'Central Topic',
          formatting: {
            fontSize: 14,
            color: '#1976d2',
            fontFamily: 'Arial',
            bold: true,
          },
        },
      ],
    },
    {
      id: 'kanban-board',
      name: 'Kanban Board',
      category: 'workflow',
      description: 'Kanban board template with columns for task management',
      thumbnail: '/templates/kanban-board.png',
      elements: [
        {
          type: 'frame',
          x: 50,
          y: 50,
          width: 200,
          height: 400,
          name: 'To Do',
          frameType: 'workflow',
          style: {
            fill: '#f5f5f5',
            stroke: '#e0e0e0',
            strokeWidth: 2,
          },
        },
        {
          type: 'frame',
          x: 270,
          y: 50,
          width: 200,
          height: 400,
          name: 'In Progress',
          frameType: 'workflow',
          style: {
            fill: '#fff3e0',
            stroke: '#ff9800',
            strokeWidth: 2,
          },
        },
        {
          type: 'frame',
          x: 490,
          y: 50,
          width: 200,
          height: 400,
          name: 'Done',
          frameType: 'workflow',
          style: {
            fill: '#e8f5e8',
            stroke: '#4caf50',
            strokeWidth: 2,
          },
        },
      ],
    },
  ];

  // Filter by category and search
  let filteredTemplates = templates;
  
  if (category) {
    filteredTemplates = filteredTemplates.filter(t => t.category === category);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTemplates = filteredTemplates.filter(t => 
      t.name.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower)
    );
  }

  return filteredTemplates;
} 