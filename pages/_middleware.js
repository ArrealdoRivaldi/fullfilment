import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  // Daftar path valid, bisa disesuaikan
  const validPaths = ['/', '/hk', '/hk/', '/api/realtime'];
  if (!validPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
} 