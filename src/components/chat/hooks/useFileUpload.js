import { useState } from "react";
import { compressImage } from "../utils/fileHelpers";

/**
 * Hook to handle file selection, preview, and removal.
 * @returns {Object} { file, preview, handleFileChange, removeFile }
 */
export function useFileUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      alert('Only image files allowed');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert(`File too large. Max 10MB allowed`);
      return;
    }

    try {
      const compressedFile = await compressImage(selectedFile);
      setFile(compressedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview({ url: e.target.result, type: 'image' });
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview({ url: e.target.result, type: 'image' });
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setFile(null);
    setPreview(null);
  };

  return { file, preview, handleFileChange, removeFile };
}
