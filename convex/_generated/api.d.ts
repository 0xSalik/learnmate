/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_aiReports from "../actions/aiReports.js";
import type * as actions_apifyTrigger from "../actions/apifyTrigger.js";
import type * as actions_demandSignalAggregator from "../actions/demandSignalAggregator.js";
import type * as actions_exaRefresh from "../actions/exaRefresh.js";
import type * as actions_matching from "../actions/matching.js";
import type * as chat from "../chat.js";
import type * as children from "../children.js";
import type * as crashCourses from "../crashCourses.js";
import type * as demandSignals from "../demandSignals.js";
import type * as enrollments from "../enrollments.js";
import type * as groupSessions from "../groupSessions.js";
import type * as learningDNA from "../learningDNA.js";
import type * as matching from "../matching.js";
import type * as notifications from "../notifications.js";
import type * as opportunities from "../opportunities.js";
import type * as pricingBenchmarks from "../pricingBenchmarks.js";
import type * as projects from "../projects.js";
import type * as proposals from "../proposals.js";
import type * as sessions from "../sessions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/aiReports": typeof actions_aiReports;
  "actions/apifyTrigger": typeof actions_apifyTrigger;
  "actions/demandSignalAggregator": typeof actions_demandSignalAggregator;
  "actions/exaRefresh": typeof actions_exaRefresh;
  "actions/matching": typeof actions_matching;
  chat: typeof chat;
  children: typeof children;
  crashCourses: typeof crashCourses;
  demandSignals: typeof demandSignals;
  enrollments: typeof enrollments;
  groupSessions: typeof groupSessions;
  learningDNA: typeof learningDNA;
  matching: typeof matching;
  notifications: typeof notifications;
  opportunities: typeof opportunities;
  pricingBenchmarks: typeof pricingBenchmarks;
  projects: typeof projects;
  proposals: typeof proposals;
  sessions: typeof sessions;
  users: typeof users;
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
