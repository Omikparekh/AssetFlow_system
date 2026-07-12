"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../utils/logger"));
class StorageService {
    supabase = null;
    useSupabase = false;
    localStorageDir = path_1.default.join(process.cwd(), "uploads");
    constructor() {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_KEY;
        if (url && key) {
            this.supabase = (0, supabase_js_1.createClient)(url, key);
            this.useSupabase = true;
            logger_1.default.info("Supabase Storage client initialized.");
        }
        else {
            logger_1.default.info(`Supabase storage credentials missing. Falling back to local file storage in: ${this.localStorageDir}`);
            if (!fs_1.default.existsSync(this.localStorageDir)) {
                fs_1.default.mkdirSync(this.localStorageDir, { recursive: true });
            }
        }
    }
    async uploadFile(bucketName, fileName, fileBuffer, mimeType) {
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
                if (error)
                    throw error;
                const { data: publicUrlData } = this.supabase.storage
                    .from(bucketName)
                    .getPublicUrl(uniqueFileName);
                return publicUrlData.publicUrl;
            }
            catch (err) {
                logger_1.default.error(err, `Supabase upload failed for ${uniqueFileName}. Falling back to local storage.`);
            }
        }
        // Local storage fallback
        const targetPath = path_1.default.join(this.localStorageDir, uniqueFileName);
        fs_1.default.writeFileSync(targetPath, fileBuffer);
        // Return relative url or file protocol path
        return `/uploads/${uniqueFileName}`;
    }
    async deleteFile(bucketName, fileUrl) {
        if (this.useSupabase && this.supabase) {
            try {
                // Extract fileName from URL
                const parts = fileUrl.split("/");
                const fileName = parts[parts.length - 1];
                const { error } = await this.supabase.storage
                    .from(bucketName)
                    .remove([fileName]);
                if (error)
                    throw error;
                return;
            }
            catch (err) {
                logger_1.default.error(err, `Supabase delete failed for url: ${fileUrl}`);
            }
        }
        // Local storage fallback deletion
        try {
            const parts = fileUrl.split("/");
            const fileName = parts[parts.length - 1];
            const targetPath = path_1.default.join(this.localStorageDir, fileName);
            if (fs_1.default.existsSync(targetPath)) {
                fs_1.default.unlinkSync(targetPath);
            }
        }
        catch (err) {
            logger_1.default.error(err, `Local file delete failed for url: ${fileUrl}`);
        }
    }
}
exports.storage = new StorageService();
