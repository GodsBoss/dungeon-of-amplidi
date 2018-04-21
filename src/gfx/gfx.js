var cp = require('child_process');
var fs = require('fs');

var sourceFile = process.argv[2];
var sourceFileWithoutPath = sourceFile.replace(/^.*\/([^\/]+)$/, '$1');
var targetFileWithoutPath = sourceFileWithoutPath.replace(/^(.+)\.xcf$/, '$1.png');
var targetDir = process.argv[3];
var targetFile = targetDir + '/' + targetFileWithoutPath;

try {
  fs.statSync(targetDir);
} catch (e) {
  console.log('Create gfx directory.');
  fs.mkdirSync(targetDir);
}

var sourceStat = fs.statSync(sourceFile);
try {
  var targetStat = fs.statSync(targetFile);
  if (targetStat.mtime > sourceStat.mtime) {
    // Generated file is newer than source file, no need to generate it again.
    process.exit(0);
  }
} catch (e) {
  // Target file does not exist, generate it.
}

var gimpCommand =
  'gimp -i -b ' +
  '"(let* ((image (car (gimp-file-load RUN-NONINTERACTIVE \\"' + sourceFile + '\\" \\"' + sourceFileWithoutPath + '\\")))\n' +
  ' (helper-layer (car (gimp-image-get-layer-by-name image \\"Helpers\\"))))\n' +
  ' (catch #t (gimp-image-remove-layer image helper-layer))\n' +
  '  (file-png-save RUN-NONINTERACTIVE image (car (gimp-image-merge-visible-layers image EXPAND-AS-NECESSARY)) \\"' + targetFile + '\\" \\"' + targetFileWithoutPath + '\\" 0 9 0 0 0 0 0)\n' +
  ' (gimp-quit 0))"';

cp.exec(gimpCommand);
