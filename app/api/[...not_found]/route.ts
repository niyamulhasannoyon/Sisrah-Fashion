import { NextResponse } from 'next/server';

function notFoundResponse(req: Request) {
  const url = new URL(req.url);
  return NextResponse.json(
    {
      success: false,
      error: 'API endpoint not found',
      path: url.pathname,
      statusCode: 404,
    },
    { status: 404 }
  );
}

export async function GET(req: Request) {
  return notFoundResponse(req);
}

export async function POST(req: Request) {
  return notFoundResponse(req);
}

export async function PUT(req: Request) {
  return notFoundResponse(req);
}

export async function DELETE(req: Request) {
  return notFoundResponse(req);
}

export async function PATCH(req: Request) {
  return notFoundResponse(req);
}
