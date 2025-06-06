import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(
  request: NextRequest,
  { params }: { params: { scenarioId: string } }
) {
  try {
    const { scenarioId } = params;

    if (!scenarioId) {
      return NextResponse.json(
        { error: 'Scenario ID is required' },
        { status: 400 }
      );
    }

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/forecast/${scenarioId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend API error:', errorData);

      return NextResponse.json(
        { error: 'Failed to generate forecast' },
        { status: response.status }
      );
    }

    const forecastData = await response.json();

    return NextResponse.json(forecastData);
  } catch (error) {
    console.error('Error proxying forecast request:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
