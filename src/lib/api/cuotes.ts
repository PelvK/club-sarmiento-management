import { Quote } from "../types/quote";
import { BASE_API_URL } from "../utils/strings";

//const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const cuotesApi = {
  async getSocietaryCuotes(): Promise<Quote[]> {
    const API = `${BASE_API_URL}/cuotes/get_societary_cuotes.php`;
    const rawData = await fetch(API);
    const json = await rawData.json();

    return json.map((cuote: Quote) => {
      const {
        id,
        name,
        price,
        description,
      } = cuote;

      return {
        id,
        name,
        price,
        description
      };
    });
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
}
