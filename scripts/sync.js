/**
 * sync.js — trigger the Python agents from Node (useful for local testing).
 * Usage: node scripts/sync.js
 */
const { execSync } = require('child_process');
const path = require('path');

const agentsDir = path.resolve(__dirname, '../agents');

console.log('[sync] Running CrewAI agents...');
try {
  execSync('python main.py', {
    cwd: agentsDir,
    stdio: 'inherit',
    env: { ...process.env },
  });
  console.log('[sync] Agents completed successfully.');
} catch (err) {
  console.error('[sync] Agents failed:', err.message);
  process.exit(1);
}
