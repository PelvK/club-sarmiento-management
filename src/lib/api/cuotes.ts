import { Quote } from "../types/quote";
import { CONSOLE_LOG } from "../utils/consts";
import { BASE_API_URL } from "../utils/strings";

//const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const cuotesApi = {
  async getSocietaryCuotes(): Promise<Quote[]> {
    const API = `${BASE_API_URL}/cuotes/get_societary_cuotes.php`;
    const rawData = await fetch(API);
    const json = await rawData.json();

    return json.map((cuote: Quote) => {
      const { id, name, price, description, duration } = cuote;

      return {
        id,
        name,
        price,
        description,
        duration,
      };
    });
  },

  async create(quote: Quote[]): Promise<Quote[]> {
    const API = `${BASE_API_URL}/cuotes/create.php`;

    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quotes: quote,
      }),
    });

    if (!response.ok) {
      throw new Error("Error creando una cuota societaria");
    }

    const json = await response.json();
    if (CONSOLE_LOG) {
      console.log('cuotes: ', quote);
      console.log(json);
    }
    return json.quotes;
  },

  async update(quote: Quote): Promise<Quote> {
    const API = `${BASE_API_URL}/cuotes/update.php`;

    const response = await fetch(API, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: quote.id,
        name: quote.name,
        description: quote.description,
        price: quote.price,
        duration: quote.duration,
      }),
    });

    if (!response.ok) {
      throw new Error("Error actualizando la cuota societaria");
    }

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.message || "Error actualizando la cuota");
    }

    if (CONSOLE_LOG) {
      console.log('Updated quote:', json.quote);
    }

    return json.quote;
  },

  async delete(id: number): Promise<void> {
    const API = `${BASE_API_URL}/cuotes/delete.php`;

    const response = await fetch(API, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error("Error eliminando la cuota societaria");
    }

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.message || "Error eliminando la cuota");
    }

    if (CONSOLE_LOG) {
      console.log('Deleted quote with id:', id);
    }
  },
};
