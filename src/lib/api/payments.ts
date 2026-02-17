import { GenerationConfig } from "../types";
import { Payment, PaymentGeneration } from "../types/payment";
import { CONSOLE_LOG } from "../utils/consts";
import { BASE_API_URL } from "../utils/strings";

export const paymentsApi = {
  async getAll(): Promise<Payment[]> {
    const API = `${BASE_API_URL}/payments/get_all.php`;
    const response = await fetch(API);
    if (!response.ok) throw new Error("Failed to fetch payments");
    const data = await response.json();
    return data.payments || [];
  },

  async getByGenerationId({
    generationId,
  }: {
    generationId: string;
  }): Promise<Payment[]> {
    const API = `${BASE_API_URL}/payments/get_by_generation.php?generationId=${generationId}`;
    const response = await fetch(API);
    if (!response.ok) throw new Error("Failed to fetch payments");
    const data = await response.json();
    return data.payments || [];
  },

  async getByMember(memberId: number): Promise<Payment[]> {
    const API = `${BASE_API_URL}/payments/get_by_member.php?memberId=${memberId}`;
    const response = await fetch(API);
    if (!response.ok) throw new Error("Failed to fetch payments");
    const data = await response.json();
    return data.payments || [];
  },

  async getBySport(sportId: number): Promise<Payment[]> {
    const API = `${BASE_API_URL}/payments/get_by_sport.php?sportId=${sportId}`;
    const response = await fetch(API);
    if (!response.ok) throw new Error("Failed to fetch payments");
    const data = await response.json();
    return data.payments || [];
  },

  async markAsPaid(
    id: number,
    amount?: number,
    notes?: string,
  ): Promise<Payment> {
    const API = `${BASE_API_URL}/payments/mark_as_paid.php`;
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, amount, notes }),
    });

    if (!response.ok) throw new Error("Failed to mark payment as paid");
    const data = await response.json();
    return data.payment;
  },

  async addPartialPayment(
    paymentId: number,
    amount: number,
    notes?: string,
  ): Promise<Payment> {
    const API = `${BASE_API_URL}/payments/add_partial_payment.php`;
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId, amount, notes }),
    });

    if (!response.ok) throw new Error("Failed to add partial payment");
    const data = await response.json();
    return data.payment;
  },

  async generatePayments(config: GenerationConfig): Promise<PaymentGeneration> {
    if (CONSOLE_LOG) {
      console.log(config);
    }
    const API = `${BASE_API_URL}/payments/generate.php`;
    if (CONSOLE_LOG) {
      console.log("[API] - Generating payments with config: ", config); // Debug log
    }
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate payments");
    }

    const data = await response.json();
    return data.generation;
  },

  async getGenerations(): Promise<PaymentGeneration[]> {
    const API = `${BASE_API_URL}/payments/get_generations.php`;
    const response = await fetch(API);
    if (!response.ok) throw new Error("Failed to fetch generations");
    const data = await response.json();
    return data.generations || [];
  },

  async revertGeneration(generationId: string): Promise<void> {
    const API = `${BASE_API_URL}/payments/revert_generation.php`;
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generationId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to revert generation");
    }
  },

  async updatePayment(payment: Payment): Promise<Payment> {
    const API = `${BASE_API_URL}/payments/update.php`;
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });

    if (!response.ok) throw new Error("Failed to update payment");
    const data = await response.json();
    return data.payment;
  },

  async deletePayment(id: string): Promise<void> {
    const API = `${BASE_API_URL}/payments/delete.php`;
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) throw new Error("Failed to delete payment");
  },

  async cancelPayment(id: number): Promise<Payment> {
    const API = `${BASE_API_URL}/payments/cancel.php`;
    const response = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) throw new Error("Failed to cancel payment");
    const data = await response.json();
    return data.payment;
  },
};
