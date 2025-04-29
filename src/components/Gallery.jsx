import React from 'react';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

const galleryItems = [
  {
    image: '/sculpture.jpg',
    caption: 'יצירת אמנות מקורית',
    credit: 'צילום: צוות העמותה',
  },
  {
    image: '/wall.jpg',
    caption: 'פרויקט קהילתי',
    credit: 'צילום: צוות העמותה',
  },
  {
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    caption: 'תערוכת אמנות',
    credit: 'צילום: Unsplash',
  },
  {
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    caption: 'סדנת יצירה',
    credit: 'צילום: Unsplash',
  },
];

const Gallery = () => {
  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-[#FAC000]/10 to-[#801100]/5">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-title text-4xl md:text-5xl text-[#801100] mb-6 drop-shadow-lg">
            מנהיגות צומחת יצירה - מעצימים את דור העתיד!
          </h2>
          <p className="text-xl text-[#B62203]/80 leading-relaxed max-w-3xl mx-auto">
            הצצה לעבודות ולפרויקטים שלנו
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
              duration: 10,
              watchDrag: false,
            }}
            className="w-full"
          >
            <CarouselContent>
              {galleryItems.map((item, index) => (
                <CarouselItem key={index}>
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-full aspect-[4/3] relative overflow-hidden rounded-xl shadow-xl">
                      <img
                        src={item.image}
                        alt={item.caption}
                        className={cn(
                          'object-cover w-full h-full transition-all duration-500',
                          'hover:scale-105'
                        )}
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="font-title text-2xl md:text-3xl text-[#801100] mb-3">
                        {item.caption}
                      </h3>
                      <p className="text-base text-[#B62203]/80">{item.credit}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
