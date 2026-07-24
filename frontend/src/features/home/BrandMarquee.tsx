import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { api } from "@/api/client";
import { Skeleton } from "@/components/Skeleton";
import "swiper/css";

const gradients = [
  "from-red-500 to-yellow-500", "from-blue-500 to-cyan-500", "from-green-500 to-teal-500",
  "from-teal-500 to-pink-500", "from-orange-500 to-red-500", "from-indigo-500 to-teal-500",
  "from-yellow-500 to-orange-500", "from-pink-500 to-rose-500", "from-cyan-500 to-blue-500",
  "from-teal-500 to-green-500", "from-rose-500 to-pink-500", "from-violet-500 to-indigo-500",
  "from-amber-500 to-orange-500", "from-lime-500 to-green-500", "from-emerald-500 to-teal-500",
  "from-sky-500 to-indigo-500", "from-fuchsia-500 to-teal-500", "from-red-500 to-rose-500",
  "from-blue-500 to-violet-500", "from-green-500 to-lime-500", "from-yellow-500 to-amber-500",
  "from-cyan-500 to-sky-500", "from-indigo-500 to-fuchsia-500",
];

export function BrandMarquee() {
  const [brands, setBrands] = useState<{ id: number; name: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/brands").then((data) => setBrands(data || [])).catch(() => setBrands([])).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="border-y border-border bg-surface-primary py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-3">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-lg shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-border bg-surface-primary py-6">
      <div className="mx-auto max-w-7xl px-4">
        <Swiper modules={[Autoplay]} autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
          speed={3000} loop={true} slidesPerView="auto" spaceBetween={16} grabCursor={true}
          breakpoints={{ 640: { slidesPerView: 5 }, 768: { slidesPerView: 7 }, 1024: { slidesPerView: 9 } }}
        >
          {[...brands, ...brands].map((brand, i) => (
            <SwiperSlide key={`${brand.id}-${i}`} className="!w-auto">
              <motion.div whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5 px-4 py-2.5 hover:bg-interactive-accent/10 hover:border-interactive-accent/20 transition-all duration-300 cursor-pointer"
              >
                {brand.image ? (
                  <img src={brand.image} alt={brand.name} className="h-8 w-8 rounded-lg object-contain bg-white/10" />
                ) : (
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-xs font-bold text-white`}>
                    {brand.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-text-secondary whitespace-nowrap">{brand.name}</span>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
