export type UserRole = "buyer" | "seller" | "driver" | "marketer" | "admin";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "rejected"
  | "ready_for_pickup"
  | "claimed"
  | "at_store"
  | "picked_up"
  | "on_the_way"
  | "delivered";

export type MoneyBDT = number;

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
}

export interface CartLine {
  productId: string;
  storeId: string;
  name: string;
  unitPrice: MoneyBDT;
  qty: number;
}

export interface Order {
  id: string;
  buyerId: string;
  lines: CartLine[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  storeIds: string[];
  delivery?: {
    driverId?: string;
    proof?: { pinLast4?: string; photoUrl?: string };
  };
}

export interface ApiError {
  error: string;
  details?: unknown;
}


export * from './types/search';