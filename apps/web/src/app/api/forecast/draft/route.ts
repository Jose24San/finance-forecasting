import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    // Get the draft scenario data from the request body
    const draftData = await request.json();

    console.log('📨 Next.js API received:', {
      hasDraftData: !!draftData,
      personalProfile: draftData?.personalProfile,
      assetsCount: draftData?.assets?.length || 0,
      incomeStreamsCount: draftData?.incomeStreams?.length || 0,
      assets: draftData?.assets,
      incomeStreams: draftData?.incomeStreams,
    });

    if (!draftData) {
      return NextResponse.json(
        { error: 'Draft scenario data is required' },
        { status: 400 }
      );
    }

    // Validate minimum required fields
    const { personalProfile, assets, incomeStreams } = draftData;

    console.log('🔍 Validation check:', {
      hasLocation: !!personalProfile?.location,
      location: personalProfile?.location,
      hasAssets: assets?.length > 0,
      hasIncomeStreams: incomeStreams?.length > 0,
    });

    if (
      !personalProfile?.location ||
      !assets ||
      assets.length === 0 ||
      !incomeStreams ||
      incomeStreams.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required data: location, assets, and income streams are required',
        },
        { status: 400 }
      );
    }

    // Forward the draft data to the backend API
    const response = await fetch(`${API_BASE_URL}/api/forecast/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(draftData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend API error:', errorData);

      return NextResponse.json(
        { error: 'Failed to generate draft forecast' },
        { status: response.status }
      );
    }

    const forecastData = await response.json();

    return NextResponse.json(forecastData);
  } catch (error) {
    console.error('Error generating draft forecast:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
