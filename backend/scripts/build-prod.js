const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const schemaPath = path.join(__dirname, '../prisma/schema.prisma')
const prodSchemaPath = path.join(__dirname, '../prisma/schema.prod.prisma')

const sqliteSchema = fs.readFileSync(schemaPath, 'utf-8')

const prodSchema = sqliteSchema.replace(
  'provider = "sqlite"',
  'provider = "postgresql"'
)

fs.writeFileSync(prodSchemaPath, prodSchema)
console.log('✅ Production schema created')

const quotedSchemaPath = '"' + prodSchemaPath + '"'
execSync('npx prisma generate --schema=' + quotedSchemaPath, { stdio: 'inherit' })
console.log('✅ Prisma client generated for production')

const distSchemaPath = path.join(__dirname, '../dist/prisma/schema.prisma')
fs.mkdirSync(path.dirname(distSchemaPath), { recursive: true })
fs.copyFileSync(prodSchemaPath, distSchemaPath)
console.log('✅ Schema copied to dist')