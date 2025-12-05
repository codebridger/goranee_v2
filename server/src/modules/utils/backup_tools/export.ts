import { exec } from 'child_process';
import * as path from 'path';

// let title = 'Goranee';
// let date = new Date();
let outputDir = path.join(__dirname, `../collections`);
let mongoBaseConnectionString = process.env.MONGODB_URL;

interface DbDetail {
  name: string;
  fullUrl: string;
  collections: string[];
}

let dbList: DbDetail[] = [{
    name: 'mrest_cms',
    fullUrl: `${mongoBaseConnectionString}/mrest_cms`,
    collections: ['auths', 'permissions'],
  },
  {
    name: 'mrest_chord',
    fullUrl: `${mongoBaseConnectionString}/mrest_chord`,
    collections: ['chords', 'keysignatures', 'tables', 'types'],
  },
  {
    name: 'mrest_tab',
    fullUrl: `${mongoBaseConnectionString}/mrest_tab`,
    collections: ['artists', 'genres', 'songs'],
  }
];

function makeBackupFromCollection(dbName: string, url: string, collection: string): Promise<string> {
  return new Promise((done, reject) => {
    let fileDir = path.join(outputDir, `${dbName} ${collection}.json`);
    let command = `mongoexport --uri="${url}" --collection="${collection}" --out="${fileDir}"`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        // Format error with meaningful message
        const errorMessage = err.message || String(err);
        const isCommandNotFound = errorMessage.includes('command not found') || errorMessage.includes('mongoexport: not found');
        
        if (isCommandNotFound) {
          reject({
            message: `mongoexport command not found. Please ensure MongoDB Database Tools are installed and in your system PATH.`,
            originalError: errorMessage,
            step: 'database_export',
            collection: `${dbName}.${collection}`
          });
        } else {
          reject({
            message: `Failed to export collection ${dbName}.${collection}: ${errorMessage}`,
            originalError: errorMessage,
            step: 'database_export',
            collection: `${dbName}.${collection}`,
            stderr: stderr
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
      for (let index in dbList) {
        let dbDetail = dbList[index];
        for (let colectionIndex in dbDetail.collections) {
          let colection = dbDetail.collections[colectionIndex];
          try {
            await makeBackupFromCollection(dbDetail.name, dbDetail.fullUrl, colection);
            //  console.info('#========================== ', dbDetail.name, colection, ' backup has been done.');
          } catch (err: any) {
            console.warn('#=========== error ======== ', dbDetail.name, colection, ' backup has not been done.');
            console.error(err);
            
            // Re-throw with proper formatting
            throw {
              message: err.message || `Failed to export collection ${dbDetail.name}.${colection}`,
              originalError: err.originalError || err,
              step: err.step || 'database_export',
              collection: err.collection || `${dbDetail.name}.${colection}`
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

