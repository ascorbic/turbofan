import type { Context as BlobContext } from "https://deploy-preview-243--edge.netlify.app";
import type { Config, Context } from "https://edge.netlify.com/v1/index.ts";

export const config: Config = {
  method: ["GET", "PUT", "HEAD"],
  path: "/v8/artifacts/:hash",
};

export default async (request: Request, context: BlobContext & Context) => {
  console.log(request.url);
  console.log(request.headers, request.method);

  const bearerHeader = request.headers.get("authorization");
  const token = bearerHeader?.replace("Bearer ", "");
  if (!token || token !== Netlify.env.get("TURBO_TOKEN")) {
    console.log("Unauthorized");
    return new Response("Unauthorized", { status: 401 });
  }
  const { hash } = context.params;

  if (request.method === "PUT") {
    const blob = await request.arrayBuffer();
    await context.blobs.put(hash, blob);
    return new Response("OK");
  }
  try {
    const blob = await context.blobs.get(hash, {
      type: "arrayBuffer",
    });
    if (!blob) {
      return new Response(`Artifact ${hash} not found`, { status: 404 });
    }
    const headers = new Headers();
    headers.set("Content-Type", "application/octet-stream");
    headers.set("Content-Length", blob.length.toString());
    return new Response(blob, { headers });
  } catch (e) {
    console.log(e);
    return new Response(e.message, { status: 500 });
  }
};
