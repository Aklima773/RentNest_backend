export interface ICreatePropertyRequest {
  title: string;
  description: string;
  price: number | string;
  location: string;
  categoryId: string;
  isAvailable?: boolean;
}

export interface IUpdatePropertyRequest {
  title?: string;
  description?: string;
  price?: number | string;
  location?: string;
  categoryId?: string;
  isAvailable?: boolean;
}