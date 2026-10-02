import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createS3Storage } from "../s3";

const send = vi.fn();
const storage = createS3Storage({
  client: { send } as unknown as Pick<S3Client, "send">,
  bucket: "wiki-media",
  prefix: "media/",
});

const httpError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), {
    $metadata: { httpStatusCode: status },
  });

describe("S3 storage", () => {
  beforeEach(() => {
    send.mockReset();
  });

  it("writes conditionally, so existing objects are never replaced", async () => {
    send.mockResolvedValue({});
    await storage.create("Logo.png", new Uint8Array([1, 2]), "image/png");

    const command = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toMatchObject({
      Bucket: "wiki-media",
      Key: "media/Logo.png",
      ContentType: "image/png",
      IfNoneMatch: "*",
    });
  });

  it("reports a taken key as a conflict", async () => {
    send.mockRejectedValue(httpError(412));
    await expect(
      storage.create("Logo.png", new Uint8Array([1]), "image/png"),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("reads objects and treats missing ones as null", async () => {
    send.mockResolvedValueOnce({
      Body: { transformToByteArray: async () => new Uint8Array([7]) },
    });
    expect(await storage.read("Logo.png")).toEqual(new Uint8Array([7]));
    expect(send.mock.calls[0][0]).toBeInstanceOf(GetObjectCommand);

    send.mockRejectedValueOnce(httpError(404));
    expect(await storage.read("Missing.png")).toBeNull();
  });

  it("deletes objects", async () => {
    send.mockResolvedValue({});
    await storage.remove("Logo.png");
    expect(send.mock.calls[0][0]).toBeInstanceOf(DeleteObjectCommand);
    expect(send.mock.calls[0][0].input.Key).toBe("media/Logo.png");
  });

  it("refuses keys that aren't plain file names without calling S3", async () => {
    for (const key of ["../other-bucket-key", "a/b.png", ".hidden"]) {
      expect(await storage.read(key)).toBeNull();
      await expect(
        storage.create(key, new Uint8Array([1]), "image/png"),
      ).rejects.toMatchObject({ status: 400 });
    }
    expect(send).not.toHaveBeenCalled();
  });
});
