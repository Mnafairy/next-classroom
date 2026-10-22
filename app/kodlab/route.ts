/** Keep KodLab's document and styles separate from the host application layout. */
export function GET() {
  // A relative location preserves the classroom computer's hostname and port.
  return new Response(null, {
    status: 307,
    headers: { Location: "/kodlab/index.html" },
  });
}
