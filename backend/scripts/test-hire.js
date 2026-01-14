import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Gig from '../src/models/gig.model.js';
import Bid from '../src/models/bid.model.js';

async function run() {
  console.log('Starting in-memory MongoDB replica set...');
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  process.env.MONGODB_URI = uri;
  console.log('Mongo URI:', uri);

  await mongoose.connect(uri, {});

  try {
    // Create users
    const owner = await User.create({ email: 'owner@example.com', isVerified: true });
    const f1 = await User.create({ email: 'freelancer1@example.com', isVerified: true });
    const f2 = await User.create({ email: 'freelancer2@example.com', isVerified: true });

    // Create gig
    const gig = await Gig.create({ title: 'Test Gig', description: 'Test', budget: 100, ownerId: owner._id });

    // Create bids
    const bid1 = await Bid.create({ gigId: gig._id, freelancerId: f1._id, message: 'Hi', price: 50 });
    const bid2 = await Bid.create({ gigId: gig._id, freelancerId: f2._id, message: 'Hello', price: 60 });

    // Owner token
    const secret = process.env.JWT_SECRET || 'testsecret';
    const token = jwt.sign({ id: owner._id, email: owner.email }, secret, { expiresIn: '1h' });

    const req = request(app);

    console.log('Sending two concurrent hire requests...');
    const [r1, r2] = await Promise.all([
      req.patch(`/api/bids/${bid1._id}/hire`).set('Cookie', `token=${token}`),
      req.patch(`/api/bids/${bid2._id}/hire`).set('Cookie', `token=${token}`),
    ]);

    console.log('Response statuses:', r1.status, r2.status);

    const updatedGig = await Gig.findById(gig._id);
    const updatedBid1 = await Bid.findById(bid1._id);
    const updatedBid2 = await Bid.findById(bid2._id);

    console.log('Gig status:', updatedGig.status);
    console.log('Bid statuses:', updatedBid1.status, updatedBid2.status);

    const hiredCount = [updatedBid1, updatedBid2].filter(b => b.status === 'hired').length;

    if (updatedGig.status === 'assigned' && hiredCount === 1) {
      console.log('TEST PASSED: Atomic hire enforced');
      await mongoose.disconnect();
      await replSet.stop();
      process.exit(0);
    } else {
      console.error('TEST FAILED: Inconsistent state detected');
      await mongoose.disconnect();
      await replSet.stop();
      process.exit(1);
    }
  } catch (err) {
    console.error('Test failed with error:', err);
    await mongoose.disconnect();
    await replSet.stop();
    process.exit(2);
  }
}

run();
