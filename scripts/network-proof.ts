import { writeFile, mkdir } from 'node:fs/promises';
import { Fulcrum } from '../src/server/chain';
import { network } from '../src/server/config';
const n=network(),host=process.env.BCH_ELECTRUM_HOST||(n==='mainnet'?'bch.imaginary.cash':'chipnet.imaginary.cash');
const c=new Fulcrum(host,Number(process.env.BCH_ELECTRUM_PORT||50002));
try{await c.connect(n);const tip=await c.request('blockchain.headers.subscribe'),features=await c.request('server.features');const evidence={kind:'read-only network connectivity; no transfer performed',network:n,host,checkedAt:new Date().toISOString(),checkpointVerified:true,tip,features};await mkdir('artifacts/evidence',{recursive:true});await writeFile(`artifacts/evidence/${n}-network.json`,JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));}finally{c.close();}
