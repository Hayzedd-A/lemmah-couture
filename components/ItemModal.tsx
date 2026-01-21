"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import { Item } from "./CatalogClient";

interface ItemModalProps {
  item: {
    _id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
  } | null;
  isOpen: boolean;
  isFavourite: boolean;
  onClose: () => void;
  onFavouriteToggle: (itemId: string) => void;
  onWhatsApp: (item: Item) => void;
}

export function ItemModal({
  item,
  isOpen,
  isFavourite,
  onClose,
  onFavouriteToggle,
  onWhatsApp,
}: ItemModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !item) return null;

  const images = item.images || [];
  const hasMultipleImages = images.length > 1;

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative aspect-4/3 bg-gray-100 dark:bg-gray-800">
          {images.length > 0 ? (
            <>
              <Image
                src={images[currentImageIndex]}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 500px"
              />

              {hasMultipleImages && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              No image available
            </div>
          )}
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-300px)]">
          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded mb-2">
            {item.category}
          </span>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {item.name}
          </h2>

          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-4">
            <i className="mr-1">₦</i>

            {item.price.toLocaleString()}
          </p>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={() => onFavouriteToggle(item._id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
              isFavourite
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavourite ? "fill-current" : ""}`} />
            {isFavourite ? "Favourited" : "Favourite"}
          </button>

          <button
            onClick={() => onWhatsApp(item)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Send to WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
