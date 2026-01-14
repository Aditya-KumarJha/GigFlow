import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { toast } from 'react-toastify';
import Footer from '../components/layout/Footer';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBid, setEditingBid] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editMessage, setEditMessage] = useState('');

  const fetchBids = () => {
    setLoading(true);
    api.get('/api/bids/my-bids')
      .then(({ data }) => {
        setBids(data.bids || []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Failed to load bids');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const handleDelete = async (bidId, gigTitle) => {
    if (!window.confirm(`Are you sure you want to delete your bid for "${gigTitle}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/bids/${bidId}`);
      toast.success('Bid deleted successfully');
      fetchBids();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete bid');
    }
  };

  const startEdit = (bid) => {
    setEditingBid(bid._id);
    setEditPrice(bid.price.toString());
    setEditMessage(bid.message);
  };

  const cancelEdit = () => {
    setEditingBid(null);
    setEditPrice('');
    setEditMessage('');
  };

  const handleUpdate = async (bidId) => {
    if (!editMessage.trim() || editMessage.trim().length < 10) {
      toast.error('Message must be at least 10 characters');
      return;
    }

    try {
      await api.patch(`/api/bids/${bidId}`, {
        price: Number(editPrice),
        message: editMessage.trim(),
      });
      toast.success('Bid updated successfully');
      cancelEdit();
      fetchBids();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update bid');
    }
  };

  return (
    <>
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Header />
      <h2 className="mt-20 text-3xl font-bold mb-6">My Bids</h2>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-24 rounded-xl bg-zinc-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && bids.length === 0 && (
        <div className="text-center py-16 border rounded-xl bg-zinc-50">
          <p className="text-lg font-medium mb-2">No bids yet</p>
          <p className="text-sm text-zinc-600 mb-4">
            Start bidding on gigs to see them here.
          </p>
          <Link
            to="/browse-gigs"
            className="inline-block px-4 py-2 rounded-lg bg-black text-white text-sm hover:opacity-90"
          >
            Browse Gigs
          </Link>
        </div>
      )}

      {/* Bids List */}
      {!loading && bids.length > 0 && (
        <div className="grid gap-4">
          {bids.map(b => (
            <div
              key={b._id}
              className="group rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              {editingBid === b._id ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Editing bid for: {b.gigId?.title || 'Unknown gig'}
                  </h3>
                  
                  <div>
                    <label className="text-sm font-medium">Price (₹)</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(b._id)}
                      className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left */}
                  <div className="space-y-1 flex-1">
                    <h3 className="text-lg font-semibold group-hover:text-blue-600 transition">
                      {b.gigId?.title || 'Unknown gig'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
                      <span>₹{b.price}</span>
                      <span className="text-zinc-400">•</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          statusStyles[b.status] || 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    {b.message && (
                      <p className="text-sm text-zinc-700 line-clamp-2 mt-1">
                        {b.message}
                      </p>
                    )}
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-2">
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => startEdit(b)}
                          className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
                          title="Edit Bid"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(b._id, b.gigId?.title || 'this gig')}
                          className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                          title="Delete Bid"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {b.gigId && (
                      <Link
                        to={`/gigs/${b.gigId._id}`}
                        className="shrink-0 text-sm font-medium text-blue-600 hover:underline"
                      >
                        View Gig →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    <Footer />
    </>
  );
};

export default MyBids;
