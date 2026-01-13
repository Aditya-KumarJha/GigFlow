import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
  const auth = useSelector((s) => s.auth);
  const isAuthenticated = auth?.isAuthenticated ?? false;

  const thumb =
    gig.images?.[0]?.thumbnail || gig.images?.[0]?.url || "/placeholder.png";

  const owner =
    gig.ownerId?.username || formatFullName(gig.ownerId?.fullName) || "Unknown";

  const assignedName = gig.assignedFreelancer
    ? gig.assignedFreelancer.username || formatFullName(gig.assignedFreelancer.fullName)
    : null;

  const handleEdit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/post-gig?id=${gig._id}`);
  };

  const handlePlaceBid = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated)
      return navigate("/login", { state: { from: `/gigs/${gig._id}` } });
    // Open gig detail page so user can place a bid there (no alert)
    navigate(`/gigs/${gig._id}`);
  };

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
            {gig.status === 'assigned' && assignedName && (
              <div className="text-xs text-zinc-500">Assigned to: {assignedName}</div>
            )}
          </div>
          <span className="capitalize">{gig.status}</span>
        </div>

        <div className="pt-4 flex items-center justify-between">
          {gig.status === "assigned" ? (
            <div
              className={`
                px-4 py-2 text-sm font-medium
                bg-zinc-100 text-zinc-700
                rounded-xl
                shadow-sm
              `}
            >
              Assigned
            </div>
          ) : gig.editable ? (
            <button
              onClick={handleEdit}
              className={`
                flex items-center gap-2
                px-4 py-2 text-sm font-medium
                bg-orange-500 text-white
                rounded-xl
                hover:bg-orange-600
                shadow-sm hover:shadow-md
                transition-all active:scale-95
              `}
            >
              <Pencil size={16} />
              Edit Gig
            </button>
          ) : (
            <button
              onClick={handlePlaceBid}
              className={`
                flex items-center gap-2
                px-4 py-2 text-sm font-medium
                bg-emerald-500 text-white
                rounded-xl
                hover:bg-emerald-600
                shadow-sm hover:shadow-md
                transition-all active:scale-95
              `}
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
