export async function GET() {
  const body = "# Session Report\n\nReport export is not implemented yet.";
  return new Response(body, {
    headers: {
      "content-type": "text/markdown",
    },
  });
}
