import type { Config, Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
    const { id } = context.params;
    console.log(context);
    return new Response(`Artifact ${id}`)
};

export const config: Config = {
  path: ["/artifact/:id", "/test"],
};
