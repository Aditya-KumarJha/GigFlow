import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import GigCard from '../components/gig/GigCard';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import { toast } from 'react-toastify';
import Footer from '../components/layout/Footer';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const MyGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const auth = useSelector((s) => s.auth);
  const currentUserId = auth.user?._id || auth.user?.id || null;
  const LIMIT = 9;

  const fetchMyGigs = async (p = 1, append = false) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/gigs?limit=${LIMIT}&page=${p}&status=all`);
      const all = (data.gigs || []);
      const meta = data.meta || {};

      const list = all.filter(g => {
        const ownerId = g.ownerId?._id || g.ownerId;
        const assignedId = g.assignedFreelancer?._id || g.assignedFreelancer;
        return (currentUserId && String(ownerId) === String(currentUserId)) || (currentUserId && String(assignedId) === String(currentUserId));
      });

      if (append) {
        setGigs(prev => [...prev, ...list]);
      } else {
        setGigs(list);
      }

      setPage(p);
      setHasMore(Boolean(meta.page && meta.totalPages && meta.page < meta.totalPages));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch first page when component mounts or when user changes
    fetchMyGigs(1, false);
  }, [currentUserId]);

  const handleDelete = async (gigId, gigTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${gigTitle}"?`)) return;

    try {
      await api.delete(`/api/gigs/${gigId}`);
      toast.success('Gig deleted successfully');
      // refresh from first page
      setPage(1);
      fetchMyGigs(1, false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete gig');
    }
  };

  const loadMore = () => {
    if (!hasMore) return;
    fetchMyGigs(page + 1, true);
  };

  return (
    <>
    <motion.div
      className="max-w-6xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Header />

      <div className="mt-20 flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">My Gigs</h2>
        <Link
          to="/gigs/new"
          className="px-4 py-2 rounded-lg bg-black text-white text-sm hover:opacity-90 transition"
        >
          + Post a Gig
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-zinc-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && gigs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 border rounded-2xl bg-zinc-50"
        >
          <h3 className="text-xl font-semibold mb-2">No gigs yet</h3>
          <p className="text-sm text-zinc-600 mb-6">
            You haven’t posted any gigs. Create one and start hiring.
          </p>
          <Link
            to="/gigs/new"
            className="inline-block px-5 py-2.5 rounded-lg bg-black text-white text-sm hover:opacity-90 transition"
          >
            Create Your First Gig
          </Link>
        </motion.div>
      )}

      {!loading && gigs.length > 0 && (
        <InfiniteScroll
          dataLength={gigs.length}
          next={loadMore}
          hasMore={hasMore}
          loader={<div className="text-center py-6 text-zinc-500">Loading more...</div>}
          className=""
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map(gig => (
              <motion.div
                key={gig._id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="rounded-2xl"
              >
                <GigCard gig={gig} onDelete={handleDelete} />
              </motion.div>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </motion.div>
    <Footer />
    </>
  );
};

export default MyGigs;
