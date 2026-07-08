import { UserWhereInput } from "../../../generated/prisma/models";

export interface IUpdateProfile {
  skills?: string;
  experience?: string;
  pricing?: number;
}

export type IUpdateAvailability = Record<string, string[]>;


export interface ItechnicianQuery extends UserWhereInput {
    searchTerm?: string
    location?: string
    rating?: string
    minPrice?: string
    maxPrice?: string
} 