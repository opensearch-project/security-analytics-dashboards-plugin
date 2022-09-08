import { DefaultHeaders, SecurityAnalyticsApi } from "../models/interfaces";

export const API: SecurityAnalyticsApi = {};

export enum CLUSTER {
  ADMIN = "admin",
  SA = "opensearch_security_analytics",
  DATA = "data",
}

export const DEFAULT_HEADERS: DefaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
