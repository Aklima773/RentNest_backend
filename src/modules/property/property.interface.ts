export interface ICreatePropertyRequest {
  title: string;
  description: string;
  price: number | string;
  location: string;
  categoryId: string;
  isAvailable?: boolean;
}

export interface IUpdatePropertyRequest{
  title?: string;
  description?: string;
  price?: number | string;
  location?: string;
  categoryId?: string;
  isAvailable?: boolean;
  amenities?: string;
}

export interface IPropertyQuery {
  searchTerm?: string;
  location?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  propertyType?: string; // e.g., category name or categoryId
  categoryId?: string;
  amenities?: string | string[]; // e.g., "wifi,parking" or ["wifi", "parking"]
  isAvailable?: string | boolean;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}