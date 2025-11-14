// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, Config } from 'payload'
import sharp from 'sharp'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { plugins } from './plugins'
import { findTurboRoot } from './utilities/findTurboRoot'

const dirname = path.resolve(findTurboRoot(), 'apps', 'payload')
const baseConfig: Config = {
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
      importMapFile: path.resolve(
        dirname,
        'src',
        'app',
        '(payload)',
        'importMap.js'
      )
    },
    avatar: 'gravatar'
  },
  routes: {
    admin: '/'
  },
  collections: [Users, Media, Categories],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || ''
    }
  }),
  sharp,
  plugins
}

export function configurePayload() {
  return buildConfig(baseConfig)
}
