import { exec } from "child_process";
import { getCollection } from "@modular-rest/server";

// let filesDir = require('path').join(__dirname, 'files');
let dbConnectionStr = process.env.MONGODB_URL;

function ImportFile(
  fileDir: string,
  db: string,
  coll: string
): Promise<string> {
  return new Promise((done, reject) => {
    let url = `${dbConnectionStr}/${db}`;
    let command = `mongoimport --uri="${url}" --collection="${coll}" --file="${fileDir}"`;

    exec(command, (err, stdout, stderr) => {
      if (err) reject(err);
      else done(stdout || stderr);
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

export async function importCollections(collectionPaths: string[]) {
  for (let fileDir of collectionPaths) {
    const pathPars = fileDir.split("/");
    const fileName = pathPars[pathPars.length - 1];
    const dbName = fileName.split(" ")[0];
    const collection = fileName.split(" ")[1].split(".")[0];

    // Remove all data
    //
    try {
      await clearData(dbName, collection);
    } catch (error) {
      // debugger
    }

    // Import new data
    //
    await ImportFile(fileDir, dbName, collection)
      .then((r) => {
        console.info(
          "#========================== ",
          fileName,
          " import has been done."
        );
        // console.log(r);
      })
      .catch((err) => {
        console.warn(
          "#=========== error ======== ",
          fileName,
          " import has not been done."
        );
        console.error(err);
      });
  }
}
