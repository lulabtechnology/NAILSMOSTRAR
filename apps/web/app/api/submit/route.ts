export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Reutilizamos los handlers de /api/create
export { OPTIONS, GET, POST } from "../create/route";
