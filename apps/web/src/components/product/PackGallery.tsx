import { useState } from 'react';

interface PackGalleryProps {
  images?: string[];
  name: string;
}

const PackGallery = ({ images = [], name }: PackGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Default image if no images provided
  const defaultImage = (
    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
      <svg className="w-32 h-32 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );

  const allImages = images.length > 0 ? images : [null]; // Use null for default

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-gray-800 rounded-xl overflow-hidden">
        {allImages[selectedImage] ? (
          <img
            src={allImages[selectedImage]!}
            alt={`${name} - Image ${selectedImage + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          defaultImage
        )}
      </div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedImage === index
                  ? 'border-indigo-500'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              {image ? (
                <img
                  src={image}
                  alt={`${name} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xs text-white">📦</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackGallery;