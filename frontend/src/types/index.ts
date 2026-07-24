export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
  category?: string;
  brand?: string;
  ref?: string;
  warranty?: string;
  quality_label?: string;
  compatibility_text?: string;
}

export interface CheckoutForm {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  documento: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  barrio: string;
  referencia: string;
  marca: string;
  modelo: string;
  ano: string;
  cilindraje: string;
  notas: string;
  envio: "recoger" | "local" | "nacional";
  pago: "visa" | "mastercard" | "pse" | "nequi" | "daviplata" | "transferencia";
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
