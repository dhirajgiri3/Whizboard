import { NextRequest, NextResponse } from "next/server";

interface CompanyStat {
  id: string;
  name: string;
  value: string;
  description: string;
  prefix?: string;
  suffix?: string;
  isVisible: boolean;
  order: number;
}

// In-memory data store (replace with database in production)
let companyStats: CompanyStat[] = [
  {
    id: "1",
    name: "Happy Teams",
    value: "2500",
    description: "Teams using WhizBoard daily",
    suffix: "+",
    isVisible: true,
    order: 1
  },
  {
    id: "2",
    name: "Boards Created",
    value: "50000",
    description: "Collaborative whiteboards created",
    suffix: "+",
    isVisible: true,
    order: 2
  },
  {
    id: "3",
    name: "Uptime",
    value: "95.9",
    description: "Service reliability",
    suffix: "%",
    isVisible: true,
    order: 3
  },
  {
    id: "4",
    name: "Response Time",
    value: "50",
    description: "Average response time",
    prefix: "<",
    suffix: "ms",
    isVisible: true,
    order: 4
  }
];

// GET handler - Retrieve all visible stats
export async function GET(req: NextRequest) {
  try {
    // Return only visible stats, sorted by order
    const visibleStats = companyStats
      .filter(stat => stat.isVisible)
      .sort((a, b) => a.order - b.order);
    
    return NextResponse.json(visibleStats, { status: 200 });
  } catch (error) {
    console.error('Error retrieving company stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT handler - Update stats (admin only)
export async function PUT(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Parse request body
    const updates = await req.json();
    
    // Validate structure - expect an array of stat updates
    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Expected an array of stat updates' },
        { status: 400 }
      );
    }
    
    const updatedStats = [];
    
    for (const update of updates) {
      // Validate ID
      if (!update.id) {
        return NextResponse.json(
          { error: 'Each stat update requires an ID' },
          { status: 400 }
        );
      }
      
      // Find the stat
      const statIndex = companyStats.findIndex(s => s.id === update.id);
      if (statIndex === -1) {
        return NextResponse.json(
          { error: `Stat with ID ${update.id} not found` },
          { status: 404 }
        );
      }
      
      // Update stat properties
      const updatedStat = {
        ...companyStats[statIndex],
        ...update,
        id: companyStats[statIndex].id // Ensure ID doesn't change
      };
      
      // Replace in array
      companyStats[statIndex] = updatedStat;
      updatedStats.push(updatedStat);
    }
    
    return NextResponse.json(updatedStats, { status: 200 });
  } catch (error) {
    console.error('Error updating company stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler - Add a new stat (admin only)
export async function POST(req: NextRequest) {
  try {
    // In a real app, you would check authentication here
    
    // Parse request body
    const newStat = await req.json();
    
    // Validate required fields
    if (!newStat.name || !newStat.value || !newStat.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate ID and set defaults
    const statId = Date.now().toString();
    const stat: CompanyStat = {
      id: statId,
      name: newStat.name,
      value: newStat.value,
      description: newStat.description,
      prefix: newStat.prefix || undefined,
      suffix: newStat.suffix || undefined,
      isVisible: newStat.isVisible ?? true,
      order: newStat.order || companyStats.length + 1
    };
    
    // Add to collection
    companyStats.push(stat);
    
    return NextResponse.json(stat, { status: 201 });
  } catch (error) {
    console.error('Error adding company stat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
