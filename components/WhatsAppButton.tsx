"use client";

import { getShareUrl } from "@/lib/util";
import { MessageCircle } from "lucide-react";
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || "My Catalog";

interface WhatsAppButtonProps {
  itemName: string;
  price: number;
  slug: string;
}

export function WhatsAppButton({ itemName, price, slug }: WhatsAppButtonProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const handleWhatsApp = () => {
    const message = `Hi, I found interest in this item: ${itemName}\n\n${getShareUrl(slug) || ""}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
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
