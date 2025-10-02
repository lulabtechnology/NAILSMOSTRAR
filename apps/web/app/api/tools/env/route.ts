export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const mask = (v?: string|null) => (v ? true : false);
  return Response.json({
    ok: true,
    vars: {
      SUPABASE_URL: mask(process.env.SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: mask(process.env.SUPABASE_SERVICE_ROLE_KEY),
      NEXT_PUBLIC_SUPABASE_URL: mask(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null
    }
  });
}
