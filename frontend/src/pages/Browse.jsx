import React, { useEffect, useState } from 'react';
import { searchApi } from '../api/searchApi';
import ListingCard from '../components/ListingCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['tops', 'bottoms', 'dresses', 'outerwear', 'footwear', 'accessories', 'denim', 'ethnic-wear'];
const CONDITIONS = ['like-new', 'gently-used', 'visible-wear', 'needs-repair'];

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', category: '', conditionLabel: '', sort: '-createdAt' });

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.category) params.category = filters.category;
    if (filters.conditionLabel) params.conditionLabel = filters.conditionLabel;
    if (filters.sort) params.sort = filters.sort;

    searchApi
      .search(params)
      .then(({ data }) => setListings(data.data))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl text-forest-900">Browse secondhand pieces</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search title, brand, tag..."
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <select
          className="input max-w-[10rem]"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="input max-w-[10rem]"
          value={filters.conditionLabel}
          onChange={(e) => setFilters({ ...filters, conditionLabel: e.target.value })}
        >
          <option value="">Any condition</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c.replace('-', ' ')}
            </option>
          ))}
        </select>
        <select
          className="input max-w-[10rem]"
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          <option value="-createdAt">Newest</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-ratingAverage">Top rated</option>
        </select>
      </div>

      <div className="mt-6">
        {loading ? (
          <Loader label="Fetching listings" />
        ) : listings.length === 0 ? (
          <EmptyState title="No listings match your filters" subtitle="Try widening your search." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((l) => (
              <ListingCard key={l._id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
