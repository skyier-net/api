import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "../src/main";

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:8000/trpc",
      headers: () => {
        return {
          authorization: "Baerer",
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
  // const result = await client.groups.kickMember.mutate({
  //   userId: "user_2TnxskwMm7b7Q5vtdqos8g5KGN9",
  // });
  const result = await client.groups.showMails.mutate({
    mailOrName: "gmai",
  });
  console.log(result);
}

main();
