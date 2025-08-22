import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const Bot = require('telegraf');
    const bot = new Bot(process.env.BOT_TOKEN!);
    
    const userProfile = await bot.telegram.getUserProfilePhotos(parseInt(userId));
    
    if (!userProfile.photos || userProfile.photos.length === 0) {
      return NextResponse.json({ error: 'No profile photo found' }, { status: 404 });
    }

    const fileId = userProfile.photos[0][2].file_id;
    const file = await bot.telegram.getFile(fileId);
    const filePath = file.file_path;
    
    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`;
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.json({ error: 'Failed to fetch avatar' }, { status: 500 });
  }
}