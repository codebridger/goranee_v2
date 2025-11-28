import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { startBackUp } from '../utils/backup_tools/export';
import { importCollections } from '../utils/backup_tools/import';
import { createZipFile, unzip, removeFolder, removeFolderContent, moveFolderContent, getSize, moveFile } from '../utils/file';
import { sleep } from '../utils/promise';

declare global {
    var rootPath: string;
}

// Fallback if rootPath is not defined
const getRootPath = () => global.rootPath || process.cwd();

export const createBackup = async () => {

	// Create backup from database and get directory
	const temporaryBackupDirectory = await startBackUp()

	// Get upload directory
	const uploadFolder = path.join(getRootPath(), 'uploads');

	const time = new Date().toISOString().split('.')[0].replace('T', '_')
	const zipName = `goranee_${time}.zip`;
	const permanentBackupDirectory = path.join('backups');
	const permanentBackupFile = path.join(permanentBackupDirectory, zipName);
	// fs.opendirSync(permanentBackupDirectory);

	let assetsPaths = [temporaryBackupDirectory, uploadFolder]
	assetsPaths = assetsPaths.map(asset => './' + asset.split('/server')[1])

	await createZipFile(permanentBackupFile, assetsPaths)
		.finally(() => removeFolder(temporaryBackupDirectory))
}

export const removeBackupFile = (filePath: string) => {
	let backupFile = path.join(getRootPath(), 'backups', filePath);
	fs.unlink(backupFile, (err) => {});
}

export const getBackupList = async () => {
	let backupDir = path.join(getRootPath(), 'backups');

	let files: string[] = [];

	try {
		files = fs.readdirSync(backupDir);
	} catch (error) {

	}

	let backupList: { title: string, size: number }[] = [];

	try {
		for (let i = 0; i < files.length; i++) {
			const file = path.join(backupDir, files[i]);
			let size = await getSize(file);

			if (!file.endsWith('.zip')) continue

			backupList.push({
				title: files[i],
				size
			})
		}
	} catch (error) {
		console.log(error);
	}

	return backupList;
}

export const insertBackup = async (file: any) => {
	let name = file.name.split(' ').join('-')
	return moveFile(file.path, './backups', name);
}

export const restore = (filename: string): Promise<void> => {

	return new Promise(async (resolve, reject) => {

		const list = await getBackupList().catch(reject);
		if (!list) return;

		if (list.findIndex(item => item.title == filename) == -1) {
			reject({
				message: `The requested backup file couldn't find.`,
			})
			return;
		}

		const uploadDir = path.join(__dirname, '../../../', 'uploads')
		const newUploadPath = path.join(__dirname, '../../../backups/uploads')
		const newCollectionsPath = path.join(__dirname, '../../../backups/collections')

		// Remove old data
		//
		await removeFolder(newUploadPath)
		await removeFolder(newCollectionsPath)

		// Unzip back up file
		//
		const backupDir = path.join(__dirname, '../../../backups')
		const filePath = path.join(backupDir, filename)

		let done = await unzip(filePath, backupDir)
			.then(_ => true)
			.catch(reject)

		if (!done) return;

		// Move upload file
		//
		await removeFolderContent(uploadDir)
		done = await moveFolderContent(newUploadPath, uploadDir)
			.then(_ => true)
			.catch(reject)


		if (!done) return;

		// Restore docs
		//
		let collectionFiles = fs.readdirSync(newCollectionsPath);
		collectionFiles = collectionFiles.map(item => path.join(newCollectionsPath, item))

		done = await importCollections(collectionFiles)
			.then(_ => true) // returns void usually, but boolean here for flow
			.catch(reject)

		if (done)
			resolve();

		// Remove data
		//
		await removeFolder(newCollectionsPath)
		await removeFolder(newUploadPath);

		if (process.env.NODE_ENV == 'production') {
			await sleep(500)
			exec('pm2 restart all');
		}
	})

}

