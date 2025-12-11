import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function readDir(dir: string): string[] {
    let list: string[] = [];

    try {
        list = fs.readdirSync(dir);
    } catch (error) {
        // debugger
    }

    return list;
}

export const removeFolder = (folderPath: string): Promise<void> => {
    return new Promise((done, reject) => {

        exec(`rm -rf ${folderPath}`, (error, out) => {
            if (error) console.log(error.message);
            if (error && error.killed) reject(error);
            else done();
        });

    })
}

export const removeFolderContent = (dir: string): Promise<void> => {

    return new Promise(async (done, reject) => {
        let list = readDir(dir)

        for (const item of list) {
            const itemPath = path.join(dir, item);
            try {
                await removeFolder(itemPath)
            } catch (error) {
                reject(error)
                break;
            }
        }

        done();
    })
}

export const getSize = (file: string): Promise<number> => {
    return new Promise((done, reject) => {
        fs.stat(file, (err, state) => {
            if (err) reject(err)
            else done(state.size / (1024 * 1024))
        });
    });
}

export const unzip = (zipPath: string, dest: string): Promise<void> => {
    let command = `unzip -o ${zipPath}`;

    if (dest)
        command += ` -d ${dest}`

    return new Promise((done, reject) => {
        exec(command.trim(), (error, outSTR) => {

            if (error) console.log(error.message);

            if (error && error.killed) {
                reject({
                    message: error.message
                });
            } else {
                done();
            }
        });
    });
}

export const createZipFile = (zipPath: string = '/file.zip', compressingFilesAndFolders: string[] = []): Promise<void> => {

    const command = `zip -r ${zipPath} ${compressingFilesAndFolders.join(' ')}`;

    // Recognize directory
    let dirParts = zipPath.split(path.sep)
    dirParts.splice(dirParts.length - 1, 1)
    let directory = dirParts.join(path.sep);

    // Create directory if it dosent exist
    fs.mkdirSync(directory, {
        recursive: true
    });

    return new Promise((done, reject) => {

        exec(command, (error, outSTR) => {

            if (error) console.log(error.message);

            if (error && error.killed) {
                reject({
                    message: error.message
                });
            } else done();
        });
    });
}

export const moveFile = (source: string, dest: string, name: string = ''): Promise<void> => {
    // Validate inputs
    if (!source) {
        return Promise.reject({
            message: `Source path is required but was ${source === undefined ? 'undefined' : 'empty'}`,
            step: "file_move",
        });
    }

    if (!dest) {
        return Promise.reject({
            message: `Destination path is required but was ${dest === undefined ? 'undefined' : 'empty'}`,
            step: "file_move",
        });
    }

    // Construct destination path with optional filename
    let destinationPath = dest;
    if (name) {
        destinationPath = path.join(dest, name);
    }

    // Create directory if it doesn't exist
    fs.mkdirSync(dest, {
        recursive: true
    });

    // Construct command with proper path handling
    let command = `mv "${source}" "${destinationPath}"`;

    return new Promise((done, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`moveFile error: ${error.message}`);
                console.error(`Command: ${command}`);
                console.error(`stderr: ${stderr}`);
                
                // Reject on any error, not just when killed
                reject({
                    message: `Failed to move file from "${source}" to "${destinationPath}": ${error.message || stderr || 'Unknown error'}`,
                    step: "file_move",
                    originalError: error.message,
                    stderr: stderr,
                });
            } else {
                done();
            }
        });
    });
}

export const moveFolderContent = async (source: string, dest: string): Promise<void> => {
    // Create directory if it dosent exist
    fs.mkdirSync(dest, {
        recursive: true
    });

    let movingList = readDir(source);

    for (const item of movingList) {
        const itemPath = path.join(source, item);

        try {
            await moveFile(itemPath, dest)
        } catch (error) {
            throw error;
            // break; // unreachable code after throw
        }
    }
}

export const copyFolder = (source: string, dest: string): Promise<void> => {
    // Create directory if it doesn't exist
    fs.mkdirSync(dest, {
        recursive: true
    });

    return new Promise((done, reject) => {
        // Use cp -r to copy directory contents
        // The command copies all contents from source to dest
        exec(`cp -r "${source}/." "${dest}/" 2>&1`, (error, stdout, stderr) => {
            if (error) {
                // Check if error is due to empty directory (which is acceptable)
                if (stderr && stderr.includes('No such file or directory')) {
                    // Source might be empty, which is fine
                    done();
                } else if (error.killed) {
                    reject({
                        message: `Failed to copy folder from ${source} to ${dest}: ${error.message || stderr}`
                    });
                } else {
                    // Some other error occurred
                    reject({
                        message: `Failed to copy folder from ${source} to ${dest}: ${error.message || stderr}`
                    });
                }
            } else {
                done();
            }
        });
    });
}

