import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  numeric,
  integer,
} from "drizzle-orm/pg-core"

// --- Better Auth tables (do not rename columns) ---

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  // Unique short code used for referral links — generated lazily on first visit
  referralCode: text("referralCode").unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// --- App tables (scoped by userId, no FK per stack guidance) ---

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  network: text("network").notNull(),
  volume: text("volume").notNull(),
  recipient: text("recipient").notNull(),
  reference: text("reference").notNull().unique(),
  customerPrice: numeric("customerPrice", { precision: 10, scale: 2 }).notNull(),
  costPrice: numeric("costPrice", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  providerOrderId: text("providerOrderId"),
  providerStatus: text("providerStatus"),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const wallets = pgTable("wallets", {
  userId: text("userId").primaryKey(),
  balance: numeric("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Tracks Paystack top-up attempts. `reference` is the Paystack transaction
// reference, used to correlate the redirect callback and the webhook, and to
// guarantee a top-up is only ever credited to the wallet once.
export const topups = pgTable("topups", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  reference: text("reference").notNull().unique(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending | success | failed
  channel: text("channel"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(),
  description: text("description"),
  orderId: integer("orderId"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
