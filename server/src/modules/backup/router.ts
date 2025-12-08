import Router from "koa-router";
import { reply } from "@modular-rest/server";
import * as service from "./service";

/**
 * Backup Module
 *
 * This module handles the creation, listing, restoration, and deletion of system backups.
 *
 * Backup Cycle:
 * 1. Creation: Triggered via GET /. The system exports the database and zips it along with the uploads directory.
 * 2. Storage: Backups are stored locally in the 'backups' directory as .zip files.
 * 3. Restoration: Triggered via POST /restore. The system:
 *    - Unzips the selected backup file.
 *    - Replaces the current 'uploads' directory with the backup's version.
 *    - Restores the database collections from the backup.
 *    - Restarts the application (in production) to apply changes.
 *
 * The module also supports uploading external backup files (must be .zip) and deleting existing backups.
 */

const name = "backup";

let backup = new Router();

/**
 * Creates a new system backup.
 *
 * Triggers the backup process which:
 * 1. Dumps the MongoDB database.
 * 2. Archives the 'uploads' folder.
 * 3. Creates a timestamped .zip file in the backups directory.
 *
 * @route GET /api/backup/
 * @returns {Promise<void>} Success message if backup is created successfully.
 */
backup.get("/", async (ctx) => {
  await service
    .createBackup()
    .then((_) => {
      ctx.body = reply.create("s");
    })
    .catch((error: any) => {
      console.error("Backup creation failed:", error);
      ctx.status = 500;
      ctx.body = reply.create("f", {
        message:
          error?.message ||
          "Backup request failed, please inform the administrator.",
        step: error?.step || "backup_creation",
        originalError:
          process.env.NODE_ENV === "development" ? error : undefined,
      });
    });
});

/**
 * Lists all available backup files.
 *
 * Returns a list of files in the backup directory.
 * Filters results to include only .zip files.
 *
 * @route GET /api/backup/list
 * @returns {Promise<void>} JSON response containing the list of backup files with their sizes.
 */
backup.get("/list", async (ctx) => {
  try {
    ctx.body = reply.create("s", {
      list: await service.getBackupList(),
    });
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = reply.create("f", error);
  }
});

/**
 * Deletes a specific backup file.
 *
 * @route DELETE /api/backup/:fileName
 * @param {string} fileName - The name of the file to delete (from the URL parameters).
 * @returns {void} Success message.
 */
backup.delete("/:fileName", (ctx) => {
  let fileName = ctx.params.fileName;
  service.removeBackupFile(fileName);

  ctx.body = reply.create("s");
});

/**
 * Uploads a backup file.
 *
 * This endpoint expects a multipart/form-data request with a "file" field.
 * It processes the uploaded file using the backup service.
 *
 * Note: This endpoint strictly accepts only .zip files.
 *
 * @route POST /api/backup/
 * @param {Context} ctx - Koa context object
 * @returns {Promise<void>}
 */
backup.post("/", async (ctx: any) => {
  let file = ctx.request.files ? ctx.request.files.file : null;
  let result;

  if (!file) {
    ctx.status = 412;
    result = reply.create("f", {
      message: "file field required",
    });
  } else if (
    !file.originalFilename ||
    !file.originalFilename.endsWith(".zip")
  ) {
    ctx.status = 415;
    result = reply.create("f", {
      message: "Only .zip files are accepted",
    });
  } else {
    await service
      .insertBackup(file)
      .then((_) => {
        result = reply.create("s", {
          message: "Backup inserted",
        });
      })
      .catch((_) => {
        ctx.status = 500;
        result = reply.create("f", _);
      });
  }

  ctx.body = result;
});

/**
 * Restores the system from a backup file.
 *
 * This process is destructive to current data:
 * 1. Wipes current uploads and database data.
 * 2. Replaces them with data from the specified backup file.
 * 3. May restart the server process.
 *
 * @route POST /api/backup/restore
 * @param {string} fileName - The name of the backup file to restore (in the request body).
 * @returns {Promise<void>} Success message or error details.
 */
backup.post("/restore", async (ctx) => {
  // @ts-ignore
  const { fileName } = ctx.request.body;

  if (!fileName) {
    ctx.status = 400;
    ctx.body = reply.create("f", {
      message: '"fileName" parameter is required.',
      step: "validation",
    });
    return;
  }

  await service
    .restore(fileName)
    .then((_) => {
      ctx.body = reply.create("s");
    })
    .catch((error: any) => {
      console.error("Restore operation failed:", error);

      // Determine appropriate HTTP status code based on error type
      let statusCode = 500; // Default to server error
      if (error?.step === "validation") {
        statusCode = 400; // Bad request for validation errors
      } else if (
        error?.step === "database_import" ||
        error?.step === "database_export"
      ) {
        statusCode = 500; // Server error for database operations
      }

      // Format error response
      const errorResponse: any = {
        message:
          error?.message ||
          "Restore operation failed. Please check the logs for details.",
        step: error?.step || "unknown",
      };

      // Include rollback status if available
      if (error?.rollbackFailed !== undefined) {
        errorResponse.rollbackFailed = error.rollbackFailed;
        if (error.rollbackFailed) {
          errorResponse.rollbackError = error.rollbackError;
          errorResponse.message +=
            " WARNING: Automatic rollback also failed. Manual intervention may be required.";
        } else {
          errorResponse.message +=
            " The system has been rolled back to its previous state.";
        }
      }

      // Include original error details in development mode
      if (process.env.NODE_ENV === "development" && error?.originalError) {
        errorResponse.originalError = error.originalError;
      }

      ctx.status = statusCode;
      ctx.body = reply.create("f", errorResponse);
    });
});

module.exports.name = name;
module.exports.main = backup;
