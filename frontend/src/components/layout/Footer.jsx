import React from "react";
import { motion } from "framer-motion";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-20 bg-white"
    >
      {/* Wave */}
      <div className="overflow-hidden">
        <svg
          className="w-full"
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,40 C200,120 400,0 720,40 C1040,80 1240,20 1440,60 L1440 120 L0 120 Z"
            fill="#FFF7F1"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h4 className="text-2xl font-bold tracking-tight">GigFlow</h4>
            <p className="text-sm text-zinc-500 mt-2 max-w-xs">
              A modern marketplace to post gigs, place bids, and hire the right
              talent with confidence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h5 className="font-semibold mb-3">Product</h5>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <a href="/browse-gigs" className="hover:text-black transition">
                  Browse Gigs
                </a>
              </li>
              <li>
                <a href="/post-gig" className="hover:text-black transition">
                  Post a Gig
                </a>
              </li>
            </ul>
          </div>

          {/* Use cases */}
          <div>
            <h5 className="font-semibold mb-3">Use Cases</h5>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>For Clients</li>
              <li>For Freelancers</li>
              <li>Short-term Projects</li>
              <li>Long-term Work</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="font-semibold mb-3">Contact</h5>

            <motion.a
              whileHover={{ x: 3 }}
              href="mailto:hello@gigflow.example"
              className="flex items-center gap-2 text-sm text-zinc-600 hover:text-black transition"
            >
              <Mail className="w-4 h-4" />
              hello@gigflow.example
            </motion.a>

            <div className="flex items-center gap-4 mt-4">
              <motion.a whileHover={{ y: -3 }} href="#" aria-label="Twitter">
                <Twitter className="w-5 h-5 text-zinc-600 hover:text-black transition" />
              </motion.a>
              <motion.a whileHover={{ y: -3 }} href="#" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5 text-zinc-600 hover:text-black transition" />
              </motion.a>
              <motion.a whileHover={{ y: -3 }} href="#" aria-label="GitHub">
                <Github className="w-5 h-5 text-zinc-600 hover:text-black transition" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-zinc-200 pt-6 text-sm text-zinc-500 text-center">
          © {new Date().getFullYear()} GigFlow — Built for real work, not noise.
        </div>
      </div>
    </motion.footer>
  );
}
