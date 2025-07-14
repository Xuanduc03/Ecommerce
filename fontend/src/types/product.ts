export interface Category {
  _id: string;
  name: string;
}

export interface Subcategory {
  _id: string;
  name: string;
}

export interface Color {
  _id: string;
  name: string;
  code: string;
}

export interface Size {
  _id: string;
  size: string;
  heightRange: string;
  weightRange: string;
  name: string;
}

export interface Image {
  src: string;
  thumbnail: string;
}

export interface Price {
  current: number;
  discount: number;
  original?: number;
}

export interface Product {
  _id: string;
  productName: string;
  features: string;
  price: Price;
  colors: Color[];
  sizes: Size[];
  images: Image[];
  category: Category;
  subcategory: Subcategory;
  discount: string;
  brandNew: boolean;
  types: string[];
  description: string;
  seoDescription: string;
  stock: number;
}
