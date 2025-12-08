import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";
import { startBackUp } from "../utils/backup_tools/export";
import { importCollections } from "../utils/backup_tools/import";
import {
  createZipFile,
  unzip,
  removeFolder,
  removeFolderContent,
  moveFolderContent,
  getSize,
  moveFile,
  copyFolder,
} from "../utils/file";
import { sleep } from "../utils/promise";

declare global {
  var rootPath: string;
}

// Fallback if rootPath is not defined
const getRootPath = () => global.rootPath || process.cwd();

export const createBackup = async () => {
  // Create backup from database and get directory
  const temporaryBackupDirectory = await startBackUp();

  // Get upload directory
  const uploadFolder = path.join(getRootPath(), "uploads");

  const time = new Date().toISOString().split(".")[0].replace("T", "_");
  const zipName = `goranee_${time}.zip`;
  const permanentBackupDirectory = path.join("backups");
  const permanentBackupFile = path.join(permanentBackupDirectory, zipName);
  // fs.opendirSync(permanentBackupDirectory);

  let assetsPaths = [temporaryBackupDirectory, uploadFolder];
  assetsPaths = assetsPaths.map((asset) => "./" + asset.split("/server")[1]);

  await createZipFile(permanentBackupFile, assetsPaths).finally(() =>
    removeFolder(temporaryBackupDirectory)
  );
};

export const removeBackupFile = (filePath: string) => {
  let backupFile = path.join(getRootPath(), "backups", filePath);
  fs.unlink(backupFile, (err) => {});
};

export const getBackupList = async () => {
  let backupDir = path.join(getRootPath(), "backups");

  let files: string[] = [];

  try {
    files = fs.readdirSync(backupDir);
  } catch (error) {}

  let backupList: { title: string; size: number }[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const file = path.join(backupDir, files[i]);
      let size = await getSize(file);

      if (!file.endsWith(".zip")) continue;

      backupList.push({
        title: files[i],
        size,
      });
    }
  } catch (error) {
    console.log(error);
  }

  return backupList;
};

export const insertBackup = async (file: any) => {
  // Validate file object and required properties
  if (!file) {
    throw {
      message: "File object is required",
      step: "validation",
    };
  }

  if (!file.path) {
    throw {
      message:
        "File path is missing. The uploaded file may not have been processed correctly.",
      step: "validation",
    };
  }

  if (!file.originalFilename) {
    throw {
      message: "File original filename is missing",
      step: "validation",
    };
  }

  const name = file.originalFilename.split(" ").join("-");

  try {
    await moveFile(file.path, "./backups", name);
  } catch (error: any) {
    // Re-throw with proper formatting if not already formatted
    throw {
      message: error.message || "Failed to move backup file",
      step: error.step || "file_move",
      originalError: error.originalError || error,
    };
  }
};

