import type { AppRouter } from "../src/main";

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:5000",
    }),
  ],
});

async function main() {
  const result = await client.greeting.query();
  console.log(result);
}

main();
