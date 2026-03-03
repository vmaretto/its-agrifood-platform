'use client';

import { ImageItem, ImageGalleryItem } from '@/types/module';
import Image from 'next/image';

interface SingleImageProps {
  image: ImageItem;
  className?: string;
}

export function SingleImage({ image, className = '' }: SingleImageProps) {
  return (
    <figure className={`rounded-xl overflow-hidden ${className}`}>
      <div className="relative w-full">
        <img
          src={image.src}
          alt={image.alt || ''}
          className="w-full h-auto object-contain rounded-xl"
          style={{
            maxHeight: image.height ? `${image.height}px` : '500px',
          }}
        />
      </div>
      {image.caption && (
        <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

interface HeroImageProps {
  image: ImageItem;
}

export function HeroImage({ image }: HeroImageProps) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-6">
      <img
        src={image.src}
        alt={image.alt || ''}
        className="w-full h-auto object-cover"
        style={{
          maxHeight: image.height ? `${image.height}px` : '400px',
        }}
      />
      {image.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-sm">{image.caption}</p>
        </div>
      )}
    </div>
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
