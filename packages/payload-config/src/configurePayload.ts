// storage-adapter-import-placeholder
import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";
import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { ecommercePlugin } from "@payloadcms/plugin-ecommerce";
import path from "path";
import { buildConfig, Config } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { adminOnly } from "./access/adminOnly";
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { adminOnlyFieldAccess } from "./access/adminOnlyFieldAccess";
import { adminOrCustomerOwner } from "./access/adminOrCustomerOwner";
import { adminOrPublishedStatus } from "./access/adminOrPublishedStatus";
import { customerOnlyFieldAccess } from "./access/customerOnlyFieldAccess";
import { stripeAdapter } from "@payloadcms/plugin-ecommerce/payments/stripe";
import { ProductsCollection } from "./collections/Products";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { GenerateTitle, GenerateURL } from "@payloadcms/plugin-seo/types";
import { getServerSideURL } from "./utilities/getURL";
import { Categories } from "./collections/Categories";
import { Product } from "./payload-types";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const generateTitle: GenerateTitle<Product> = ({ doc }) => {
  return doc?.title
    ? `${doc.title} | Payload Ecommerce Template`
    : "Payload Ecommerce Template";
};

const generateURL: GenerateURL<Product> = ({ doc }) => {
  const url = getServerSideURL();

  return doc?.slug ? `${url}/${doc.slug}` : url;
};

const baseConfig: Config = {
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, "src"),
      importMapFile: path.resolve(
        dirname,
        "src",
        "app",
        "(payload)",
        "importMap.js",
      ),
    },
    avatar: "gravatar",
  },
  routes: {
    admin: "/",
  },
  collections: [Users, Media, Categories],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  sharp,
  plugins: [
    // payloadCloudPlugin(),
    formBuilderPlugin({
      fields: {
        payment: false,
      },
      formSubmissionOverrides: {
        admin: {
          group: "Content",
        },
      },
      formOverrides: {
        admin: {
          group: "Content",
        },
        fields: ({ defaultFields }) => {
          return defaultFields.map((field) => {
            if ("name" in field && field.name === "confirmationMessage") {
              return {
                ...field,
                editor: lexicalEditor({
                  features: ({ rootFeatures }) => {
                    return [
                      ...rootFeatures,
                      FixedToolbarFeature(),
                      HeadingFeature({
                        enabledHeadingSizes: ["h1", "h2", "h3", "h4"],
                      }),
                    ];
                  },
                }),
              };
            }
            return field;
          });
        },
      },
    }),
    seoPlugin({
      generateTitle,
      generateURL,
    }),
    ecommercePlugin({
      access: {
        adminOnly,
        adminOnlyFieldAccess,
        adminOrCustomerOwner,
        adminOrPublishedStatus,
        customerOnlyFieldAccess,
      },
      customers: {
        slug: "users",
      },
      payments: {
        paymentMethods: [
          stripeAdapter({
            secretKey: process.env.STRIPE_SECRET_KEY!,
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
            webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET!,
          }),
        ],
      },
      products: {
        productsCollectionOverride: ProductsCollection,
      },
    }),

    // storage-adapter-placeholder
  ],
};

export function configurePayload() {
  return buildConfig(baseConfig);
}
