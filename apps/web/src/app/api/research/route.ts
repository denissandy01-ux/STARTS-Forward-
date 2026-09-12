import { handleResearch } from "@/lib/server/research";
export const runtime = "nodejs";
export const POST = (request: Request) => handleResearch(request);
