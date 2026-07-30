import { Link } from "react-router-dom";

interface RelatedProductsProps {
  relatedProducts: any[];
  formatPrice: (val: number) => string;
}

export function RelatedProducts({ relatedProducts, formatPrice }: RelatedProductsProps) {
  if (relatedProducts.length === 0) return null;

  return (
    <section className="mt-20 pt-12 border-t border-border">
      <h2 className="text-xl font-bold text-text-primary mb-8">Productos relacionados</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {relatedProducts.map((rp: any, i: number) => (
          <Link key={i} to={`/tienda/${rp.slug}`}
            className="group bg-surface-secondary border border-border rounded-lg overflow-hidden hover:border-border-accent transition-all"
          >
            <div className="aspect-square bg-surface-tertiary flex items-center justify-center p-4">
              <img src={rp.image} alt={rp.name} loading="lazy" className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-text-primary group-hover:text-interactive-accent transition-colors">{rp.name}</h3>
              <p className="text-sm font-bold text-interactive-accent mt-1">{formatPrice(rp.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
