'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  itemName: string;
  price: number;
}

export function WhatsAppButton({ itemName, price }: WhatsAppButtonProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in the ${itemName} (${formatPrice(price)}) from Lemmah Couture. Is it still available?`;
    const whatsappUrl = `https://wa.me/2348100000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsApp}
      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-green-500/25"
    >
      <MessageCircle className="w-5 h-5" />
      Contact on WhatsApp
    </button>
  );
}

