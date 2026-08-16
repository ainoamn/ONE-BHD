export function GET() {
  return Response.json(
    { status: "ok", service: "bhd-portal" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
