declare module "*.css";

declare global {
  // eslint-disable-next-line no-var
  var prisma: import("@prisma/client").PrismaClient & {
    config: any;
  };

  namespace NodeJS {
    interface ProcessEnv {
      SHOPIFY_API_KEY: string;
      SHOPIFY_API_SECRET: string;
      SCOPES: string;
      SHOPIFY_APP_URL: string;
      DATABASE_URL: string;
      ADMIN_PASSWORD?: string;
      LOG_LEVEL?: "DEBUG" | "INFO" | "WARN" | "ERROR";
    }
  }

  namespace JSX {
    interface IntrinsicElements {
      "s-app-nav": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      "s-link": React.DetailedHTMLProps<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      >;
    }
  }
}

export {};
