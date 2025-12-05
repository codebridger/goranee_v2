import { exec } from "child_process";
import { getCollection } from "@modular-rest/server";

// let filesDir = require('path').join(__dirname, 'files');
let dbConnectionStr = process.env.MONGODB_URL || "mongodb://localhost:27017";

function ImportFile(
  fileDir: string,
  db: string,
  coll: string
): Promise<string> {
  return new Promise((done, reject) => {
    let url = `${dbConnectionStr}/${db}`;

    // Try to find mongoimport in common locations if strictly not found in PATH,
    // but usually fixing the PATH or just relying on the command is better.
    // For now, we stick to "mongoimport" but ensure the URL is correct.
    let command = `mongoimport --uri="${url}" --collection="${coll}" --file="${fileDir}"`;

    // Note: If mongoimport is not found, ensure it is installed and in the system PATH.
    // On macOS with Homebrew, it might be at /opt/homebrew/bin/mongoimport

    exec(command, (err, stdout, stderr) => {
      if (err) {
        // Format error with meaningful message
        const errorMessage = err.message || String(err);
        const isCommandNotFound = errorMessage.includes('command not found') || errorMessage.includes('mongoimport: not found');
        
        if (isCommandNotFound) {
          reject({
            message: `mongoimport command not found. Please ensure MongoDB Database Tools are installed and in your system PATH.`,
            originalError: errorMessage,
            step: 'database_import',
            collection: `${db}.${coll}`
          });
        } else {
          reject({
            message: `Failed to import collection ${db}.${coll}: ${errorMessage}`,
            originalError: errorMessage,
            step: 'database_import',
            collection: `${db}.${coll}`,
            stderr: stderr
          });
        }
      } else {
        done(stdout || stderr);
      }
    });
  });
}

function clearData(db: string = "", collection: string = ""): any {
  const prefix = process.env.MONGODB_prefix || "";

  // Normaliz db name
  //
  db = db.replace(prefix, "");

  // Normaliz collection name
  //
  if (collection.endsWith("s")) {
    let cParts = collection.split("");
    cParts.pop();
    collection = cParts.join("");
  }

  let collectionAdapter = getCollection(db, collection);
  return collectionAdapter.deleteMany({});
}

export async function importCollections(collectionPaths: string[]): Promise<void> {
  for (let fileDir of collectionPaths) {
    const pathPars = fileDir.split("/");
    const fileName = pathPars[pathPars.length - 1];
    const dbName = fileName.split(" ")[0];
    const collection = fileName.split(" ")[1].split(".")[0];

    // Remove all data
    // If clearing fails, log warning but continue (data might not exist)
    try {
      await clearData(dbName, collection);
    } catch (error: any) {
      console.warn(
        `Warning: Failed to clear collection ${dbName}.${collection} before import:`,
        error?.message || error
      );
      // Continue with import even if clear fails - might be empty collection
    }

    // Import new data
    // This must succeed - throw error if it fails
    try {
      const result = await ImportFile(fileDir, dbName, collection);
      console.info(
        "#========================== ",
        fileName,
        " import has been done."
      );
    } catch (err: any) {
      // Log the error for debugging
      console.error(
        "#=========== error ======== ",
        fileName,
        " import has not been done."
      );
      console.error(err);
      
      // Re-throw with proper formatting
      throw {
        message: err.message || `Failed to import collection from ${fileName}`,
        originalError: err.originalError || err,
        step: err.step || 'database_import',
        collection: err.collection || `${dbName}.${collection}`,
        fileName: fileName
      };
    }
  }
}
