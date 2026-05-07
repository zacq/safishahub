import React, { useState, useRef, useEffect, useCallback } from 'react';
import { carpetImagesService } from '../services/supabaseService';

const MAX_IMAGES = 3;
const ALLOWED_ACCEPT = 'image/jpeg,image/jpg,image/png,image/webp';

export default function CarpetImageUploader({ images = [], onChange, context, recordId, disabled = false }) {
  // paths: storage path strings (what we persist)
  // previews: { path, url } — url is signed URL or object URL for local blobs
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  // When `images` prop changes (e.g. after save or on edit-mode load), resolve signed URLs
  useEffect(() => {
    let cancelled = false;

    async function loadUrls() {
      if (!images || images.length === 0) {
        setPreviews([]);
        return;
      }
      const urls = await carpetImagesService.getSignedUrls(images);
      if (!cancelled) {
        setPreviews(images.map((path, i) => ({ path, url: urls[i] || null })));
      }
    }

    loadUrls();
    return () => { cancelled = true; };
  }, [images]);

  const handleFiles = useCallback(async (files) => {
    setError('');
    const remaining = MAX_IMAGES - previews.length;
    const selected = Array.from(files).slice(0, remaining);

    if (selected.length === 0) return;
    if (previews.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    setUploading(true);
    const newPaths = [];

    for (const file of selected) {
      try {
        const path = await carpetImagesService.upload(file, context, recordId);
        const url = await carpetImagesService.getSignedUrl(path);
        newPaths.push({ path, url });
      } catch (err) {
        setError(err.message || 'Upload failed');
        setUploading(false);
        return;
      }
    }

    const updated = [...previews, ...newPaths];
    setPreviews(updated);
    onChange(updated.map((p) => p.path));
    setUploading(false);
  }, [previews, context, recordId, onChange]);

  const handleRemove = useCallback(async (index) => {
    const target = previews[index];
    try {
      await carpetImagesService.remove(target.path);
    } catch {
      // Don't block UI if delete fails — path is orphaned but not critical
    }
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onChange(updated.map((p) => p.path));
  }, [previews, onChange]);

  const atLimit = previews.length >= MAX_IMAGES;

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Carpet Condition Photos <span className="text-gray-400 font-normal">(Optional)</span>
      </label>

      {/* Thumbnail grid */}
      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {previews.map((p, i) => (
            <div key={p.path} className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
              {p.url ? (
                <img
                  src={p.url}
                  alt={`Carpet ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Loading...</div>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none shadow"
                  aria-label="Remove image"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload buttons */}
      {!disabled && (
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            disabled={atLimit || uploading}
            onClick={() => cameraRef.current?.click()}
            className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg disabled:opacity-40 active:bg-teal-700"
          >
            Take Photo
          </button>
          <button
            type="button"
            disabled={atLimit || uploading}
            onClick={() => galleryRef.current?.click()}
            className="px-4 py-2 bg-white border-2 border-teal-600 text-teal-700 text-sm rounded-lg disabled:opacity-40 active:bg-teal-50"
          >
            Upload from Gallery
          </button>

          {/* Hidden inputs */}
          <input
            ref={cameraRef}
            type="file"
            accept={ALLOWED_ACCEPT}
            capture="environment"
            className="hidden"
            onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
          />
          <input
            ref={galleryRef}
            type="file"
            accept={ALLOWED_ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
          />
        </div>
      )}

      {uploading && (
        <div className="mt-2 flex items-center gap-2 text-sm text-teal-700">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Compressing and uploading...
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {!disabled && (
        <p className="mt-2 text-xs text-gray-400">
          Capture clear photos of the carpet before cleaning for tracking and condition reference. Max {MAX_IMAGES} images.
        </p>
      )}
    </div>
  );
}
