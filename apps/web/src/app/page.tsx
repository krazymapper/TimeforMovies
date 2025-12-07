import { SearchBar } from '@/components/search/search-bar';
import { PopularMovies } from '@/components/media/popular-movies';
import { PopularTV } from '@/components/media/popular-tv';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-b from-background to-muted/20 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Trouvez où regarder
              <br />
              <span className="text-primary">vos contenus préférés</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez sur quelles plateformes légales regarder vos films, animes
              et séries TV.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Popular Movies */}
      <section className="py-8 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Films populaires</h2>
        <PopularMovies />
      </section>

      {/* Popular TV Shows */}
      <section className="py-8 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Séries populaires</h2>
        <PopularTV />
      </section>
    </main>
  );
}

