"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Upload, X, Plus } from "lucide-react";
import MediaPreview from "./MediaPreview";

interface ItemFormProps {
  initialData?: {
    _id?: string;
    name: string;
    description: string;
    price: number;
    media: { type: "image" | "video"; url: string }[];
    category: string;
  };
  categories: string[];
  onSubmit: (data: unknown) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface MediaPreview {
  file: File;
  previewUrl: string;
  type: "image" | "video";
  isNew: boolean;
}

export function ItemForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading,
}: ItemFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    category: initialData?.category || categories[0] || "",
    media: initialData?.media || [],
  });
  const [newCategory, setNewCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allCategories = newCategory ? [...categories, newCategory] : categories;

  // Load existing media from initialData into previews
  useEffect(() => {
    if (initialData?.media) {
      const existingPreviews = initialData.media.map((media, index) => ({
        file: new File([], `existing_${index}`),
        previewUrl: media.url,
        type: media.type,
        isNew: false,
      }));
      setMediaPreviews(existingPreviews);
    }
  }, [initialData]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      mediaPreviews.forEach((preview) => {
        if (preview.isNew && preview.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(preview.previewUrl);
        }
      });
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      // Upload new media that haven't been uploaded yet
      let uploadedMedia: { url: string; type: "image" | "video" }[] = [];

      console.log("Processing media preview:", mediaPreviews);
      if (mediaPreviews.length === 0) {
        throw new Error("Please add at least one image or video.");
      }
      const uploadFormData = new FormData();
      for (const preview of mediaPreviews)
        uploadFormData.append("file", preview.file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.ok) {
        const { data } = (await response.json()) as {
          data: { url: string; type: "image" | "video" }[];
        };
        uploadedMedia = data;
        console.log("Uploaded media:", uploadedMedia);
      } else {
        throw new Error("Failed to upload media");
      }

      await onSubmit({
        ...formData,
        media: uploadedMedia,
        category: newCategory || formData.category || "all",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      alert( error.message || "Failed to upload media. Please try again.");
      setIsUploading(false);
    }
  };

  const handleMediaSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPreviews: MediaPreview[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/"))
        continue;

      const type = file.type.startsWith("video/") ? "video" : "image";
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push({
        file,
        previewUrl,
        type,
        isNew: true,
      });
    }

    setMediaPreviews((prev) => [...prev, ...newPreviews]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    console.log("Selected media previews:", mediaPreviews);
  };

  const removeMedia = (index: number) => {
    setMediaPreviews((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Revoke the object URL to avoid memory leaks
      if (prev[index].isNew && prev[index].previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(prev[index].previewUrl);
      }
      return newPreviews;
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleMediaSelect(e.dataTransfer.files);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Item Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price
          </label>
          <input
            type="string"
            value={formData.price}
            onChange={(e) => {
              const valid = !(isNaN(parseFloat(e.target.value)));
                setFormData((prev) => ({
                  ...prev,
                  price: valid ? parseFloat(e.target.value).toLocaleString() as unknown as number : 0,
                }))
              }
            }
            min={0}
            step={0.01}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="__new__">+ Add new category</option>
          </select>
        </div>
      </div>

      {formData.category === "__new__" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Category Name
          </label>
          <input
            type="text"
            value={newCategory || ""}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Media
        </label>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Drag and drop images or videos here, or click to select
          </p>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            ref={fileInputRef}
            onChange={(e) => handleMediaSelect(e.target.files)}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Select Media
          </label>
        </div>

        {isUploading && (
          <p className="text-sm text-gray-500 mt-2">Uploading media...</p>
        )}

        {mediaPreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {mediaPreviews.map((preview, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg flex overflow-hidden bg-gray-100 dark:bg-gray-700"
              >
                <MediaPreview
                  media={{ type: preview.type, url: preview.previewUrl }}
                  itemName={formData.name}
                />
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || isUploading}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading
            ? "Uploading media"
            : isLoading
              ? "Saving..."
              : initialData?._id
                ? "Update Item"
                : "Add Item"}
        </button>
      </div>
    </form>
  );
}
