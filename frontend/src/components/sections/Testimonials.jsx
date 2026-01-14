import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HoverExpand from "../ui/HoverExpand";

export const stories = [
  {
    id: 1,
    name: "Aarav Patel",
    role: "Startup Founder",
    quote:
      "GigFlow helped us hire a skilled frontend developer within days. The transparent bidding system made it easy to compare proposals and choose the right fit.",
    image: "/testimonials/testimonial-1.png",
  },
  {
    id: 2,
    name: "Emily Johnson",
    role: "Freelance UI/UX Designer",
    quote:
      "I love how simple GigFlow is. I can browse relevant gigs, place bids, and track my hiring status without any confusion.",
    image: "/testimonials/testimonial-2.png",
  },
  {
    id: 3,
    name: "Rohit Verma",
    role: "Full Stack Developer",
    quote:
      "GigFlow’s bidding flow feels fair and transparent. Clients know exactly what they’re paying for, and freelancers get clear project expectations.",
    image: "/testimonials/testimonial-3.png",
  },
  {
    id: 4,
    name: "Sophia Martinez",
    role: "Product Manager",
    quote:
      "Posting gigs on GigFlow is incredibly easy. The platform takes care of managing bids and helps us move quickly from idea to execution.",
    image: "/testimonials/testimonial-4.png",
  },
  {
    id: 5,
    name: "Kunal Sharma",
    role: "Freelance Backend Engineer",
    quote:
      "I appreciate how GigFlow lets freelancers showcase value beyond just price. My proposals actually get noticed here.",
    image: "/testimonials/testimonial-5.png",
  },
  {
    id: 6,
    name: "Olivia Brown",
    role: "Small Business Owner",
    quote:
      "GigFlow removed the stress from hiring. I could review bids, communicate clearly, and hire with confidence.",
    image: "/testimonials/testimonial-6.png",
  },
  {
    id: 7,
    name: "Aditya Mehra",
    role: "Computer Science Student",
    quote:
      "As a student freelancer, GigFlow gave me real-world projects that helped me build experience and confidence.",
    image: "/testimonials/testimonial-7.png",
  },
  {
    id: 8,
    name: "Daniel Kim",
    role: "Tech Lead, SaaS Company",
    quote:
      "GigFlow’s clean workflow and hiring logic make it a great platform for short-term and long-term technical projects.",
    image: "/testimonials/testimonial-8.png",
  },
];

export default function SuccessStories() {
  const [hoveredIndex, setHoveredIndex] = useState(0);

  return (
    <section className="relative p-4">
      <div className="container sm:mx-4 md:mx-auto md:px-6 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3"
        >
          Success <span className="text-[#FF4801]">Stories</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-muted-foreground mb-4"
        >
          Trusted by freelancers and clients alike, GigFlow makes hiring and
          collaboration simple and transparent.
        </motion.p>

        <HoverExpand
          images={stories.map((s) => s.image)}
          maxThumbnails={stories.length}
          thumbnailHeight={220}
          modalImageSize={420}
          onHover={(index) => setHoveredIndex(index)}
        />

        <div className="mt-6 max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.p
              key={hoveredIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="text-lg text-muted-foreground italic mb-4"
            >
              “{stories[hoveredIndex].quote}”
            </motion.p>
          </AnimatePresence>

          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="text-foreground font-semibold"
          >
            {stories[hoveredIndex].name}
          </motion.h3>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="text-sm text-muted-foreground"
          >
            {stories[hoveredIndex].role}
          </motion.span>
        </div>
      </div>
    </section>
  );
}
