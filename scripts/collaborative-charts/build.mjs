import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const directory=fileURLToPath(new URL('.',import.meta.url));
await build({entryPoints:[directory+'charts.jsx'],bundle:true,minify:true,format:'iife',target:['es2020'],define:{'process.env.NODE_ENV':'"production"'},outfile:directory+'../../assets/collaborative-charts.bundle.js',legalComments:'eof'});
