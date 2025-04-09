import fs from 'fs';
import UglifyJS from "uglify-js";

let opts = { compress: true, mangle: { 'properties': true } }
// let opts2 = { compress: false, mangle: false }
let code = fs.readFileSync('src/articleid.js', 'utf8')
let result = UglifyJS.minify(code + "main();", opts);
let bookmarklet = "javascript:(function(){" + result.code + "})();";
fs.writeFileSync('bookmarklet2.js', bookmarklet);
