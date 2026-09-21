import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const out = mkdtempSync(join(tmpdir(), 'card-rules-'));
try {
  const compiled = spawnSync('node_modules/.bin/tsc', ['--ignoreConfig', '--outDir', out, '--module', 'commonjs', '--target', 'es2022', '--skipLibCheck', 'src/games/cards/core.ts', 'src/games/cards/shedding.ts', 'src/games/cards/poker.ts'], { stdio: 'inherit' });
  if (compiled.status !== 0) process.exitCode = 1;
  else {
    writeFileSync(join(out, 'package.json'), '{"type":"commonjs"}');
    const result = spawnSync(process.execPath, ['--test', 'tests/cards/engine.test.mjs'], { stdio: 'inherit', env: { ...process.env, CARD_ENGINE_DIR: out } });
    process.exitCode = result.status ?? 1;
  }
} finally { rmSync(out, { recursive: true, force: true }); }
