import { getStore } from "https://esm.sh/@netlify/blobs";
import type { Context } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  console.log(request.method, request.url);

  const bearerHeader = request.headers.get("authorization");
  const token = bearerHeader?.replace("Bearer ", "");
  if (!token || token !== Netlify.env.get("TURBO_TOKEN")) {
    console.log("Unauthorized");
    return new Response("Unauthorized", { status: 401 });
  }

  const teamId = url.searchParams.get('teamId');

  let hash: string | undefined  = context.params?.hash;

  if(!hash) {
    hash = url.pathname.split('/').pop();
  }

  if(!hash || !teamId) {
    console.log("Missing params", {hash: context.params, teamId});
    return new Response("Not found", { status: 404 });
  }

  const store = getStore(`artifacts-${encodeURIComponent(teamId)}`);

  const key = encodeURIComponent(context.params.hash);

  if (request.method === "PUT") {
    const blob = await request.arrayBuffer();
    if(!blob) {
      console.log("No content");
      return new Response("No content", { status: 400 });
    }
    await store.set(key, blob);
    return new Response("OK");
  }
  try {
    const blob = await store.get(key, {
      type: "arrayBuffer",
    });
    if (!blob) {
      console.log("Artifact not found");
      return new Response(`Artifact ${hash} not found`, { status: 404 });
    }
    const headers = new Headers();
    headers.set("Content-Type", "application/octet-stream");
    headers.set("Content-Length", blob.byteLength.toString());
    headers.set("Netlify-CDN-Cache-Control", "public, s-maxage=31536000, immutable");
    headers.set("Netlify-Vary", "header=Authorization,query=teamId");
    console.log("Returning artifact", blob.byteLength.toString())
    return new Response(blob, { headers });
  } catch (e) {
    console.log(e);
    return new Response(e.message, { status: 500 });
  }
};

export const config = {
  method: ["GET", "PUT"],
  path: "/v8/artifacts/:hash",
  cache: "manual"
};
