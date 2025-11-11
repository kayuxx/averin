import { ecommercePlugin } from "@payloadcms/plugin-ecommerce";
import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";
import { seoPlugin } from "@payloadcms/plugin-seo";
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { adminOnlyFieldAccess } from "@repo/payload/access/adminOnlyFieldAccess";
import { adminOrCustomerOwner } from "@repo/payload/access/adminOrCustomerOwner";
import { adminOrPublishedStatus } from "@repo/payload/access/adminOrPublishedStatus";
import { customerOnlyFieldAccess } from "@repo/payload/access/customerOnlyFieldAccess";
import { adminOnly } from "@repo/payload/access/adminOnly";
import { stripeAdapter } from "@payloadcms/plugin-ecommerce/payments/stripe";
import { ProductsCollection } from "@repo/payload/collections/Products";
import { GenerateTitle, GenerateURL } from "@payloadcms/plugin-seo/types";
import { getServerSideURL } from "@repo/payload/utilities/getURL";
import { Product } from "@payload-types";
import { USD } from "@payloadcms/plugin-ecommerce";

const generateTitle: GenerateTitle<Product> = ({ doc }) => {
  return doc?.title
    ? `${doc.title} | Payload Ecommerce Template`
    : "Payload Ecommerce Template";
};

const generateURL: GenerateURL<Product> = ({ doc }) => {
  const url = getServerSideURL();

  return doc?.slug ? `${url}/${doc.slug}` : url;
};

export const plugins = [
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
    currencies: {
      defaultCurrency: "USD",
      supportedCurrencies: [
        USD,
        {
          code: "DZD",
          decimals: 2,
          label: "Algerian Dinar",
          symbol: "د.ج",
        },
      ],
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
];
