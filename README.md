# Turbofan

## Self-hosted remote cache for Turborepo

Speed up your build by deploying your own remote cache for [Turborepo](https://turbo.build).

## Usage

You have two options for deploying Turbofan:

### Shared instance

Deploy a standalone instance of Turbofan that can be used by multiple Turborepo projects

Click the button below to deploy Turbofan to Netlify:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ascorbic/turbofan&base=apps/standalone)

Enter a shared secret that will be used to authenticate with Turbofan. You will need to provide this secret to your Turborepo projects.

### Per-project instance

You can add a Turbofan instance to your Turborepo project by adding a Netlify Edge Function to your project. There is no need to install anything as it can be imported directly from deno.land.

```typescript
// .netlify/edge-functions/turbofan.ts

export { handleRequest as default } from "https://deno.land/x/turbofan/mod.ts";

export const config {
    path: "/api/turbofan",
    cache: "manual",
}

```

## Setting up your Turborepo project

Once you have deployed Turbofan, you will need to configure your Turborepo project to use it. You can do this by creating the following file in your project and committing it to your repository:

`.turbo/config.json`

```json
{
  "teamid": "team_anythingyouwant",
  "apiurl": "https://<your cache url goes here>.netlify.app"
}
```

The teamid can be anything you want, as long as it starts with `team_`. This will segment your project in the cache.

The API url should be the URL of your Turbofan instance. This will either be the URL of the standalone cache, or the URL of your Netlify site if you are using a per-project instance.

You then need to provide the shared secret as en env var to the builds:

```env
TURBO_TOKEN=your-secret-here
```

## Troublehooting

You can check that it is working by looking for "Remote caching enabled" in the logs. Be aware that the first build for a per-site instance will not use the cache, as the Edge Function needs to be deployed before it can be used.

You can check the logs for the Edge Function to see if the artifacts are being cached and returned correctly.

If you don't see "Remote caching enabled", check that you have set the `TURBO_TOKEN` env var correctly and have created the `.turbo/config.json` file.

## License

Copyright 2023 Matt Kane. Available under the terms of the MIT license.
