import { join, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

export function findTurboRoot(start = dirname(fileURLToPath(import.meta.url))) {
  let dir = start

  while (true) {
    const turbo = join(dir, 'turbo.json')

    // check if turbo.json is exists on current dir
    if (existsSync(turbo)) return dir

    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  throw new Error('Turborepo root not found')
}
