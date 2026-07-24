import { useRef, useState } from "react";
import { Upload, X, Link as LinkIcon } from "lucide-react";
import { uploadFile } from "@/api/client";
import { useToast } from "@/components/Toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Imagen" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadFile("/upload", file);
      const url = res.data?.url || res.url || res.image || "";
      if (url) {
        onChange(url);
        showToast("success", "Imagen subida");
      }
    } catch { showToast("error", "Error al subir"); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-2">
      <label className="form-label">{label}</label>
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm border border-border bg-surface-secondary text-body-sm">
        {uploading ? "Subiendo..." : <><Upload size={16} /> Subir archivo</>}
      </button>
      <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
      {value && <img src={value} className="h-20 w-20 object-cover rounded-sm" />}
    </div>
  );
}
