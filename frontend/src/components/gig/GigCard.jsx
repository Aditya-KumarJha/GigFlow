import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { Pencil, IndianRupee, Trash2 } from "lucide-react";

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

const GigCard = ({ gig, onDelete }) => {
  const navigate = useNavigate();
  const auth = useSelector((s) => s.auth);
  const isAuthenticated = auth?.isAuthenticated ?? false;

  const thumb =
    gig.images?.[0]?.thumbnail || gig.images?.[0]?.url || "/placeholder.png";

  const owner =
    gig.ownerId?.username || formatFullName(gig.ownerId?.fullName) || "Unknown";

  const assignedName = gig.assignedFreelancer
    ? gig.assignedFreelancer.username ||
      formatFullName(gig.assignedFreelancer.fullName)
    : null;

  const currentUserId = auth.user?._id || auth.user?.id || null;
  const isOwner = currentUserId && String(gig.ownerId?._id || gig.ownerId) === String(currentUserId);

  const [userBid, setUserBid] = useState(null);

  // Simple in-memory cache for my-bids to avoid multiple requests across cards
  // keyed by user id
  const root = globalThis || window;
  root.__gigflow_my_bids_cache = root.__gigflow_my_bids_cache || { promise: null, ts: 0, data: null };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/post-gig?id=${gig._id}`);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(gig._id, gig.title);
    }
  };

  const handlePlaceBid = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      return navigate("/login", { state: { from: `/gigs/${gig._id}` } });
    }
    navigate(`/gigs/${gig._id}`);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchMyBids = async () => {
      if (!isAuthenticated) return;
      // Reuse cache if recent
      const cache = root.__gigflow_my_bids_cache;
      const now = Date.now();
      if (cache.data && (now - cache.ts) < 30_000) {
        const found = (cache.data || []).find((b) => String(b.gigId?._id || b.gigId) === String(gig._id));
        if (!cancelled) setUserBid(found || null);
        return;
      }

      if (!cache.promise) {
        cache.promise = api.get('/api/bids/my-bids').then(r => r.data.bids || []).catch(() => []);
      }

      try {
        const bids = await cache.promise;
        cache.data = bids;
        cache.ts = Date.now();
        cache.promise = null;
        const found = (bids || []).find((b) => String(b.gigId?._id || b.gigId) === String(gig._id));
        if (!cancelled) setUserBid(found || null);
      } catch (err) {
        cache.promise = null;
        if (!cancelled) setUserBid(null);
      }
    };

    fetchMyBids();
    return () => (cancelled = true);
  }, [isAuthenticated, gig._id]);

  return (
    <Link
      to={`/gigs/${gig._id}`}
      className="group bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="h-50 bg-zinc-100 overflow-hidden">
        <img
          src={thumb}
          alt="gig"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

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
          <div>
            <div>By {owner}</div>
            {gig.status === "assigned" && assignedName && (
              <div className="text-xs text-zinc-500">
                Assigned to: {assignedName}
              </div>
            )}
          </div>
          <span className="capitalize">{gig.status}</span>
        </div>

        <div className="pt-4 flex items-center justify-between gap-2">
          {gig.status === "assigned" ? (
            <div className="px-4 py-2 text-sm font-medium bg-zinc-100 text-zinc-700 rounded-xl shadow-sm">
              Assigned
            </div>
          ) : gig.editable ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <Pencil size={16} />
                Edit Gig
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          ) : userBid && !isOwner ? (
            <div
              onClick={handlePlaceBid}
              className="border rounded-xl p-3 bg-emerald-50 cursor-pointer w-full"
            >
              <div className="text-sm text-zinc-500">Your Bid</div>
              <div className="text-lg font-bold mt-1">₹{userBid.price}</div>
              {userBid.message && (
                <p className="text-sm text-zinc-600 mt-2 truncate">{userBid.message}</p>
              )}
              <div className="mt-3">
                <span className={`inline-block text-xs px-2 py-1 rounded-full capitalize ${
                  userBid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  userBid.status === 'hired' ? 'bg-emerald-100 text-emerald-700' :
                  userBid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-zinc-100 text-zinc-600'
                }`}>{userBid.status || 'pending'}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handlePlaceBid}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <IndianRupee size={16} />
              Place Bid
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GigCard;
