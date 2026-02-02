import { spawn } from 'node:child_process';

export interface SpawnToStringResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

export function spawnToString(
  cmd: string,
  args: string[],
  stdin: string,
  env: NodeJS.ProcessEnv,
  timeoutMs?: number
): Promise<SpawnToStringResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { env, stdio: 'pipe' });
    const out = attachCollectors(child);
    child.on('error', reject);
    applyTimeout(child, timeoutMs);
    child.stdin.end(stdin);
    child.on('close', code => resolve({ code, stdout: out.stdout, stderr: out.stderr }));
  });
}

function attachCollectors(child: ReturnType<typeof spawn>): { stdout: string; stderr: string } {
  let stdout = '';
  let stderr = '';
  if (!child.stdout || !child.stderr) {
    throw new Error('spawnToString requires stdout/stderr pipes');
  }
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', chunk => (stdout += chunk));
  child.stderr.on('data', chunk => (stderr += chunk));
  return { get stdout() { return stdout; }, get stderr() { return stderr; } };
}

function applyTimeout(child: ReturnType<typeof spawn>, timeoutMs?: number): void {
  if (!timeoutMs) return;
  const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
  timer.unref();
}
