"use client";

import {
  Search,
  ShoppingBag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export type SortField = "latest" | "price" | "likes";
export type SortOrder = "asc" | "desc";

interface HeaderProps {
  businessName: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favouriteCount: number;
  onFavouritesClick: () => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "price", label: "Price" },
  { value: "likes", label: "Top Likes" },
];

export function Header({
  businessName,
  searchQuery,
  onSearchChange,
  favouriteCount,
  onFavouritesClick,
  sortField,
  sortOrder,
  onSortChange,
}: HeaderProps) {
  const handleFieldClick = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction when same field clicked
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Default to desc for a newly selected field
      onSortChange(field, "desc");
    }
  };

  const OrderIcon = sortOrder === "asc" ? ArrowUp : ArrowDown;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3">
        {/* Top row: business name + favourites */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {businessName}
          </h1>
          <button
            onClick={onFavouritesClick}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            aria-label="View favourites"
          >
            <ShoppingBag className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {favouriteCount > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {favouriteCount}
              </span>
            )}
          </button>
        </div>

        {/* Search bar */}
        {/* make them be on single line on desktop view */}
        <div className="flex items-center gap-4 sm:flex-row flex-col">
          <div className="relative mb-3 w-full flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort row */}
          <div className="flex w-full sm:w-auto items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <div className="flex items-center gap-1 flex-wrap">
              {SORT_OPTIONS.map(({ value, label }) => {
                const isActive = sortField === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleFieldClick(value)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    aria-label={`Sort by ${label} ${isActive ? (sortOrder === "asc" ? "ascending" : "descending") : ""}`}
                  >
                    {label}
                    {isActive && <OrderIcon className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
