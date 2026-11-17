import { reconcileAll } from '../src/server/service';
import { pool } from '../src/server/db';
console.log(JSON.stringify(await reconcileAll(),null,2));
await pool().end();
