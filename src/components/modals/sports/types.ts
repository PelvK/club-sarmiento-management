import { Quote } from "../../../lib/types";

export interface SportFormData {
  name: string;
  description: string;
  quotes: Quote[];
}

export interface SocietaryQuoteFormData {
    quotes: Quote[];
}

export type QuoteFormData = Omit<Quote, 'id'>

export type QuoteEditData = Omit<Quote, 'id'> & { id?: number };