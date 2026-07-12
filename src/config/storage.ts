import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import logger from "../utils/logger";

class StorageService {
  private supabase: any = null;
  private useSupabase = false;
  private localStorageDir = path.join(process.cwd(), "uploads");

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (url && key) {
      this.supabase = createClient(url, key);
      this.useSupabase = true;
      logger.info("Supabase Storage client initialized.");
    } else {
      logger.info(`Supabase storage credentials missing. Falling back to local file storage in: ${this.localStorageDir}`);
      if (!fs.existsSync(this.localStorageDir)) {
        fs.mkdirSync(this.localStorageDir, { recursive: true });
      }
    }
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<string> {
    const uniqueFileName = `${Date.now()}_${fileName.replace(/\s+/g, "_")}`;

    if (this.useSupabase && this.supabase) {
      try {
        const { data, error } = await this.supabase.storage
          .from(bucketName)
          .upload(uniqueFileName, fileBuffer, {
            contentType: mimeType,
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;

        const { data: publicUrlData } = this.supabase.storage
          .from(bucketName)
          .getPublicUrl(uniqueFileName);

        return publicUrlData.publicUrl;
      } catch (err) {
        logger.error(err, `Supabase upload failed for ${uniqueFileName}. Falling back to local storage.`);
      }
    }

    // Local storage fallback
    const targetPath = path.join(this.localStorageDir, uniqueFileName);
    fs.writeFileSync(targetPath, fileBuffer);
    
    // Return relative url or file protocol path
    return `/uploads/${uniqueFileName}`;
  }

  async deleteFile(bucketName: string, fileUrl: string): Promise<void> {
    if (this.useSupabase && this.supabase) {
      try {
        // Extract fileName from URL
        const parts = fileUrl.split("/");
        const fileName = parts[parts.length - 1];
        
        const { error } = await this.supabase.storage
          .from(bucketName)
          .remove([fileName]);

        if (error) throw error;
        return;
      } catch (err) {
        logger.error(err, `Supabase delete failed for url: ${fileUrl}`);
      }
    }

    // Local storage fallback deletion
    try {
      const parts = fileUrl.split("/");
      const fileName = parts[parts.length - 1];
      const targetPath = path.join(this.localStorageDir, fileName);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
    } catch (err) {
      logger.error(err, `Local file delete failed for url: ${fileUrl}`);
    }
  }
}

export const storage = new StorageService();
