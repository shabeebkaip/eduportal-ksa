import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "EduPortal has revolutionized how we track student progress. The AI insights are a game-changer for our teaching staff.",
    name: "Dr. Evelyn Reed",
    title: "Principal, Northwood High",
    avatar: "A professional headshot of a woman with glasses, smiling warmly.",
  },
  {
    quote: "As a teacher, having detailed analytics at my fingertips allows me to tailor my lessons like never before. I can identify struggling students before they fall behind.",
    name: "Mr. David Chen",
    title: "Mathematics Teacher, Oakridge Academy",
    avatar: "A friendly-looking man in a classroom setting, looking at the camera.",
  },
  {
    quote: "The ability to compare performance across our district's schools has been invaluable for strategic planning and resource allocation. A must-have tool for any administrator.",
    name: "Sarah Jenkins",
    title: "District Superintendent",
    avatar: "A confident woman in business attire, standing in a modern office.",
  },
];

const cardVariants = {
  offscreen: { y: 50, opacity: 0 },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20
    }
  }
};

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 lg:py-32 bg-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white tracking-tight">Trusted by Leading Educators</h2>
          <p className="mt-4 text-lg text-gray-400">
            Hear what school administrators and teachers are saying about EduPortal.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              transition={{ delay: index * 0.15 }}
            >
              <Card className="glass-effect h-full flex flex-col">
                <CardContent className="p-8 flex flex-col flex-grow">
                  <div className="flex space-x-1 text-yellow-400 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <blockquote className="text-gray-300 flex-grow">"{testimonial.quote}"</blockquote>
                  <footer className="mt-6 flex items-center space-x-4">
                    <img  alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" src="https://images.unsplash.com/photo-1649399045831-40bfde3ef21d" />
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-400">{testimonial.title}</p>
                    </div>
                  </footer>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}