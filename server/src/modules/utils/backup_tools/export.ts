import { exec } from "child_process";
import * as path from "path";
import * as fs from "fs";

declare global {
  var rootPath: string;
}

import { modelRegistry } from "@modular-rest/server/";

// Fallback if rootPath is not defined
const getRootPath = () => global.rootPath || process.cwd();

// let title = 'Goranee';
// let date = new Date();
// Use server root path instead of __dirname to ensure consistent path structure in zip files
let outputDir = path.join(getRootPath(), "collections");
let mongoBaseConnectionString = process.env.MONGODB_URL;

interface DbDetail {
  name: string;
  fullUrl: string;
  collections: string[];
}

/**
 * Builds the database list dynamically from collection definitions.
 * Groups collections by database name.
 */
function buildDbList(): DbDetail[] {
  const collectionDefinitions = modelRegistry.getCollectionDefinitions();
  const dbMap = new Map<string, Set<string>>();

  // Process all collection definitions from the registry
  if (collectionDefinitions && Array.isArray(collectionDefinitions)) {
    for (const definition of collectionDefinitions) {
      const model = definition.getModel();

      // Get collection name from Mongoose 5 model (most reliable source)
      const collectionName = model?.collection?.name;

      // Get database name from definition (database property)
      const dbName = model?.db.name;

      if (dbName && collectionName) {
        if (!dbMap.has(dbName)) {
          dbMap.set(dbName, new Set<string>());
        }
        dbMap.get(dbName)!.add(collectionName);
      }
    }
  }

  // Build DbDetail array from the map
  const dbList: DbDetail[] = [];

  // Process each database
  for (const [dbName, collections] of dbMap.entries()) {
    dbList.push({
      name: dbName,
      fullUrl: `${mongoBaseConnectionString}/${dbName}`,
      collections: Array.from(collections).sort(),
    });
  }

  // Sort databases by name for consistent ordering
  return dbList.sort((a, b) => a.name.localeCompare(b.name));
}

function makeBackupFromCollection(
  dbName: string,
  url: string,
  collection: string
): Promise<string> {
  return new Promise((done, reject) => {
    let fileDir = path.join(outputDir, `${dbName} ${collection}.json`);
    let command = `mongoexport --uri="${url}" --collection="${collection}" --out="${fileDir}"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        // Format error with meaningful message
        const errorMessage = err.message || String(err);
        const isCommandNotFound =
          errorMessage.includes("command not found") ||
          errorMessage.includes("mongoexport: not found");

        if (isCommandNotFound) {
          reject({
            message: `mongoexport command not found. Please ensure MongoDB Database Tools are installed and in your system PATH.`,
            originalError: errorMessage,
            step: "database_export",
            collection: `${dbName}.${collection}`,
          });
        } else {
          reject({
            message: `Failed to export collection ${dbName}.${collection}: ${errorMessage}`,
            originalError: errorMessage,
            step: "database_export",
            collection: `${dbName}.${collection}`,
            stderr: stderr,
          });
        }
      } else {
        done(stdout || stderr);
      }
    });
  });
}

export function startBackUp(): Promise<string> {
  return new Promise(async (done, reject) => {
    try {
      // Build dbList dynamically to ensure all collections are included
      const dbList = buildDbList();

      // Validate that we have collections to export
      if (!dbList || dbList.length === 0) {
        reject({
          message:
            "No collections found to export. Check that collection definitions are properly registered.",
          step: "database_export",
        });
        return;
      }

      // Ensure collections directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      for (let index in dbList) {
        let dbDetail = dbList[index];
        for (let colectionIndex in dbDetail.collections) {
          let colection = dbDetail.collections[colectionIndex];
          try {
            await makeBackupFromCollection(
              dbDetail.name,
              dbDetail.fullUrl,
              colection
            );
            //  console.info('#========================== ', dbDetail.name, colection, ' backup has been done.');
          } catch (err: any) {
            console.warn(
              "#=========== error ======== ",
              dbDetail.name,
              colection,
              " backup has not been done."
            );
            console.error(err);

            // Re-throw with proper formatting
            throw {
              message:
                err.message ||
                `Failed to export collection ${dbDetail.name}.${colection}`,
              originalError: err.originalError || err,
              step: err.step || "database_export",
              collection: err.collection || `${dbDetail.name}.${colection}`,
            };
          }
        }
      }
    } catch (error) {
      reject(error);
      return;
    }

    done(outputDir);
  });
}
