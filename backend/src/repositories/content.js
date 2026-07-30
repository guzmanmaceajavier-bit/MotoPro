const BaseRepository = require("./BaseRepository");

const map = {
  testimonials: BaseRepository("testimonials", { name: "Testimonio" }),
  team: BaseRepository("team_members", { name: "Miembro" }),
  values: BaseRepository("company_values", { name: "Valor" }),
  gallery: BaseRepository("gallery_images", { name: "Imagen" }),
  "before-after": BaseRepository("before_after", { name: "Antes/Después" }),
  facilities: BaseRepository("facilities", { name: "Instalación" }),
  certifications: BaseRepository("certifications", { name: "Certificación" }),
  "garage-bays": BaseRepository("garage_bays", { name: "Bahía" }),
  "process-steps": BaseRepository("process_steps", { name: "Paso" }),
  "trust-items": BaseRepository("trust_items", { name: "Item" }),
  hero: BaseRepository("hero_slides", { name: "Slide" }),
  offers: BaseRepository("offer_slides", { name: "Oferta" }),
  faqs: BaseRepository("faqs", { name: "FAQ" }),
  "blog-categories": BaseRepository("blog_categories", { name: "Categoría de Blog" }),
  "blog-comments": BaseRepository("blog_comments", { name: "Comentario" }),
};

module.exports = map;
