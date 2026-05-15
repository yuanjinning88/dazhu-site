import { supabase } from '@/lib/supabase';

const MAX_WIDTH = 1920;

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      if (width <= MAX_WIDTH) {
        resolve(file);
        return;
      }
      const ratio = MAX_WIDTH / width;
      const canvas = document.createElement('canvas');
      canvas.width = MAX_WIDTH;
      canvas.height = Math.round(height * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else resolve(file);
        },
        file.type || 'image/webp',
        0.85,
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadImage(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const ext = file.name.split('.').pop() || 'png';
  const fileName = `${crypto.randomUUID()}.${ext}`;

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id || 'anonymous';
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from('content-images')
    .upload(filePath, compressed, {
      contentType: file.type || 'image/png',
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('content-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
