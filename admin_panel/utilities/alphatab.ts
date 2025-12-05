import { Settings, importer } from '@coderline/alphatab';

function loadFile(link: string) {
	return new Promise((done, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', link, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = () => {
			const data = new Uint8Array(xhr.response);
			const settings = new Settings();
			let score = importer.ScoreLoader.loadScoreFromBytes(data, settings);
			done(score);
		}

		xhr.onerror = (ev) => {
			reject({ type: ev.type, loaded: ev.loaded });
		}
	})
}

export default {
	loadFile,
}