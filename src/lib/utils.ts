import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  image: string;
}

export interface Stylist {
  id: number;
  name: string;
  bio: string;
  image: string;
}

export interface Appointment {
  id: number;
  client_name: string;
  client_email: string;
  service_id: number;
  stylist_id: number;
  date: string;
  time: string;
  status: string;
  service_name?: string;
  stylist_name?: string;
}
