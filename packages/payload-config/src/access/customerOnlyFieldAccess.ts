import type { FieldAccess } from "payload";

import { checkRole } from "@repo/payload/access/utilities";

export const customerOnlyFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (user) return checkRole(["customer"], user);

  return false;
};
