import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/update-profile" className="p-4 border rounded hover:shadow">Update Profile</Link>
        <Link to="/my-gigs" className="p-4 border rounded hover:shadow">My Gigs</Link>
        <Link to="/my-bids" className="p-4 border rounded hover:shadow">My Bids</Link>
        <Link to="/post-gig" className="p-4 border rounded hover:shadow">Post a Gig</Link>
      </div>
    </div>
  );
};

export default Dashboard;
