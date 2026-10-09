/* Static distribution checks; no network or browser required. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.join(__dirname,'..');const files=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const abs=path.join(dir,ent.name);assert(!ent.isSymbolicLink(),'No symlinks in public package');if(ent.isDirectory()){assert(!['.git','.openai','node_modules'].includes(ent.name));walk(abs);}else files.push(path.relative(root,abs));}}walk(root);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){const ref=match[1];if(/^(https?:|data:|#|\.\/$)/.test(ref))continue;assert(fs.existsSync(path.join(root,ref)),`Missing local reference ${ref}`);}
for(const file of files.filter(x=>x.endsWith('.js')||x.endsWith('.cjs')))new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');assert(app.includes("const STORE='city-streak-v1'"),'Preserve legacy browser progress key');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),context);assert.equal(context.window.CITY_DATA.meta.storageVersion,'2026-10-07');
for(const file of ['README.md','LICENSE.txt','THIRD_PARTY_NOTICES.md','PUBLISHING.md','.gitignore','.nojekyll','fonts/NOTO-LICENSE.txt'])assert(files.includes(file));
const fontLicense=fs.readFileSync(path.join(root,'fonts/NOTO-LICENSE.txt'),'utf8');assert(/SIL Open Font License/i.test(fontLicense));assert(fontLicense.includes('Google'));
for(const file of files.filter(x=>!x.endsWith('.ttf'))){const text=fs.readFileSync(path.join(root,file),'utf8');assert(!/\/(?:workspace|home|tmp)\//.test(text),`Local path leak: ${file}`);}
console.log(JSON.stringify({passed:true,files:files.length,syntaxChecks:files.filter(x=>/\.(?:js|cjs)$/.test(x)).length,localReferences:true,legacyProgressKeys:true,fontNotices:true}));
