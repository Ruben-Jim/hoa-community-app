/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as boardMembers from "../boardMembers.js";
import type * as communityPosts from "../communityPosts.js";
import type * as covenants from "../covenants.js";
import type * as emergencyNotifications from "../emergencyNotifications.js";
import type * as fees from "../fees.js";
import type * as fines from "../fines.js";
import type * as hoaInfo from "../hoaInfo.js";
import type * as residents from "../residents.js";
import type * as storage from "../storage.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  boardMembers: typeof boardMembers;
  communityPosts: typeof communityPosts;
  covenants: typeof covenants;
  emergencyNotifications: typeof emergencyNotifications;
  fees: typeof fees;
  fines: typeof fines;
  hoaInfo: typeof hoaInfo;
  residents: typeof residents;
  storage: typeof storage;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
