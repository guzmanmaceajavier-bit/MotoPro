import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/Skeleton";
import { MARQUEE_GRADIENTS } from "./constants";
import { useBrands } from "@/providers/CMSProvider";
import "swiper/css";

export function BrandMarquee() {
  const { brands, loading } = useBrands();

  if (loading) {
    return (
      <section className="border-y border-border bg-surface-primary py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-3">
            {[1,2,3,4,5,6,7,8].map((i) => (
              <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-lg" />
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
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-2.5 backdrop-blur-sm transition-all duration-300 hover:border-interactive-accent/20 hover:bg-interactive-accent/10"
              >
                {brand.image ? (
                  <img src={brand.image} alt={brand.name} className="h-8 w-8 rounded-lg bg-white/10 object-contain" />
                ) : (
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${MARQUEE_GRADIENTS[i % MARQUEE_GRADIENTS.length]} text-xs font-bold text-white`}>
                    {brand.name.charAt(0)}
                  </div>
                )}
                <span className="whitespace-nowrap text-sm font-medium text-text-secondary">{brand.name}</span>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
