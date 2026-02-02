import { connectToDatabase } from "@/lib/mongodb";
import { Item } from "@/models/Item";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Calendar, Tag } from "lucide-react";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getItem(slug: string) {
  await connectToDatabase();
  const item = await Item.findOne({ slug });
  if (!item) return null;
  return { ...item.toObject(), _id: item._id.toString() };
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const item = await getItem(slug);

  if (!item) return {};

  return {
    title: `${item.name} | Lemmah Couture`,
    description: item.description ?? "Check out this item from Lemmah Couture",
    openGraph: {
      title: item.name,
      description: item.description ?? "Check out this item from Lemmah Couture",
      url: `${baseUrl}/item/${item.slug}`,
      type: "website",
      images: [
        {
          url: item.media.find(media => media.type === 'image')?.url || item.media[0]?.url || `${baseUrl}/default-og-image.jpg`,
          width: 1200,
          height: 630,
          alt: item.name,
        },
      ],
    },
  };
}

export default async function ItemPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getItem(slug);

  if (!item) notFound();

  const hasOnlyVideos = item.media.every(m => m.type === 'video');
  const imageMedia = item.media.filter(m => m.type === 'image');
  const videoMedia = item.media.find(m => m.type === 'video');
  const activeMedia = imageMedia.length > 0 ? imageMedia[0] : videoMedia;

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Catalog
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image Display */}
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {activeMedia?.type === 'image' ? (
                <Image
                  src={activeMedia.url}
                  alt={item.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : activeMedia?.type === 'video' ? (
                <video 
                  controls 
                  className="w-full h-full object-cover"
                  poster={imageMedia[0]?.url}
                >
                  <source src={activeMedia.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  <span className="text-lg">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {item.media.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {item.media.map((media, index) => (
                  <button
                    key={index}
                    className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
                  >
                    {media.type === 'image' ? (
                      <Image
                        src={media.url}
                        alt={`${item.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <video src={media.url} className="w-full h-full object-cover rounded-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Category Tag */}
            {item.category && (
              <Link 
                href={`/?category=${encodeURIComponent(item.category)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Tag className="w-3.5 h-3.5" />
                {item.category}
              </Link>
            )}

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {item.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(item.price)}
              </span>
            </div>

            {/* Description */}
            {item.description && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <WhatsAppButton itemName={item.name} price={item.price} />
            </div>

            {/* Item Meta Info */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Listed on {formatDate(item.createdAt)}</span>
              </div>
              {/* {item._id && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                    ID: {item._id}
                  </span>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
