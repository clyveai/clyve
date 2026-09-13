import * as authSchema from "./auth";
import * as legacySchema from "./legacy";
import * as thesisSchema from "./thesis";
import * as newsSchema from "./news";

export * from "./auth";
export * from "./legacy";
export * from "./thesis";
export * from "./news";

/** The complete schema passed to Drizzle and Better Auth. */
export const schema = {
  ...authSchema,
  ...legacySchema,
  ...thesisSchema,
  ...newsSchema,
};
