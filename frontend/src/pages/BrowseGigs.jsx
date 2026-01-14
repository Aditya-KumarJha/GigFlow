import React, { useEffect, useState, useRef } from "react";
import Header from "../components/layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchGigs } from "../store/gigsSlice";
import GigCard from "../components/gig/GigCard";
import { toast } from 'react-toastify';

const BrowseGigs = () => {
  const dispatch = useDispatch();
  const gigsState = useSelector((s) => s.gigs);
  const items = gigsState?.items || [];
  const loading = gigsState?.loading || false;
  const meta = gigsState?.meta || {};
  const error = gigsState?.error;

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const debounce = useRef(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    dispatch(fetchGigs({ search: "", page: 1, limit: 9, status: 'all' }));
  }, [dispatch]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setPage(1);
      dispatch(fetchGigs({ search, page: 1, limit: 9, status: 'all' }));
    }, 300);
    return () => clearTimeout(debounce.current);
  }, [search, dispatch]);

  useEffect(() => {
    dispatch(fetchGigs({ search, page, limit: 9, status: 'all' }));
  }, [page, dispatch]);

  const lowerSearch = (search || "").trim().toLowerCase();

  const filteredItems = lowerSearch
    ? items.filter((g) => {
        const title = (g.title || "").toString().toLowerCase();
        const description = (g.description || "").toString().toLowerCase();
        const budgetStr = (g.budget || "").toString().toLowerCase();
        const username = (
          (g.user && (g.user.username || g.user.name)) || ""
        ).toString().toLowerCase();

        return (
          title.includes(lowerSearch) ||
          description.includes(lowerSearch) ||
          budgetStr.includes(lowerSearch) ||
          username.includes(lowerSearch)
        );
      })
    : items;

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sort === "az") return a.title.localeCompare(b.title);
    if (sort === "za") return b.title.localeCompare(a.title);
    if (sort === "budget-low") return a.budget - b.budget;
    if (sort === "budget-high") return b.budget - a.budget;
    return 0;
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-6xl mx-auto pt-28 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold">
              Browse <span className="text-[#FF4801]">Gigs</span>
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Find projects that match your skills and interests
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gigs…"
                className="w-64 rounded-lg border border-zinc-300 px-4 py-2 focus:ring-2 focus:ring-[#FF4801]/30 outline-none"
              />

              {search && search.length > 0 && (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 bg-white"
            >
              <option value="latest">Latest</option>
              <option value="az">Title: A–Z</option>
              <option value="za">Title: Z–A</option>
              <option value="budget-low">Budget: Low → High</option>
              <option value="budget-high">Budget: High → Low</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="text-center py-16 text-zinc-500">
            Loading gigs…
          </div>
        )}

        {!loading && sortedItems.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            No gigs found.
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map((g) => (
              <GigCard key={g._id || g.__tempId} gig={g} />
            ))}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between text-sm">
          <span className="text-zinc-600">
            {meta.total || 0} results
          </span>

          <div className="mb-8 flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-lg border disabled:opacity-40"
            >
              Prev
            </button>

            <span>
              {meta.page || page} / {meta.totalPages || 1}
            </span>

            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrowseGigs;
