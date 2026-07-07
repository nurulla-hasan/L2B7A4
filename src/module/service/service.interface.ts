import { ServiceWhereInput } from "../../../generated/prisma/models";

export interface ICreateService {
  name: string;
  description: string;
  price: number;
  location: string;
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

export interface IServiceQuery extends ServiceWhereInput {
    searchTerm?: string
    type?: string
    location?: string
    rating?: string
    page?: string
    limit?: string
} 