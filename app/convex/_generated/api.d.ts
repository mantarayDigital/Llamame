/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as apiKeys from "../apiKeys.js";
import type * as auditLog from "../auditLog.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as clients from "../clients.js";
import type * as dashboard from "../dashboard.js";
import type * as eventTypes from "../eventTypes.js";
import type * as http from "../http.js";
import type * as integrations from "../integrations.js";
import type * as seed from "../seed.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";
import type * as webhookEndpoints from "../webhookEndpoints.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  apiKeys: typeof apiKeys;
  auditLog: typeof auditLog;
  auth: typeof auth;
  bookings: typeof bookings;
  clients: typeof clients;
  dashboard: typeof dashboard;
  eventTypes: typeof eventTypes;
  http: typeof http;
  integrations: typeof integrations;
  seed: typeof seed;
  subscriptions: typeof subscriptions;
  users: typeof users;
  webhookEndpoints: typeof webhookEndpoints;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
