import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "../src/main";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:8000/trpc",
      headers: () => {
        return {
          authorization:
            "Baerer eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yVFJnaW5MYkNIUk5WNFY2ZWFCeFY3Nk1SNmciLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwOi8vbG9jYWxob3N0OjgxMDAiLCJleHAiOjE2OTE3NDUzNDMsImlhdCI6MTY5MTc0NTI4MywiaXNzIjoiaHR0cHM6Ly9tb3ZpbmctYnVnLTI1LmNsZXJrLmFjY291bnRzLmRldiIsIm5iZiI6MTY5MTc0NTI3Mywic2lkIjoic2Vzc18yVG5RaVFPblJWU3EwUFgxdUpMRDNBWGJ1WjEiLCJzdWIiOiJ1c2VyXzJUbXBtV3hRaGJnNVpBbllSZFhDVVQ1bHJFZCJ9.B0g9hs-8pU9Lsy3Av4Y2dcmOCuc2nUo75Z4DZKd5JfTy4jv2qBzhYxgVI6xPeb5tBuuoHOpBi16fA4wWvjmfcj7GWzvIh86UMozo0lIvf-ttWs2--NBG1rmEtVmrYcq8GdHDEYSPsrleZ2RQ_qiqN7WBjGlmbD7tlASzR3yNV6DnydH7ObVHre9LKYrCkIvWoUDiZ9JhE2aT1Fpx6Cva9eHBXY3PHqjTl3FXelyZ7USWFZvMUeHCN_GmZHXSwdcFoEdd1mk62XXJqM5p0-HTKqMkHgWRzyGlrCqXaZsEgTqaRL2n3WaqGWSoHnblOmEHnQugdlpqopG5J_UVwcgaDw 8b656f35-0828-48e0-b562-840ad6047efd",
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
  // const result = await client.groups.joinGroup.mutate({
  //   key: "365795",
  // });
  // const result = await client.groups.muteMember.mutate({
  //   userId: "user_2TnxskwMm7b7Q5vtdqos8g5KGN9",
  //   hoursForMute: 3,
  // });
  const result = await client.groups.kickMember.mutate({
    userId: "user_2TnxskwMm7b7Q5vtdqos8g5KGN9",
  });
  console.log(result);
}

main();
