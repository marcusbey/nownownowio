// Ref https://nextjs.org/docs/app/building-your-application/routing/parallel-routes#closing-the-modal
type CatchAllProps = {
  params: Promise<{ catchAll: string[] }>;
};

export default async function CatchAll({ params }: CatchAllProps) {
  // Properly await params in Next.js 15
  await params;
  return null;
}
