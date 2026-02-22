import { connectToDatabase } from "@/lib/mongodb";
import { Item } from "@/models/Item";
import CatalogClient from "@/components/CatalogClient";

async function getItems() {
  try {
    await connectToDatabase();
    const items = await Item.find().sort({ createdAt: -1 });
    return items.map((item) => ({
      ...item.toObject(),
      _id: item._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
}

async function getCategories() {
  try {
    await connectToDatabase();
    const categories = await Item.distinct("category");
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CatalogClient />
    </main>
  );
}
