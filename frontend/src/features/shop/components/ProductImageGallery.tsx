import { motion } from "framer-motion";

interface ProductImageGalleryProps {
  images: string[];
  selectedImage: number;
  setSelectedImage: (i: number) => void;
  product: any;
  hasDiscount: boolean;
  price: number;
  originalPrice: number;
  handleImageMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  showZoom: boolean;
  setShowZoom: (v: boolean) => void;
  zoomOrigin: { x: number; y: number };
}

export function ProductImageGallery({
  images, selectedImage, setSelectedImage, product, hasDiscount,
  price, originalPrice, handleImageMove, showZoom, setShowZoom, zoomOrigin
}: ProductImageGalleryProps) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div className="relative aspect-square rounded-2xl bg-surface-tertiary border border-border overflow-hidden cursor-crosshair"
        onMouseMove={handleImageMove}
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
      >
        {images.length > 0 && images[selectedImage] ? (
          <>
            <img src={images[selectedImage]} alt={product.name} loading="lazy"
              className="h-full w-full object-cover select-none"
              draggable={false}
            />
            {showZoom && (
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${images[selectedImage]})`,
                  backgroundPosition: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  backgroundSize: "250%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}
          </>
        ) : (
          <span className="text-6xl opacity-20">🏍️</span>
        )}
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
            -{Math.round((1 - price / originalPrice) * 100)}%
          </div>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((img: string, i: number) => (
          <button key={i} onClick={() => setSelectedImage(i)}
            className={`shrink-0 aspect-square w-20 rounded-lg border transition-all duration-300 overflow-hidden ${
              selectedImage === i ? "border-interactive-accent ring-1 ring-interactive-accent" : "border-border hover:border-border-accent"
            }`}
          >
            <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
