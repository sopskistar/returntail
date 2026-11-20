import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Only the production deployment can migrate the production database. Preview
// builds never migrate a database, even if credentials were accidentally shared.
if (process.env.VERCEL_ENV === 'production') {
  console.log('Checking production database migration before building Next.js.');
  run(process.execPath, ['--import', 'tsx', 'scripts/migrate.ts']);
} else {
  console.log('Skipping database migration outside a Vercel production deployment.');
}
run('npm', ['run', 'build']);
