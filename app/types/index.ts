export interface ItemProps {
  _id: string;
  name: string;
  description: string;
  slug: string;
  price: number;
  media: { type: 'image' | 'video'; url: string }[];
  category: string;
  createdAt: Date;
  favouriteCount?: number;
}
