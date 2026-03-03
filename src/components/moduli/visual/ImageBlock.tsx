'use client';

import { useState } from 'react';
import { ImageItem, ImageGalleryItem } from '@/types/module';

// Lightbox Modal Component
interface LightboxProps {
  image: ImageItem;
  onClose: () => void;
}

function Lightbox({ image, onClose }: LightboxProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors z-50"
        aria-label="Chiudi"
      >
        ✕
      </button>
      
      {/* Image container */}
      <div 
        className="relative max-w-[95vw] max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.src}
          alt={image.alt || ''}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
        {image.caption && (
          <p className="text-white text-center mt-4 text-sm">
            {image.caption}
          </p>
        )}
      </div>
    </div>
  );
}

interface SingleImageProps {
  image: ImageItem;
  className?: string;
}

export function SingleImage({ image, className = '' }: SingleImageProps) {
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <>
      <figure 
        className={`rounded-xl overflow-hidden cursor-pointer group ${className}`}
        onClick={() => setShowLightbox(true)}
      >
        <div className="relative w-full">
          <img
            src={image.src}
            alt={image.alt || ''}
            className="w-full h-auto object-contain rounded-xl transition-transform group-hover:scale-[1.02]"
            style={{
              maxHeight: image.height ? `${image.height}px` : '500px',
            }}
          />
          {/* Zoom hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <span className="text-white text-4xl opacity-0 group-hover:opacity-70 transition-opacity">
              🔍
            </span>
          </div>
        </div>
        {image.caption && (
          <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
            {image.caption}
          </figcaption>
        )}
      </figure>

      {showLightbox && (
        <Lightbox image={image} onClose={() => setShowLightbox(false)} />
      )}
    </>
  );
}

interface HeroImageProps {
  image: ImageItem;
}

export function HeroImage({ image }: HeroImageProps) {
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <>
      <div 
        className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-6 cursor-pointer group"
        onClick={() => setShowLightbox(true)}
      >
        <img
          src={image.src}
          alt={image.alt || ''}
          className="w-full h-auto object-cover transition-transform group-hover:scale-[1.02]"
          style={{
            maxHeight: image.height ? `${image.height}px` : '400px',
          }}
        />
        {/* Zoom hint */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          🔍 Clicca per ingrandire
        </div>
        {image.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white text-sm">{image.caption}</p>
          </div>
        )}
      </div>

      {showLightbox && (
        <Lightbox image={image} onClose={() => setShowLightbox(false)} />
      )}
    </>
  );
}

interface ImageGalleryProps {
  gallery: ImageGalleryItem;
}

export function ImageGallery({ gallery }: ImageGalleryProps) {
  const { images, columns = 2, gap = 'md' } = gallery;
  
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colClasses[columns]} ${gapClasses[gap]}`}>
      {images.map((image, idx) => (
        <SingleImage key={idx} image={image} />
      ))}
    </div>
  );
}

interface ImageListProps {
  images: ImageItem[];
}

export function ImageList({ images }: ImageListProps) {
  if (images.length === 1) {
    return <SingleImage image={images[0]} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {images.map((image, idx) => (
        <SingleImage key={idx} image={image} />
      ))}
    </div>
  );
}

export default SingleImage;
