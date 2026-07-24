export function shareWhatsApp(text: string, phone?: string) {
  const base = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : "https://wa.me";
  const url = `${base}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

export function shareWhatsAppItem(label: string, details: string, link?: string) {
  let text = `*${label}*\n${details}`;
  if (link) text += `\n${link}`;
  shareWhatsApp(text);
}
