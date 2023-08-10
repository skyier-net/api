import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "../src/main";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:8000/trpc",
      headers: () => {
        return {
          authorization:
            "Baerer eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yVFJnaW5MYkNIUk5WNFY2ZWFCeFY3Nk1SNmciLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjgxMDAiLCJleHAiOjE2OTE2OTMwMTMsImlhdCI6MTY5MTY5Mjk1MywiaXNzIjoiaHR0cHM6Ly9tb3ZpbmctYnVnLTI1LmNsZXJrLmFjY291bnRzLmRldiIsIm5iZiI6MTY5MTY5Mjk0Mywic2lkIjoic2Vzc18yVG54c2xuN1ZhTVg0YmNPdXRGMlVpRTJROTUiLCJzdWIiOiJ1c2VyXzJUbnhza3dNbTdiN1E1dnRkcW9zOGc1S0dOOSJ9.VahEnF9jPkXvVLSIAtoyEWw2FBmRlRSCbe3JQ8SPcnY1KRZib6TZgvMHQVPCJn6HkI36m-zt5r75wUxf-1uNUusLu_D2718noJ9wxlcdcOXD7SGsuELWmgMT3SljtEFSXq3MTGKEZp5XJdWmNZk-4i7HdTTlGgSvsbqObqXm3-InfgVTfxbpivoLBCnHCUqjEf_nhatiLsWsGLrohgfgJH0plCJxld6_S0pVhU-7eCM7SooDs1g1eFC7Jn6hgobgQqMqv_MKWA_q3qNL1gfbWgxc9dEq-4D3lNlo4evmZRy2-tSrAueo4rbwo9z7FqOrj8KrxGH8dnXWBD9e2psulQ 8b656f35-0828-48e0-b562-840ad6047efd",
        };
      },
    }),
  ],
});

async function main() {
  // const result = await client.groups.editGroup.mutate({
  //   title: "Колоездене la negraga",
  //   defaultRole: null,
  //   description:
  //     "every nigga has to be black my man cuz you have to be black again",
  //   groupVisibility: "PUBLIC",
  // });
  // const result = await client.groups.inviteMember.mutate({
  //   role: "ADMIN",
  //   mail: "nikolaandreev1@icloud.com",
  // });
  const result = await client.groups.joinGroup.mutate({
    key: "365795",
  });
  console.log(result);
}

main();
