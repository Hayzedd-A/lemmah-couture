"use client";

import { useState, useEffect, useMemo } from "react";
import { Header, SortField, SortOrder } from "@/components/Header";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ItemCard } from "@/components/ItemCard";
import { ItemModal } from "@/components/ItemModal";
import { useAnonymousUser, useFavourites } from "@/hooks/useAnonymousUser";
import { getShareUrl } from "@/lib/util";
import { ItemProps } from "@/app/types";
import { Loader2 } from "lucide-react";

export default function CatalogClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Array<ItemProps>>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ItemProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("latest");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const userId = useAnonymousUser();
  const { favourites, toggleFavourite } = useFavourites(userId);

  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || "My Catalog";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          sort: sortField,
          order: sortOrder,
        });
        const [itemsRes, categoriesRes] = await Promise.all([
          fetch(`/api/items?${params.toString()}`),
          fetch("/api/categories"),
        ]);

        if (itemsRes.ok) {
          const data = await itemsRes.json();
          setItems(data.items);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories([
            ...data.categories,
            `Favourites (${favourites.size})`,
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortField, sortOrder]);

  useEffect(() => {
    setCategories((prev) => {
      const updatedCategories = [...prev];
      const favouritesIndex = updatedCategories.findIndex((cat) =>
        cat.startsWith("Favourites"),
      );
      if (favouritesIndex !== -1) {
        updatedCategories[favouritesIndex] = `Favourites (${favourites.size})`;
      }
      return updatedCategories;
    });
  }, [favourites]);

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by category
    if (activeCategory !== "all" && !activeCategory.includes("Favourites")) {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }

    if (activeCategory.includes("Favourites")) {
      filtered = filtered.filter((item) => favourites.has(item._id));
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [items, activeCategory, searchQuery, favourites]);

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  const handleItemClick = (item: ItemProps) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleFavouriteToggle = async (itemId: string) => {
    await toggleFavourite(itemId);
  };

  const handleWhatsApp = (item: ItemProps) => {
    const formatPrice = (price: number) => {
      return `₦${price.toLocaleString()}`;
    };
    const message = `Hi, I found interest in this item: ${item.name} - (${formatPrice(item.price)}) \n\n${getShareUrl(item.slug) || ""}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        businessName={businessName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favouriteCount={favourites.size}
        onFavouritesClick={() => {
          setActiveCategory("Favourites");
        }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="px-4 py-6">
        {isLoading ? (
          <div className="flex gap-2 justify-center items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-gray-500 dark:text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? "No items found" : "No items available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                isFavourite={favourites.has(item._id)}
                onFavouriteToggle={handleFavouriteToggle}
                onWhatsApp={handleWhatsApp}
                onClick={handleItemClick}
              />
            ))}
          </div>
        )}
      </main>

      <ItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        isFavourite={selectedItem ? favourites.has(selectedItem._id) : false}
        onClose={handleCloseModal}
        onFavouriteToggle={handleFavouriteToggle}
        onWhatsApp={handleWhatsApp}
      />
    </div>
  );
}
