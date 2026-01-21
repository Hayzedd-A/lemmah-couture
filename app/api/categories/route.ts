import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Item } from '@/models/Item';
import { Category } from '@/models/Category';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Check if we have categories in the new Category collection
    const storedCategories = await Category.find().sort({ name: 1 }).lean();
    
    if (storedCategories.length > 0) {
      // Use categories from the Category collection
      const categories = storedCategories.map(cat => cat.name);
      return NextResponse.json({ categories, fromCollection: true });
    }
    
    // Fallback: get distinct categories from items for backward compatibility
    const categories = await Item.distinct('category').lean();
    return NextResponse.json({ categories, fromItems: true });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const categoryName = name.trim();

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      );
    }

    const newCategory = await Category.create({ name: categoryName });

    return NextResponse.json({
      success: true,
      category: {
        _id: newCategory._id.toString(),
        name: newCategory.name,
      },
      message: 'Category created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

