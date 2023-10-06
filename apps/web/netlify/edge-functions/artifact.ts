import type { Context as BlobContext } from "https://deploy-preview-243--edge.netlify.app";
import type { Context } from "@netlify/edge-functions";

export default async (request: Request, context: BlobContext & Context) => {
  console.log(request.method, request.url);

  const bearerHeader = request.headers.get("authorization");
  const token = bearerHeader?.replace("Bearer ", "");
  if (!token || token !== Netlify.env.get("TURBO_TOKEN")) {
    console.log("Unauthorized");
    return new Response("Unauthorized", { status: 401 });
  }
  const { hash } = context.params;

  if(!hash) {
    return new Response("Not found", { status: 404 });
  }

  if (request.method === "PUT") {
    const blob = await request.arrayBuffer();
    await context.blobs.set(hash, blob);
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
    headers.set("Content-Length", blob.byteLength.toString());
    return new Response(blob, { headers });
  } catch (e) {
    console.log(e);
    return new Response(e.message, { status: 500 });
  }
};

export const config = {
  method: ["GET", "PUT"],
  path: "/v8/artifacts/:hash",
};
