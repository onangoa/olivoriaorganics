'use client';

import React, { useRef, useState } from 'react';

export interface PhotoUploaderValue {
  cover: string;
  gallery: string[];
}

interface PhotoUploaderProps {
  value: PhotoUploaderValue;
  onChange: (value: PhotoUploaderValue) => void;
  emptyCover?: string;
}

export default function PhotoUploader({ value, onChange, emptyCover = '/assets/no_image.png' }: PhotoUploaderProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pathInput, setPathInput] = useState('');

  const hasCover = Boolean(value.cover) && value.cover !== emptyCover;
  const allPhotos = hasCover ? [value.cover, ...value.gallery] : value.gallery;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.files) {
        throw new Error(data?.error || 'Upload failed. Please try again.');
      }
      const urls: string[] = data.files.map((file: { url: string }) => file.url);
      onChange(
        hasCover
          ? { cover: value.cover, gallery: [...value.gallery, ...urls] }
          : { cover: urls[0], gallery: urls.slice(1) }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const makeCover = (index: number) => {
    const photos = [...allPhotos];
    const [chosen] = photos.splice(index, 1);
    onChange({ cover: chosen, gallery: photos });
  };

  const removePhoto = (index: number) => {
    const photos = [...allPhotos];
    photos.splice(index, 1);
    if (photos.length === 0) {
      onChange({ cover: emptyCover, gallery: [] });
    } else {
      onChange({ cover: photos[0], gallery: photos.slice(1) });
    }
  };

  const setPathCover = () => {
    const path = pathInput.trim();
    if (!path) return;
    onChange({ cover: path, gallery: value.gallery });
    setPathInput('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {uploading ? 'Uploading…' : 'Upload Photos'}
        </button>
        <span className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF or AVIF — up to 5 MB each</span>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">{error}</p>
      )}

      {allPhotos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          No photos yet — the first photo you add becomes the cover.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allPhotos.map((url, index) => (
            <div key={`${url}-${index}`} className="rounded-xl border border-border overflow-hidden bg-muted/20">
              <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={index === 0 && hasCover ? 'Cover photo' : `Photo ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                {index === 0 && hasCover && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-foreground/80 text-background text-[10px] font-semibold uppercase tracking-wide rounded-full">
                    Cover
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center divide-x divide-border text-[11px] font-semibold">
                {!(index === 0 && hasCover) && (
                  <button type="button" onClick={() => makeCover(index)} className="flex-1 py-2 text-primary hover:bg-primary/5 transition-colors">
                    Make Cover
                  </button>
                )}
                <button type="button" onClick={() => removePhoto(index)} className="flex-1 py-2 text-red-600 hover:bg-red-50 transition-colors">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={pathInput}
          onChange={(e) => setPathInput(e.target.value)}
          placeholder="…or paste an existing image path / URL for the cover"
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        <button
          type="button"
          onClick={setPathCover}
          disabled={!pathInput.trim()}
          className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-40"
        >
          Set Cover
        </button>
      </div>
    </div>
  );
}
