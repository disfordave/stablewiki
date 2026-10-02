/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { isSafeMediaTitle } from "@/utils/api/media";
import { ServiceError } from "../errors";
import type { StorageDriver } from "./types";

function httpStatusOf(error: unknown): number | undefined {
  return (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
    ?.httpStatusCode;
}

// Any S3-compatible bucket: AWS S3, Cloudflare R2, MinIO...
export function createS3Storage({
  client,
  bucket,
  prefix = "media/",
}: {
  client: Pick<S3Client, "send">;
  bucket: string;
  prefix?: string;
}): StorageDriver {
  const objectKey = (key: string) =>
    isSafeMediaTitle(key) ? prefix + key : null;

  return {
    async create(key, body, contentType) {
      const Key = objectKey(key);
      if (!Key) {
        throw new ServiceError(400, "Invalid media title");
      }
      try {
        // If-None-Match makes the write fail instead of replacing an object
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key,
            Body: body,
            ContentType: contentType,
            IfNoneMatch: "*",
          }),
        );
      } catch (error) {
        if (httpStatusOf(error) === 412) {
          throw new ServiceError(
            409,
            "A media file with this title already exists",
          );
        }
        throw error;
      }
    },

    async read(key) {
      const Key = objectKey(key);
      if (!Key) {
        return null;
      }
      try {
        const { Body } = await client.send(
          new GetObjectCommand({ Bucket: bucket, Key }),
        );
        return Body ? await Body.transformToByteArray() : null;
      } catch (error) {
        if (httpStatusOf(error) === 404) {
          return null;
        }
        throw error;
      }
    },

    async remove(key) {
      const Key = objectKey(key);
      if (Key) {
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key }));
      }
    },
  };
}

export function createS3StorageFromEnv(): StorageDriver {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new Error("STORAGE_DRIVER=s3 requires S3_BUCKET to be set");
  }

  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  return createS3Storage({
    bucket,
    prefix: process.env.S3_KEY_PREFIX ?? "media/",
    client: new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      // Without explicit keys the SDK's default credential chain is used
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
    }),
  });
}
