const fs = require('fs');
const path = require('path');
const fx = require('mkdir-recursive');
const Spritesmith = require('spritesmith');

const srcPath = path.join(__dirname, 'src');
const dstPath = path.join(__dirname, 'dist');
const sizes = [16, 24, 32, 48, 64];
const styles = ['flat', 'shiny'];
const countries = JSON.parse(fs.readFileSync(path.join(
	__dirname, 'node_modules', 'world-countries', 'dist', 'countries.json'
)));

for (let style of styles) {
	const styleCss = [];
	for (let size of sizes) {
		console.log('Copying ' + size + 'px ' + style + ' flags...');
		const stats = copySubsetImages(style, size);
		console.log('Generating ' + size + 'px ' + style + ' css...');
		const css = generateSubsetCss(style, size, stats.resolved);
		styleCss.push(css);
		console.log('Generating ' + size + 'px ' + style + ' spritesheet...');
		generateSpriteSheet(style, size);
	}
	console.log('Generating ' + style + ' css...');
	const filePath = path.join(dstPath, style + '.css');
	const data = styleCss.join('\n');
	fs.writeFileSync(filePath, data, 'utf8');
}

function generateSpriteSheet(style, size) {
	// Make it sync
	const iter = (function*() {
		yield _generateSpriteSheet(style, size, () => iter.next());
	})();
	iter.next();
}

function _generateSpriteSheet(style, size, cb) {
	const basePath = getSubsetDstPath(style, size);
	const sprites = fs.readdirSync(basePath).map(name => path.join(basePath, name));
	const dstImageName = style + size + 'sheet.png';
	const dstImagePath = path.join(dstPath, dstImageName);
	const dstCssPath = path.join(dstPath, style + size + 'sheet.css');
	// Generate PNG
	Spritesmith.run({src: sprites}, function(err, result) {
		if (err) {
			console.error(err);
			return;
		}
		fs.writeFileSync(dstImagePath, result.image);
		// Generate stylesheet
		const css = [
			'.cf-' + size + '{display:inline-block;vertical-align:middle}',
			'.cf-' + size + ':before{content:"";display:block;' +
				'background:url(' + dstImageName + ') no-repeat;' + 
				'width:' + size + 'px;height:' +
				size + 'px;}'
		];
		for (let filePath of Object.keys(result.coordinates)) {
			const chunks = filePath.split(/\\|\//);
			const fileName = chunks[chunks.length - 1];
			const cca2 = fileName.split('.')[0];
			const coords = result.coordinates[filePath];
			css.push(
				'.cf-' + size + '.cf-' + cca2 + ':before{background-position:' +
				(-coords.x) + 'px ' + (-coords.y) + 'px}'
			);
		}
		fs.writeFileSync(dstCssPath, css.join('\n'), 'utf8');
		cb();
	});
}

function generateSubsetCss(style, size, resolved) {
	const css = [
		'.cf-' + size + '{display:inline-block;vertical-align:middle}',
		'.cf-' + size + ':before{content:"";display:block;' +
			'background:no-repeat 50% 50%;background-size:contain;width:' +
			size + 'px;height:' + size + 'px}'
	];
	for (let chunks of resolved) {
		const cca2 = chunks[0];
		const ext = chunks[1];
		const url = style + size + '/' + cca2 + '.' + ext;
		css.push(
			'.cf-' + size + '.cf-' + cca2 + ':before{background-image:url(' +
			url + ')}'
		);
	}
	const filePath = path.join(dstPath, style + size + '.css');
	const data = css.join('\n');
	fs.writeFileSync(filePath, data, 'utf8');
	return data;
}

function copySubsetImages(style, size) {
	const fileNames = getSubsetSrcFileNames(style, size);
	const srcBase = getSubsetSrcPath(style, size);
	const dstBase = getSubsetDstPath(style, size);
	const stats = {
		total: fileNames.length,
		resolved: []
	};
	fx.mkdirSync(dstBase);
	for (fileName of fileNames) {
		const chunks = fileName.split('.');
		if (chunks.length !== 2) {
			continue;
		}
		const baseName = chunks[0];
		const ext = chunks[1];
		const cca2 = nameToCCA2(baseName);
		if (!cca2) {
			continue;
		}
		copyFileSync(
			path.join(srcBase, fileName),
			path.join(dstBase, cca2 + '.' + ext)
		);
		stats.resolved.push([cca2, ext]);
	}
	return stats;
}



function copyFileSync(source, target) {
	const data = fs.readFileSync(source, {flag: 'r'});
	fs.writeFileSync(target, data, {flag: 'w'});
}

function nameToCCA2(name) {
	name = name.replace(/\-/g, ' ').toLowerCase();
	for (country of countries) {
		if (country.name.common.toLowerCase() === name ||
			country.name.official.toLowerCase() === name)
			return country.cca2.toLowerCase();
	}
	return false;
}

function getSubsetDstPath(style, size) {
	return path.join(dstPath, style + size);
}

function getSubsetSrcPath(style, size) {
	return path.join(srcPath, 'flags', style+'', size+'');
}

function getSubsetSrcFileNames(style, size) {
	const base = getSubsetSrcPath(style, size);
	return fs.readdirSync(base);
}
