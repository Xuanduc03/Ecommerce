import type { ComponentType } from "react";

export interface IRoute {
    path: string;
    component: ComponentType;
    layout?: ComponentType | null; // Layout can be null for public routes
    children?: IRoute[]; // Nested routes
}

export type RouteParams = {
    id?: string; // Optional parameter for dynamic routes
    categoryId?: string; // Optional parameter for category routes
    subcategoryId?: string; // Optional parameter for subcategory routes
    productId?: string; // Optional parameter for product routes
}