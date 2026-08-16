import * as authSchema from "./auth";
import * as legacySchema from "./legacy";
import * as thesisSchema from "./thesis";

export * from "./auth";
export * from "./legacy";
export * from "./thesis";

/** The complete schema passed to Drizzle and Better Auth. */
export const schema = {
  ...authSchema,
  ...legacySchema,
  ...thesisSchema,
};
