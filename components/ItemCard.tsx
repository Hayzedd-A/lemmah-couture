'use client';

import Image from 'next/image';
import { Heart, MessageCircle, DollarSign } from 'lucide-react';
import { Item } from './CatalogClient';

interface ItemCardProps {
  item: {
    _id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
  };
  isFavourite: boolean;
  onFavouriteToggle: (itemId: string) => void;
  onWhatsApp: (item: Item) => void;
  onClick: (item: Item) => void;
}

export function ItemCard({ 
  item, 
  isFavourite, 
  onFavouriteToggle, 
  onWhatsApp,
  onClick 
}: ItemCardProps) {
  const imageUrl = item.images?.[0] || '/placeholder.jpg';

  return (
    <article 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(item)}
    >
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400">
            No image
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavouriteToggle(item._id);
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Heart 
            className={`w-4 h-4 ${isFavourite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}`} 
          />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-3">
          <DollarSign className="w-4 h-4" />
          {item.price.toLocaleString()}
        </p>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWhatsApp(item);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
}

