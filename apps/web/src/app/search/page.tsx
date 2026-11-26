import { mediaApi } from '@/lib/api';

export default async function SearchPage({
  searchParams,
}: {
  // Next 15 : searchParams est une Promise
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim();
  const page = Number(params.page || 1) || 1;

  if (!q) {
    return (
      <main className="container mx-auto px-4 py-10">
        Entrez une requête de recherche.
      </main>
    );
  }

  const results = await mediaApi.search(q, page);

  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Résultats pour “{q}”</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {results.items.map((item) => (
          <div key={`${item.mediaType}-${item.id}`} className="border rounded p-2">
            <div className="text-sm font-semibold">{item.title}</div>
            <div className="text-xs text-muted-foreground">{item.mediaType}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

