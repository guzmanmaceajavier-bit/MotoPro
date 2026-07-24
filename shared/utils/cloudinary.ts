export function optimizeCloudinaryUrl(url: string, options?: { width?: number; height?: number; quality?: string; format?: string }): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  const w = options?.width ?? 400;
  const q = options?.quality ?? "auto";
  const f = options?.format ?? "auto";
  let transforms = `w_${w},q_${q},f_${f}`;
  if (options?.height) transforms = `w_${w},h_${options.height},q_${q},f_${f}`;
  return url.replace("/image/upload/", `/image/upload/${transforms}/`);
}
