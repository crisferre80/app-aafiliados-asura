import { supabase } from '../lib/supabaseClient';

export const uploadComprobante = async (file: File, fileName: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('comprobantes')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false, // Evita sobrescribir archivos existentes
      });

    if (error) {
      console.error('Error al subir el comprobante:', error.message);
      return null;
    }

    // Obtener la URL pública del archivo
    const { data: publicUrlData } = supabase.storage
      .from('comprobantes')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error inesperado al subir el comprobante:', error);
    return null;
  }
};