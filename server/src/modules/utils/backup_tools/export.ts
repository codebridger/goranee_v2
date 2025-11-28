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
      if (err) reject(err);
      else done(stdout || stderr);
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
          await makeBackupFromCollection(dbDetail.name, dbDetail.fullUrl, colection)
            .then((r) => {
              //  console.info('#========================== ', dbDetail.name, colection, ' backup has been done.');
              //  console.log(r);
            }).catch(err => {
              console.warn('#=========== error ======== ', dbDetail.name, colection, ' backup has not been done.');
              console.error(err);
              throw err;
            });
        }
      }
    } catch (error) {
      reject(error)
    }

    done(outputDir);
  });
}

