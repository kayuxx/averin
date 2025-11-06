import type { CollectionConfig } from "payload";

import { adminOnly } from "@repo/payload/access/adminOnly";
import { adminOnlyFieldAccess } from "@repo/payload/access/adminOnlyFieldAccess";
import { publicAccess } from "@repo/payload/access/publicAccess";
import { adminOrSelf } from "@repo/payload/access/adminOrSelf";
import { checkRole } from "@repo/payload/access/utilities";

import { ensureFirstUserIsAdmin } from "./hooks/ensureFirstUserIsAdmin";

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    admin: ({ req: { user } }) => checkRole(["admin"], user),
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    group: "Users",
    defaultColumns: ["name", "email", "roles"],
    useAsTitle: "name",
  },
  auth: {
    tokenExpiration: 1209600,
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "roles",
      type: "select",
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      defaultValue: ["customer"],
      hasMany: true,
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      options: [
        {
          label: "admin",
          value: "admin",
        },
        {
          label: "customer",
          value: "customer",
        },
      ],
    },
    {
      name: "orders",
      type: "join",
      collection: "orders",
      on: "customer",
      admin: {
        allowCreate: false,
        defaultColumns: ["id", "createdAt", "total", "currency", "items"],
      },
    },
    {
      name: "cart",
      type: "join",
      collection: "carts",
      on: "customer",
      admin: {
        allowCreate: false,
        defaultColumns: ["id", "createdAt", "total", "currency", "items"],
      },
    },
    {
      name: "addresses",
      type: "join",
      collection: "addresses",
      on: "customer",
      admin: {
        allowCreate: false,
        defaultColumns: ["id"],
      },
    },
  ],
};
