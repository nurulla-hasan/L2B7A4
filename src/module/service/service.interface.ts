
export interface ICreateService {
  name: string;
  description: string;
  price: number;
  categoryId: string;
}

export interface IUpdateService {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
}

export interface IServiceFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
}