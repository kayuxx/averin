import type { Access } from "payload";

import { checkRole } from "@repo/payload/access/utilities";

export const adminOrPublishedStatus: Access = ({ req: { user } }) => {
  if (user && checkRole(["admin"], user)) {
    return true;
  }

  return {
    _status: {
      equals: "published",
    },
  };
};
