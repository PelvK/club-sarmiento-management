import { Quote } from "../types/quote";
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
        ...quote,
      }),
    });

    if (!response.ok) {
      throw new Error("Error creando una cuota societaria");
    }

    const json = await response.json();
    console.log(json);
    return json.quotes;
  },

  /*
  async delete(id: string): Promise<void> {
    await delay(500);
    console.log(`Deleted member with id: ${id}`);
  },

  async update(member: Member): Promise<Member> {
    await delay(500);
    return member;
  },
  */
};
