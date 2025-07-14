export interface Subcategory {
  _id: string;
  name: string;
  image: string;
  slug?: string;
}

export interface Category {
  _id: string;
  name: string;
  images?: string;
  children: Subcategory[];
  parentId?: string;
}