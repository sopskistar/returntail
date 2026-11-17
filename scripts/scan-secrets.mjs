import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\b(?:sk_live_|sk-proj-|ghp_|github_pat_)[A-Za-z0-9_-]{20,}/,/postgres(?:ql)?:\/\/[^\s:]+:[^\s@]+@(?!localhost|127\.0\.0\.1)[^\s]+/];
const failures=[];
for(const file of files){if(!existsSync(file)||file==='scripts/scan-secrets.mjs')continue;if(/(^|\/)\.env(?!\.example$)/.test(file)){failures.push(`${file}: environment file must not be tracked`);continue;}const text=readFileSync(file,'utf8');for(const p of patterns)if(p.test(text))failures.push(`${file}: possible credential pattern`);}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}console.log(`Secret-pattern scan passed across ${files.length} tracked and unignored candidate files. This is a heuristic, not a guarantee.`);
