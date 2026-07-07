export interface IUpdateProfile {
  skills?: string;
  experience?: string;
  pricing?: number;
}

export type IUpdateAvailability = Record<string, string[]>;
