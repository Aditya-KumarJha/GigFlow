import React, { useEffect, useState, useRef } from "react";
import Header from "../components/layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchGigs } from "../store/gigsSlice";
import { Pencil, IndianRupee } from "lucide-react";

const truncate = (s, n = 120) =>
  s && s.length > n ? s.slice(0, n) + "..." : s || "";

const formatFullName = (fullName) => {
  if (!fullName) return null;
  if (typeof fullName === "string") return fullName;
  if (typeof fullName === "object") {
    const first = fullName.firstName || "";
    const last = fullName.lastName || "";
    return `${first} ${last}`.trim() || null;
  }
  return String(fullName);
};

const GigCard = ({ gig }) => {
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth || { isAuthenticated: false });

  const thumb =
    gig.images?.[0]?.thumbnail ||
    gig.images?.[0]?.url ||
    "/placeholder.png";

  const owner =
    gig.ownerId?.username ||
    formatFullName(gig.ownerId?.fullName) ||
    "Unknown";

  return (
    <div className="group bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="h-50 bg-zinc-100 overflow-hidden">
        <img
          src={thumb}
          alt="gig"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-lg leading-snug group-hover:text-[#FF4801] transition">
            {gig.title}
          </h3>
          <span className="text-sm font-semibold text-zinc-800 bg-zinc-100 px-2 py-1 rounded-lg">
            ₹{gig.budget}
          </span>
        </div>

        <p className="text-sm text-zinc-600">
          {truncate(gig.description, 120)}
        </p>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
          <span>By {owner}</span>
          <span className="capitalize">{gig.status}</span>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-between">
          {gig.editable ? (
            <button
              onClick={() => navigate(`/post-gig?id=${gig._id}`)}
              className="
                flex items-center gap-2
                px-4 py-2 text-sm font-medium
                bg-orange-500 text-white
                rounded-xl
                hover:bg-orange-600
                shadow-sm hover:shadow-md
                transition-all active:scale-95
              "
            >
              <Pencil size={16} />
              Edit Gig
            </button>
          ) : (
            <button
              onClick={() => {
                if (!auth.isAuthenticated)
                  return navigate("/login", {
                    state: { from: "/browse-gigs" },
                  });
                alert("Open bid UI for gig: " + gig._id);
              }}
              className="
                flex items-center gap-2
                px-4 py-2 text-sm font-medium
                bg-emerald-500 text-white
                rounded-xl
                hover:bg-emerald-600
                shadow-sm hover:shadow-md
                transition-all active:scale-95
              "
            >
              <IndianRupee size={16} />
              Place Bid
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const BrowseGigs = () => {
  const dispatch = useDispatch();
  const { items, loading, meta } = useSelector(
    (s) => s.gigs || { items: [], loading: false, meta: {} }
  );

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const debounce = useRef(null);

  useEffect(() => {
    dispatch(fetchGigs({ search: "", page: 1, limit: 9 }));
  }, [dispatch]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setPage(1);
      dispatch(fetchGigs({ search, page: 1, limit: 9 }));
    }, 300);
    return () => clearTimeout(debounce.current);
  }, [search, dispatch]);

  useEffect(() => {
    dispatch(fetchGigs({ search, page, limit: 9 }));
  }, [page, dispatch]);

  const sortedItems = [...items].sort((a, b) => {
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold">
              Browse <span className="text-[#FF4801]">Gigs</span>
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              Find projects that match your skills and interests
            </p>
          </div>

          <div className="flex gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gigs…"
              className="w-64 rounded-lg border border-zinc-300 px-4 py-2 focus:ring-2 focus:ring-[#FF4801]/30 outline-none"
            />

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

        {/* Grid */}
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

        {/* Pagination */}
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
