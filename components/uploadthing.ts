import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { UploadthingFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<UploadthingFileRouter>();
export const UploadDropzone = generateUploadDropzone<UploadthingFileRouter>();
