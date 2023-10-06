import type { Context as BlobContext } from "https://deploy-preview-243--edge.netlify.app";
import type { Config, Context } from "https://edge.netlify.com/v1/index.ts";

export const config: Config = {
  method: ["GET", "PUT"],
  path: "/v1/artifact/:id",
};

export default async (request: Request, context: BlobContext & Context) => {
  if(!config.method?.includes(request.method as any)) {
    return new Response("Method not allowed", { status: 405 });
  }
  const bearerHeader = request.headers.get("authorization");
  const token = bearerHeader?.replace("Bearer ", "");
  if (!token || token !== Netlify.env.get("TURBO_TOKEN")) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { id } = context.params;

  console.log(context.blobs, token);
  return new Response(`Artifact ${id}`);
};

