import { Quote } from './quote';

/**
 * Sport type definition
 */
export type Sport = {
  /**
   * Unique identifier for the sport
   */
  id: number;
  /**
   * Name of the sport
   */
  name: string;
  /**
   * Description of the sport
   */
  description: string;
  /**
   * List of quotes associated with the sport
   */
  quotes?: Quote[];
  /**
   * Indicates if the sport is a principal sport
   */
  isPrincipal? : boolean;
}

export type SportSelection = {
  id: number;
  isPrincipal: boolean;
  quoteId?: number;
}