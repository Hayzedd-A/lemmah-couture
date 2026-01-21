import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for faster lookups
CategorySchema.index({ name: 1 });

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

