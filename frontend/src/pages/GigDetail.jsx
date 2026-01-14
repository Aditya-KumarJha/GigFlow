import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBidsForGig, submitBid, hireBid } from "../store/bidsSlice";
import api from "../utils/api";
import { toast } from "react-toastify";
import { initSocket } from "../utils/socket";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const GigDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const auth = useSelector((s) => s.auth);
  const bidsStateRaw = useSelector((s) => s.bids?.byGigId?.[id]);
  const bidsState = bidsStateRaw || { items: [], loading: false, error: null };

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

  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainIndex, setMainIndex] = useState(0);

  const [bidMessage, setBidMessage] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userBid, setUserBid] = useState(null);
  const [selectedBidId, setSelectedBidId] = useState(null);

  const currentUserId = auth.user?._id || auth.user?.id || null;
  const isAuthenticated = !!currentUserId;
  const isOwner = isAuthenticated && String(gig?.ownerId?._id || gig?.ownerId) === String(currentUserId);
  const isFreelancer = isAuthenticated && !isOwner;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`${API_BASE_URL}/api/gigs/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setGig(json.gig || json);
          setMainIndex(0);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setGig(null);
          toast.error('Failed to load gig details');
        }
      })
      .finally(() => !cancelled && setLoading(false));

    return () => (cancelled = true);
  }, [id]);

  useEffect(() => {
    if (isOwner) {
      dispatch(fetchBidsForGig(id)).catch(() => {});
    }
  }, [dispatch, id, isOwner]);

  useEffect(() => {
    if (!isFreelancer) return;

    let cancelled = false;
    const fetchMyBid = async () => {
      try {
        const res = await api.get("/api/bids/my-bids");
        if (cancelled) return;

        const found = (res.data.bids || []).find(
          (b) => String(b.gigId?._id || b.gigId) === String(id)
        );

        setUserBid(found || null);
      } catch {
        setUserBid(null);
      }
    };

    fetchMyBid();
    return () => (cancelled = true);
  }, [id, isFreelancer]);

  useEffect(() => {
    // Listen to socket events to update UI in real-time for this gig
    const socket = initSocket();

    const handleBidHired = (data) => {
      try {
        const gigId = data?.gig?.id || data?.gig?._id;
        if (!gigId || String(gigId) !== String(id)) return;

        // If current user is freelancer of this gig, update their bid state
        if (isFreelancer) {
          setUserBid((prev) => {
            if (!prev) return prev;
            const bidId = data?.bid?.id || data?.bid?._id;
            // If prev has an _id, make sure it matches; otherwise if current user matches the freelancer in payload, update
            const currentMatches = String(currentUserId) && String(data?.freelancer?.id || data?.freelancer?._id) && String(currentUserId) === String(data?.freelancer?.id || data?.freelancer?._id);
            if (bidId && prev._id && String(prev._id) !== String(bidId) && !currentMatches) return prev;
            return {
              ...prev,
              status: 'hired',
              price: data?.bid?.price ?? prev.price,
              message: data?.bid?.message ?? prev.message,
            };
          });
        }

        // Update gig assigned state for everyone viewing this gig
        setGig((g) => ({
          ...(g || {}),
          status: 'assigned',
          assignedFreelancer: isFreelancer ? (auth.user || data?.freelancer) : (data?.freelancer || g?.assignedFreelancer),
        }));

        // toast shown by global listener in App; avoid duplicate toasts here
        // owner should refresh bids list to get latest statuses
        if (isOwner) {
          dispatch(fetchBidsForGig(id)).catch(() => {});
        }
      } catch (e) {
        console.error(e);
      }
    };

    const handleBidRejected = (data) => {
      try {
        const gigId = data?.gig?.id || data?.gig?._id;
        if (!gigId || String(gigId) !== String(id)) return;

        if (isFreelancer) {
          setUserBid((prev) => {
            if (!prev) return prev;
            const bidId = data?.bid?.id || data?.bid?._id;
            const currentMatches = String(currentUserId) && String(data?.freelancer?.id || data?.freelancer?._id) && String(currentUserId) === String(data?.freelancer?.id || data?.freelancer?._id);
            if (bidId && prev._id && String(prev._id) !== String(bidId) && !currentMatches) return prev;
            return { ...prev, status: 'rejected' };
          });
        }

        // If owner, refresh bids list
        if (isOwner) {
          dispatch(fetchBidsForGig(id)).catch(() => {});
        }

        // toast shown by global listener in App; avoid duplicate toasts here
      } catch (e) {
        console.error(e);
      }
    };

    socket.on('bid_hired', handleBidHired);
    socket.on('bid_rejected', handleBidRejected);

    return () => {
      try {
        socket.off('bid_hired', handleBidHired);
        socket.off('bid_rejected', handleBidRejected);
      } catch (e) {}
    };
  }, [id, isFreelancer, isOwner, dispatch]);

  if (loading) return <div className="min-h-screen">Loading…</div>;
  if (!gig) return <div className="min-h-screen">Gig not found.</div>;

  const images = gig.images || [];
  const main = images[mainIndex] || images[0] || { url: "/placeholder.png" };

  const handleSubmitBid = async (e) => {
    e.preventDefault();

    if (bidMessage.trim().length < 10) {
      toast.error("Proposal must be at least 10 characters");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        submitBid({
          gigId: id,
          message: bidMessage.trim(),
          price: Number(bidPrice),
        })
      ).unwrap();

      toast.success("Bid submitted");
      setUserBid({
        price: Number(bidPrice),
        message: bidMessage.trim(),
        status: "pending",
      });
      setBidMessage("");
      setBidPrice("");
    } catch (err) {
      if (err?.status === 401)
        return navigate("/login", { state: { from: `/gigs/${id}` } });
      toast.error(err?.message || "Failed to submit bid");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHire = async (bidId) => {
    try {
      await dispatch(hireBid({ bidId, gigId: id })).unwrap();
      toast.success("Freelancer hired");
    } catch (err) {
      toast.error(err?.message || "Failed to hire");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-6xl mx-auto pt-28 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-96 bg-zinc-100 rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src={main.url}
                alt="main"
                className="object-contain max-h-full"
              />
            </div>

            <div className="flex gap-3 mt-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainIndex(i)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border ${
                    i === mainIndex
                      ? "ring-2 ring-[#FF4801]"
                      : "border-zinc-200"
                  }`}
                >
                  <img
                    src={img.thumbnail || img.url}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            <h1 className="text-3xl font-extrabold mt-6">{gig.title}</h1>
            <p className="text-zinc-500 mt-1">
              By {gig.ownerId?.username || formatFullName(gig.ownerId?.fullName) || "Unknown"}
            </p>

            {gig.status === 'assigned' && gig.assignedFreelancer && (
              <div className="mt-2 text-sm text-zinc-600">
                Assigned to: {gig.assignedFreelancer.username || formatFullName(gig.assignedFreelancer.fullName) || 'Freelancer'}
              </div>
            )}

            <div className="mt-4 inline-block bg-zinc-100 px-4 py-2 rounded-lg font-semibold">
              Budget: ₹{gig.budget}
            </div>

            <div className="mt-6 text-zinc-700 leading-relaxed">
              {gig.description}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28 h-fit">
            <h3 className="text-xl font-bold mb-4">Bids</h3>

            {isOwner && (
              <div className="space-y-3">
                {bidsState.items.length === 0 ? (
                  <div className="text-zinc-500">No bids yet</div>
                ) : (
                  bidsState.items.map((b) => (
                    <div key={b._id}>
                      <div
                        onClick={() => setSelectedBidId((s) => (s === b._id ? null : b._id))}
                        className="border rounded-xl p-4 flex justify-between items-start cursor-pointer hover:shadow"
                      >
                        <div>
                          <div className="font-semibold">
                            {b.freelancerId?.username || formatFullName(b.freelancerId?.fullName) || "Freelancer"}
                          </div>
                          <div className="text-sm text-zinc-600 mt-1">
                            ₹{b.price} · {b.message}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div>
                            <span className={`inline-block text-xs px-2 py-1 rounded-full capitalize ${
                              b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              b.status === 'hired' ? 'bg-emerald-100 text-emerald-700' :
                              b.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-zinc-100 text-zinc-600'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          {b.status === "pending" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleHire(b._id); }}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                            >
                              Hire
                            </button>
                          )}
                        </div>
                      </div>

                      {selectedBidId === b._id && (
                        <div className="mt-2 p-3 bg-white border rounded-lg text-sm text-zinc-700">
                          <div><strong>Freelancer:</strong> {b.freelancerId?.username || formatFullName(b.freelancerId?.fullName) || 'Freelancer'}</div>
                          <div className="mt-1"><strong>Price:</strong> ₹{b.price}</div>
                          <div className="mt-1"><strong>Message:</strong> {b.message}</div>
                          <div className="mt-1 text-zinc-500"><strong>Status:</strong> {b.status}</div>
                          {b.createdAt && <div className="mt-1 text-xs text-zinc-400">Placed: {new Date(b.createdAt).toLocaleString()}</div>}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {isFreelancer && (gig.status === "open" || userBid) && (
              <>
                {userBid ? (
                  <div className="border rounded-xl p-4 bg-zinc-50">
                    <div className="text-sm text-zinc-500">Your Bid</div>
                    <div className="text-xl font-bold mt-1">
                      ₹{userBid.price}
                    </div>
                    <p className="text-sm text-zinc-600 mt-2">
                      {userBid.message}
                    </p>
                    <span className={`inline-block mt-3 px-3 py-1 text-xs rounded-full ${
                      userBid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      userBid.status === 'hired' ? 'bg-emerald-100 text-emerald-700' :
                      userBid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-zinc-100 text-zinc-600'
                    }`}>
                      {userBid.status}
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitBid} className="space-y-4">
                    <textarea
                      placeholder="Write a proposal that stands out…"
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      rows={4}
                    />
                    <input
                      type="number"
                      placeholder="Your price (₹)"
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      min="0"
                    />
                    <button
                      disabled={submitting}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-medium"
                    >
                      {submitting ? "Submitting…" : "Place Bid"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GigDetail;
