import { useState, useEffect, useRef } from 'react';
import { uploadImage, STORAGE_BUCKETS } from '../lib/supabase';

interface ImageGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

interface FeaturedImageProps {
  url: string;
  onChange: (url: string) => void;
  alt?: string;
  className?: string;
}

interface GalleryImageProps {
  url: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  className?: string;
}

// Default fallback image placeholder
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200' fill='none'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Cpath d='M66.25 75.25L100 108.75L133.75 75.25' stroke='%239ca3af' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M100 92.5V152.5' stroke='%239ca3af' stroke-width='4' stroke-linecap='round'/%3E%3Ccircle cx='100' cy='83' r='8' stroke='%239ca3af' stroke-width='4'/%3E%3Ctext x='100' y='180' text-anchor='middle' fill='%236b7280' font-size='12' font-family='system-ui'%3EImage%3C/text%3E%3C/svg%3E";

const FeaturedImage = ({
  url,
  onChange,
  alt = "Featured image",
  className = ""
}: FeaturedImageProps) => {
  const [previewUrl, setPreviewUrl] = useState(url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(url || '');
    setHasError(false);
  }, [url]);

  const handleUrlChange = (newUrl: string) => {
    setPreviewUrl(newUrl);
    onChange(newUrl);

    if (newUrl.trim()) {
      setIsLoading(true);
      setHasError(false);

      // Test if image loads successfully
      const img = new Image();
      img.onload = () => {
        setIsLoading(false);
        setHasError(false);
      };
      img.onerror = () => {
        setIsLoading(false);
        setHasError(true);
      };
      img.src = newUrl;
    } else {
      setIsLoading(false);
      setHasError(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Upload to Supabase Storage
      const result = await uploadImage(file, STORAGE_BUCKETS.PRODUCTS, 'featured');

      setUploadProgress(100);
      await new Promise(resolve => setTimeout(resolve, 200)); // Brief delay for UI

      handleUrlChange(result.url);
      setUploadProgress(null);
    } catch (error) {
      console.error('Upload failed:', error);
      setHasError(true);
      setUploadProgress(null);

      // Show error message
      alert(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl.trim() ? previewUrl : FALLBACK_IMAGE;
  const showPlaceholder = hasError || !previewUrl.trim();

  return (
    <div className={`featured-image-upload ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Featured Image URL *
      </label>

      <div className="space-y-3">
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="url"
                value={previewUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Enter image URL or click upload to select file"
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={triggerFileUpload}
                disabled={isLoading}
                className="px-3 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Uploading...' : 'Upload File'}
              </button>

              {previewUrl.trim() && (
                <button
                  type="button"
                  onClick={() => handleUrlChange('')}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload progress indicator */}
          {uploadProgress !== null && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-center">
            <div className="w-48 h-32 bg-white rounded border overflow-hidden relative">
              <img
                src={!showPlaceholder ? displayUrl : FALLBACK_IMAGE}
                alt={alt}
                className={`w-full h-full object-cover ${
                  showPlaceholder ? 'opacity-50' : ''
                } ${isLoading ? 'animate-pulse' : ''}`}
                onError={() => setHasError(true)}
              />

              {isLoading && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}

              {showPlaceholder && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-1 text-xs text-gray-500">
                      {hasError ? 'Invalid image URL' : 'No image selected'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF, WebP • Recommended size: 800×600px
        </div>
      </div>
    </div>
  );
};

const GalleryImage = ({
  url,
  onChange,
  onRemove,
  className = ""
}: GalleryImageProps) => {
  const [previewUrl, setPreviewUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(url);
    setHasError(false);
  }, [url]);

  const handleUrlChange = (newUrl: string) => {
    setPreviewUrl(newUrl);
    onChange(newUrl);

    if (newUrl.trim()) {
      setIsLoading(true);
      setHasError(false);

      const img = new Image();
      img.onload = () => {
        setIsLoading(false);
        setHasError(false);
      };
      img.onerror = () => {
        setIsLoading(false);
        setHasError(true);
      };
      img.src = newUrl;
    } else {
      setIsLoading(false);
      setHasError(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const result = await uploadImage(file, STORAGE_BUCKETS.PRODUCTS, 'gallery');
      handleUrlChange(result.url);
    } catch (error) {
      console.error('Upload failed:', error);
      setHasError(true);
      alert(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`gallery-image-item ${className}`}>
      <div className="relative group">
        <div className="aspect-square bg-white rounded border overflow-hidden relative">
          <img
            src={!hasError && previewUrl.trim() ? previewUrl : FALLBACK_IMAGE}
            alt="Gallery image"
            className={`w-full h-full object-cover ${
              (hasError || !previewUrl.trim()) ? 'opacity-50' : ''
            } ${isLoading ? 'animate-pulse' : ''}`}
            onError={() => setHasError(true)}
          />

          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}

          {(hasError || !previewUrl.trim()) && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="mt-1">
                  <p className="text-xs text-gray-500">
                    {hasError ? 'Upload failed' : 'Click to upload'}
                  </p>
                  {previewUrl.trim() && (
                    <button
                      onClick={triggerFileUpload}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Try again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upload overlay */}
          {!previewUrl.trim() && !isLoading && (
            <button
              onClick={triggerFileUpload}
              className="absolute inset-0 w-full h-full bg-transparent border-0 cursor-pointer"
            />
          )}
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* URL input */}
      <input
        type="url"
        value={previewUrl}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder="Or enter image URL..."
        className="mt-2 block w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

const ImageGallery = ({
  images,
  onChange,
  maxImages = 10,
  className = ""
}: ImageGalleryProps) => {
  const [localImages, setLocalImages] = useState<string[]>(images || []);

  useEffect(() => {
    setLocalImages(images || []);
  }, [images]);

  const handleImagesChange = (newImages: string[]) => {
    setLocalImages(newImages);
    onChange(newImages);
  };

  const addImage = () => {
    if (localImages.length < maxImages) {
      handleImagesChange([...localImages, '']);
    }
  };

  const updateImageUrl = (index: number, url: string) => {
    const newImages = [...localImages];
    newImages[index] = url;
    handleImagesChange(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = localImages.filter((_, i) => i !== index);
    handleImagesChange(newImages);
  };

  return (
    <div className={`image-gallery ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Image Gallery URLs
      </label>

      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {localImages.map((imageUrl, index) => (
            <GalleryImage
              key={index}
              url={imageUrl}
              onChange={(url) => updateImageUrl(index, url)}
              onRemove={() => removeImage(index)}
              className="gallery-image-item"
            />
          ))}

          {localImages.length < maxImages && (
            <button
              type="button"
              onClick={addImage}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors group"
            >
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="mt-1 block text-xs font-medium text-gray-900">Add Image</span>
              </div>
            </button>
          )}
        </div>

        {!localImages.length && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first image.</p>
            <button
              type="button"
              onClick={addImage}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Image
            </button>
          </div>
        )}

        {localImages.length > 0 && (
          <div className="text-xs text-gray-500">
            {localImages.length} of {maxImages} images • Drag to reorder • Hover to remove
          </div>
        )}
      </div>
    </div>
  );
};

export { FeaturedImage, ImageGallery };
