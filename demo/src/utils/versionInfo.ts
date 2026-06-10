declare const __SDK_VERSION__: string
declare const __DEMO_ENV__: 'dev' | 'preprod' | 'prod'

export type DeployEnv = 'dev' | 'preprod' | 'prod'

export interface VersionInfo {
  /** The real package version of this build — always shown honestly. */
  version: string
  /** Deploy channel (`vMAJOR` / `latest` / `main` / a branch) when not a pinned release. */
  channel: string | null
  env: DeployEnv
}

/**
 * Version + deploy info for the header badges.
 *
 * The version is always the real build version (`__SDK_VERSION__` from
 * package.json) so e.g. `latest` resolves to a concrete number. The env is baked
 * per build mode (`__DEMO_ENV__`) so it reflects the actual backend the build
 * targets (local/debug → prod). The deploy channel is taken from the path the
 * demo ships under (`/sdk/<segment>/`): for a pinned release the segment is the
 * version itself (redundant → hidden), for `vMAJOR` / `latest` / `main` / a
 * branch it's shown alongside.
 */
export const getVersionInfo = (): VersionInfo => {
  const { pathname } = window.location

  const env: DeployEnv = __DEMO_ENV__

  const segment = pathname.match(/\/sdk\/([^/]+)\//)?.[1] ?? null
  let channel: string | null
  if (!segment)
    channel = 'local' // no deploy path → running locally
  else if (segment.replace(/^v/, '') === __SDK_VERSION__)
    channel = null // pinned full release (v5.0.0) — same as the version badge
  else channel = segment // vMAJOR (v5) / latest / main / branch

  return { version: __SDK_VERSION__, channel, env }
}
