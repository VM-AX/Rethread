import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { searchApi } from '../api/searchApi';
import { impactApi } from '../api/impactApi';
import ListingCard from '../components/ListingCard';
import ImpactBadge from '../components/ImpactBadge';

export default function Landing() {
  const [trending, setTrending] = useState([]);
  const [impact, setImpact] = useState(null);

  useEffect(() => {
    searchApi.trending().then(({ data }) => setTrending(data.data)).catch(() => {});
    impactApi.platformSummary().then(({ data }) => setImpact(data.data)).catch(() => {});
  }, []);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pt-20">
        <div className="grid items-center gap-10 sm:grid-cols-2">
          <div>
            <h1 className="font-display text-4xl leading-tight text-forest-900 sm:text-5xl">
              Give clothes a second life.
            </h1>
            <p className="mt-4 max-w-md text-forest-600">
              ReThread is a marketplace for buying, selling, repairing, and bidding on secondhand
              clothing — with AI-graded condition reports and real sustainability impact on every
              purchase.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/browse" className="btn btn-primary">
                Start browsing
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Become a seller
              </Link>
            </div>
          </div>
          <div className="card grid grid-cols-2 gap-3 p-3">
            {[
              {
                key: 'tops',
                label: 'Tops',
                image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
              },
              {
                key: 'denim',
                label: 'Denim',
                image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
              },
              {
                key: 'outerwear',
                label: 'Outerwear',
                image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
              },
              {
                key: 'footwear',
                label: 'Footwear',
                image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
              },
            ].map((cat) => (
              <Link
                key={cat.key}
                to={`/browse?category=${cat.key}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-forest-100 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3 flex flex-col justify-between">
                  <span className="badge bg-white/90 backdrop-blur-sm text-forest-900 self-start text-[10px] uppercase font-bold tracking-wider">
                    {cat.label}
                  </span>
                  <span className="text-xs font-semibold text-white group-hover:underline flex items-center gap-1">
                    Explore &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {impact && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="mb-4 text-lg font-medium text-forest-800">Our community's impact so far</h2>
          <ImpactBadge waterSavedLiters={impact.totalWaterSavedLiters} co2SavedKg={impact.totalCo2SavedKg} />
        </section>
      )}

      {trending.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <h2 className="mb-4 text-lg font-medium text-forest-800">Trending right now</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {trending.map((l) => (
              <ListingCard key={l._id} listing={l} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="card grid gap-6 p-8 sm:grid-cols-4">
          {[
            ['1. List', 'Sellers upload photos & get an instant AI condition + authenticity grade.'],
            ['2. Discover', 'Buyers browse, search, filter, and bid on unique secondhand pieces.'],
            ['3. Repair', 'Book a repair partner to extend the life of a garment after purchase.'],
            ['4. Track impact', 'Every order shows estimated water and CO₂ saved vs. buying new.'],
          ].map(([title, body]) => (
            <div key={title}>
              <p className="font-display text-lg text-forest-800">{title}</p>
              <p className="mt-1 text-sm text-forest-500">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
