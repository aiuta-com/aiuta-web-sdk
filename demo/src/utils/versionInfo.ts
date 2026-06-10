declare const __SDK_VERSION__: string

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
 * package.json) so e.g. `latest` resolves to a concrete number. The deploy
 * channel is taken from the path the demo ships under (`/sdk/<segment>/`): for a
 * pinned release the segment is the version itself (redundant → hidden), for
 * `latest` / `main` / a branch it's shown alongside. Env comes from the host.
 */
export const getVersionInfo = (): VersionInfo => {
  const { hostname, pathname } = window.location

  let env: DeployEnv
  if (hostname.includes('.dev.')) env = 'dev'
  else if (hostname.includes('.preprod.')) env = 'preprod'
  else if (hostname.endsWith('aiuta.com')) env = 'prod'
  else env = 'dev' // localhost / .local / LAN — treat as dev

  const segment = pathname.match(/\/sdk\/([^/]+)\//)?.[1] ?? null
  let channel: string | null
  if (!segment)
    channel = 'local' // no deploy path → running locally
  else if (segment.replace(/^v/, '') === __SDK_VERSION__)
    channel = null // pinned full release (v5.0.0) — same as the version badge
  else channel = segment // vMAJOR (v5) / latest / main / branch

  return { version: __SDK_VERSION__, channel, env }
}
