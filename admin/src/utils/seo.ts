export function updateSeo(title: string, description?: string): void {
  document.title = title ? `${title} | MotoPro Admin` : "MotoPro Admin";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", description || "Panel de administración MotoPro");
  } else if (description) {
    const el = document.createElement("meta");
    el.name = "description";
    el.content = description;
    document.head.appendChild(el);
  }
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", document.title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && description) ogDesc.setAttribute("content", description);
}
