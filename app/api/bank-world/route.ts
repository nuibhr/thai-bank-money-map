import {buildWorldData} from '@/lib/world/data';
export async function GET(){return Response.json(buildWorldData(),{headers:{'Cache-Control':'public, max-age=60'}})}
