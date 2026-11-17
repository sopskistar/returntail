import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { invariant } from '@/core/errors';
import { authSecret, appUrl } from './config';
import type { Sql } from './db';
const scrypt=promisify(scryptCallback);
export const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export const token=()=>randomBytes(32).toString('base64url');
export function capabilityHash(s:string){return createHmac('sha256',authSecret()).update(s).digest('hex');}
export async function passwordHash(password:string){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64) as Buffer;return `scrypt:${salt}:${key.toString('hex')}`;}
export async function passwordMatches(password:string,encoded:string){const [algorithm,salt,key]=encoded.split(':');if(algorithm!=='scrypt'||!salt||!key)return false;const expected=Buffer.from(key,'hex'),actual=await scrypt(password,salt,64) as Buffer;return expected.length===actual.length&&timingSafeEqual(expected,actual);}
export function assertOrigin(req:Request){
 const origin=req.headers.get('origin');
 invariant(origin===new URL(appUrl()).origin,'CSRF_REJECTED','This action must come from ReturnTail.',403);
 invariant(req.headers.get('content-type')?.startsWith('application/json'),'CONTENT_TYPE','Use a JSON request.',415);
 invariant(!Number(req.headers.get('content-length'))||Number(req.headers.get('content-length'))<=220000,'BODY_TOO_LARGE','Request body is too large.',413);
}
export async function rateLimit(db:Sql,bucket:string,limit=60,seconds=60){
 const result=await db.query<{count:number}>(`INSERT INTO rate_limits(bucket,count,reset_at) VALUES($1,1,now()+($2::int*interval '1 second'))
 ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN rate_limits.reset_at<now() THEN 1 ELSE rate_limits.count+1 END,
 reset_at=CASE WHEN rate_limits.reset_at<now() THEN now()+($2::int*interval '1 second') ELSE rate_limits.reset_at END RETURNING count`,[bucket,seconds]);
 invariant(result.rows[0].count<=limit,'RATE_LIMITED','Too many attempts. Wait a minute before trying again.',429);
}
export function ipBucket(req:Request){
 // Vercel overwrites this header. Else use a shared bucket (never trust forwarded IP input).
 return process.env.VERCEL==='1'?hash(req.headers.get('x-vercel-forwarded-for')??'unknown'):'local-shared';
}
export async function idempotent<T>(db:Sql,scope:string,key:string,fingerprint:unknown,fn:()=>Promise<T>):Promise<T>{
 invariant(/^[\w-]{16,100}$/.test(key),'IDEMPOTENCY_REQUIRED','A valid idempotency key is required.');
 await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`${scope}:${key}`]);
 const digest=hash(JSON.stringify(fingerprint)),old=await db.query('SELECT fingerprint,response FROM idempotency WHERE scope=$1 AND key=$2',[scope,key]);
 if(old.rows.length){invariant(old.rows[0].fingerprint===digest,'IDEMPOTENCY_CONFLICT','This key was already used for a different request.',409);return old.rows[0].response as T;}
 const result=await fn();await db.query('INSERT INTO idempotency(scope,key,fingerprint,response) VALUES($1,$2,$3,$4)',[scope,key,digest,JSON.stringify(result)]);return result;
}
