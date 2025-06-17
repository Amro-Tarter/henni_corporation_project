/**
 * Compress an image file for upload.
 * @param {File} file
 * @returns {Promise<File>}
 */
export function compressImage(file) {
  const MAX_DIMENSION = 800;
  const QUALITY = 0.6;
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > height && width > MAX_DIMENSION) {
        height *= MAX_DIMENSION / width;
        width = MAX_DIMENSION;
      } else if (height > MAX_DIMENSION) {
        width *= MAX_DIMENSION / height;
        height = MAX_DIMENSION;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        resolve(new File([blob], file.name, {
          type: 'image/webp',
          lastModified: Date.now()
        }));
      }, 'image/webp', QUALITY);
    };
    img.src = URL.createObjectURL(file);
  });
}

export const downloadFile = async (url, filename) => {
  try {
    // Fetch the file
    const response = await fetch(url);
    const blob = await response.blob();
    
    // Create blob URL and trigger download
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: Open in new tab
    window.open(url, '_blank');
  }
};