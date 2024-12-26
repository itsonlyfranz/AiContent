declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (request: Request) => Promise<Response>): void;
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
}; 