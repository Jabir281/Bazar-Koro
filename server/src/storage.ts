import { nanoid } from 'nanoid'
import type { Order, UserPublic, UserRole } from '@bazar-koro/shared'

export interface UserRecord extends UserPublic {
  passwordHash: string
}

const usersById = new Map<string, UserRecord>()
const usersByEmail = new Map<string, UserRecord>()
const ordersById = new Map<string, Order>()

export function createUser(input: {
  name: string
  email: string
  roles: UserRole[]
  passwordHash: string
}): UserRecord {
  const id = nanoid()
  const user: UserRecord = {
    id,
    name: input.name,
    email: input.email.toLowerCase(),
    roles: input.roles,
    passwordHash: input.passwordHash,
  }
  usersById.set(id, user)
  usersByEmail.set(user.email, user)
  return user
}

export function getUserByEmail(email: string): UserRecord | undefined {
  return usersByEmail.get(email.toLowerCase())
}

export function getUserById(id: string): UserRecord | undefined {
  return usersById.get(id)
}

export function createOrder(input: {
  buyerId: string
  lines: Order['lines']
  storeIds: string[]
}): Order {
  const now = new Date().toISOString()
  const id = nanoid()
  const order: Order = {
    id,
    buyerId: input.buyerId,
    lines: input.lines,
    storeIds: input.storeIds,
    status: 'placed',
    createdAt: now,
    updatedAt: now,
  }
  ordersById.set(id, order)
  return order
}

export function getOrderById(id: string): Order | undefined {
  return ordersById.get(id)
}

export function updateOrder(order: Order): Order {
  ordersById.set(order.id, { ...order, updatedAt: new Date().toISOString() })
  return ordersById.get(order.id)!
}

export function listOrdersForBuyer(buyerId: string): Order[] {
  return [...ordersById.values()].filter((o) => o.buyerId === buyerId)
}
