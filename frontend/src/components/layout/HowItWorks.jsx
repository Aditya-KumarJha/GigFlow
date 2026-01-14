import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, CheckCircle, Rocket } from "lucide-react";

const steps = [
  {
    icon: <Briefcase className="text-[#FF4801] w-10 h-10" />,
    title: "Post a Gig",
    desc: "Create a gig with your requirements, budget, and timeline in minutes.",
  },
  {
    icon: <Users className="text-[#FF4801] w-10 h-10" />,
    title: "Receive Bids",
    desc: "Freelancers submit proposals with pricing and custom messages.",
  },
  {
    icon: <CheckCircle className="text-[#FF4801] w-10 h-10" />,
    title: "Hire the Best Fit",
    desc: "Review bids, compare skills, and hire the right freelancer with one click.",
  },
  {
    icon: <Rocket className="text-[#FF4801] w-10 h-10" />,
    title: "Build & Deliver",
    desc: "Collaborate and get your work delivered efficiently and transparently.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full pt-12 pb-24 bg-white">
      <div className="max-w-8xl mx-auto px-6 relative">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-4xl md:text-5xl font-extrabold mb-20 tracking-tight"
        >
          How <span className="text-[#FF4801]">GigFlow</span> Works
        </motion.h2>

        {/* Connector line (tablet + desktop only) */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="hidden lg:block absolute top-[58%] left-0 w-full border-t-2 border-dashed border-zinc-200 origin-left"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="relative bg-white border border-zinc-100 rounded-2xl shadow-md p-8
                         flex flex-col items-center text-center
                         hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Step number */}
              <div className="hidden md:flex absolute -top-6 w-12 h-12 rounded-full bg-white border-2 border-indigo-600
                              items-center justify-center font-bold text-[#FF4801]">
                {idx + 1}
              </div>

              <div className="mb-6">{step.icon}</div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-zinc-500">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
