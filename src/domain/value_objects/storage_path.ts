interface StoragePathProps {
  bucket: string;
  objectKey: string;
}

export class StoragePath {
  public readonly bucket: string;
  public readonly objectKey: string;

  private constructor(props: StoragePathProps) {
    this.bucket = props.bucket;
    this.objectKey = props.objectKey;
  }

  public static create(bucket: string, objectKey: string): StoragePath {
    if (!bucket || bucket.trim().length === 0) {
      throw new Error("Bucket name cannot be empty");
    }
    if (!objectKey || objectKey.trim().length === 0) {
      throw new Error("Object key cannot be empty");
    }
    return new StoragePath({ bucket, objectKey });
  }

  public static fromPersistence(props: StoragePathProps): StoragePath {
    return new StoragePath(props);
  }

  public get fullPath(): string {
    return `${this.bucket}/${this.objectKey}`;
  }

  public equals(other: StoragePath): boolean {
    return this.bucket === other.bucket && this.objectKey === other.objectKey;
  }
}
