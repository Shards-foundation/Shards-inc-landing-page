import { NextResponse } from 'next/server';
export const revalidate = 3600;
export function GET() {
  return NextResponse.json({ status: 'ok', service: 'shards-inc-site', kind: 'public-site' }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
  });
}
