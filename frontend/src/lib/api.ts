export type Session = { token: string; email: string; role: string };
export type Account = {
  id: number;
  accountNumber: string;
  accountType: "SAVINGS" | "CURRENT";
  balance: number;
  status: string;
  createdAt: string;
};
export type Transaction = {
  id: number;
  type: string;
  status: string;
  amount: number;
  sourceAccountId: number | null;
  destinationAccountId: number | null;
  description: string | null;
  createdAt: string;
};
export type Beneficiary = {
  id: number;
  nickname: string;
  recipientName: string;
  accountNumber: string;
  maskedAccountNumber: string;
  accountType: string;
  status: string;
  createdAt: string;
};
export type BeneficiaryLookup = {
  accountNumber: string;
  holderName: string;
  accountType: string;
};
export type FraudFlag = { id: number; transactionId: number; reason: string; resolved: boolean; createdAt: string };
export type AuditLog = { id: number; actorEmail: string; action: string; resource: string; details: string; createdAt: string };

export async function api<T>(path: string, session?: Session | null, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers,
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || "Something went wrong");
  return data as T;
}

export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

export const shortAccount = (value: string) => `**** ${value.slice(-4)}`;
