export const MAX_DIM_FOTO = 800;
export const QUALIDADE_FOTO = 0.7;

export async function fileToDataUrl(file, maxDim = MAX_DIM_FOTO, qualidade = QUALIDADE_FOTO) {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, largura, altura);

  return canvas.toDataURL('image/jpeg', qualidade);
}
