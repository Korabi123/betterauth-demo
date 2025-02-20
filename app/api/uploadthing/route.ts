import { createRouteHandler } from "uploadthing/next";

import { uploadthingFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: uploadthingFileRouter,
});
