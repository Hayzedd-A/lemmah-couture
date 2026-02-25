import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Item } from "@/models/Item";
import { Favourite } from "@/models/Favourite";
import { generateSlug } from "@/lib/util";
import type { PipelineStage } from "mongoose";

type SortField = "price" | "latest" | "likes";
type SortOrder = "asc" | "desc";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const sort = (searchParams.get("sort") as SortField) || "latest";
    const order = (searchParams.get("order") as SortOrder) || "desc";

    const orderVal = order === "asc" ? 1 : -1;

    const matchStage =
      category && category !== "all" ? { $match: { category } } : { $match: {} };

    // Determine sort field for the pipeline
    let sortStage: PipelineStage;
    if (sort === "likes") {
      sortStage = { $sort: { favouriteCount: orderVal, createdAt: -1 } };
    } else if (sort === "price") {
      sortStage = { $sort: { price: orderVal } };
    } else {
      // latest
      sortStage = { $sort: { createdAt: orderVal } };
    }

    const items = await Item.aggregate([
      matchStage,
      {
        $lookup: {
          from: Favourite.collection.name,
          localField: "_id",
          foreignField: "itemId",
          as: "favourites",
        },
      },
      {
        $addFields: {
          favouriteCount: { $size: "$favourites" },
        },
      },
      { $unset: "favourites" },
      sortStage,
    ]);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { name, description = "all", price, media, category } = body;

    if (!name || price === undefined || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let slug;
    let exists = true;

    while (exists) {
      slug = generateSlug(name);
      let existed = await Item.findOne({ where: { slug } });
      exists = !!existed;
    }

    const item = await Item.create({
      name,
      description: description,
      price,
      slug,
      media: media || [],
      category,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 },
    );
  }
}