export const restore = (filename: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    // Paths setup
    const backupDir = path.join(__dirname, "../../../backups");
    const uploadDir = path.join(__dirname, "../../../", "uploads");
    const newUploadPath = path.join(__dirname, "../../../backups/uploads");
    const newCollectionsPath = path.join(
      __dirname,
      "../../../backups/collections"
    );

    // Temporary backup directory for rollback
    const rollbackUploadPath = path.join(
      backupDir,
      ".rollback_uploads_" + Date.now()
    );

    let rollbackCreated = false;
    let uploadsRestored = false;
    let collectionsExtracted = false;

    try {
      // Step 0: Validate backup file exists
      const list = await getBackupList();
      if (!list) {
        throw {
          message: "Failed to retrieve backup list.",
          step: "validation",
        };
      }

      if (list.findIndex((item) => item.title == filename) == -1) {
        throw {
          message: `The requested backup file "${filename}" could not be found.`,
          step: "validation",
        };
      }

      // Step 1: Create rollback backup of current uploads directory
      // This allows us to restore original state if anything fails
      try {
        if (fs.existsSync(uploadDir)) {
          await copyFolder(uploadDir, rollbackUploadPath);
          rollbackCreated = true;
          console.info("Rollback backup created at:", rollbackUploadPath);
        }
      } catch (error: any) {
        throw {
          message: `Failed to create rollback backup of uploads directory: ${
            error.message || error
          }`,
          step: "rollback_backup",
          originalError: error,
        };
      }

      // Step 2: Clean up any previous extraction
      try {
        await removeFolder(newUploadPath).catch(() => {}); // Ignore if doesn't exist
        await removeFolder(newCollectionsPath).catch(() => {}); // Ignore if doesn't exist
      } catch (error: any) {
        throw {
          message: `Failed to clean up previous extraction: ${
            error.message || error
          }`,
          step: "cleanup",
          originalError: error,
        };
      }

      // Step 3: Unzip backup file
      const filePath = path.join(backupDir, filename);
      try {
        await unzip(filePath, backupDir);
        collectionsExtracted = true;
        console.info("Backup file extracted successfully");
      } catch (error: any) {
        throw {
          message: `Failed to extract backup file: ${error.message || error}`,
          step: "extraction",
          originalError: error,
        };
      }

      // Step 4: Verify extracted files exist
      if (!fs.existsSync(newCollectionsPath)) {
        throw {
          message:
            "Backup file does not contain collections directory. The backup file may be corrupted.",
          step: "validation",
        };
      }

      // Step 5: Move upload files (replace current uploads)
      try {
        await removeFolderContent(uploadDir);
        if (fs.existsSync(newUploadPath)) {
          await moveFolderContent(newUploadPath, uploadDir);
          uploadsRestored = true;
          console.info("Upload files restored successfully");
        } else {
          console.warn(
            "No uploads directory found in backup, skipping upload restoration"
          );
        }
      } catch (error: any) {
        throw {
          message: `Failed to restore upload files: ${error.message || error}`,
          step: "upload_restore",
          originalError: error,
        };
      }

      // Step 6: Import collections (database restore)
      // This is the critical step - if it fails, we need to rollback uploads
      try {
        let collectionFiles = fs.readdirSync(newCollectionsPath);
        collectionFiles = collectionFiles.map((item) =>
          path.join(newCollectionsPath, item)
        );

        if (collectionFiles.length === 0) {
          throw {
            message: "No collection files found in backup.",
            step: "database_import",
          };
        }

        await importCollections(collectionFiles);
        console.info("Database collections imported successfully");
      } catch (error: any) {
        // Format error properly
        const formattedError = {
          message:
            error.message ||
            `Failed to import database collections: ${String(error)}`,
          step: error.step || "database_import",
          originalError: error.originalError || error,
          collection: error.collection || "unknown",
        };
        throw formattedError;
      }

      // Step 7: Cleanup temporary files (only on success)
      try {
        await removeFolder(newCollectionsPath).catch(() => {});
        await removeFolder(newUploadPath).catch(() => {});
        await removeFolder(rollbackUploadPath).catch(() => {}); // Remove rollback backup since we succeeded
      } catch (error: any) {
        console.warn("Warning: Failed to clean up temporary files:", error);
        // Don't fail the restore if cleanup fails
      }

      // Step 8: Restart server in production
      if (process.env.NODE_ENV == "production") {
        await sleep(500);
        exec("pm2 restart all");
      }

      resolve();
    } catch (error: any) {
      // Rollback: Restore original uploads if they were modified
      if (rollbackCreated && uploadsRestored) {
        try {
          console.warn("Restore failed, rolling back uploads directory...");
          await removeFolderContent(uploadDir);
          if (fs.existsSync(rollbackUploadPath)) {
            await moveFolderContent(rollbackUploadPath, uploadDir);
            console.info("Uploads directory rolled back successfully");
          }
        } catch (rollbackError: any) {
          console.error(
            "CRITICAL: Failed to rollback uploads directory:",
            rollbackError
          );
          // Add rollback failure to error message
          error.rollbackFailed = true;
          error.rollbackError = rollbackError.message || rollbackError;
        }
      }

      // Cleanup temporary files
      try {
        if (collectionsExtracted) {
          await removeFolder(newCollectionsPath).catch(() => {});
          await removeFolder(newUploadPath).catch(() => {});
        }
        // Keep rollback backup for manual recovery if rollback failed
        if (!error.rollbackFailed) {
          await removeFolder(rollbackUploadPath).catch(() => {});
        } else {
          console.error("Rollback backup preserved at:", rollbackUploadPath);
        }
      } catch (cleanupError: any) {
        console.warn(
          "Warning: Failed to clean up temporary files after error:",
          cleanupError
        );
      }

      // Reject with formatted error
      reject({
        message: error.message || "Restore operation failed",
        step: error.step || "unknown",
        originalError: error.originalError || error,
        rollbackFailed: error.rollbackFailed || false,
        rollbackError: error.rollbackError,
      });
    }
  });
};
