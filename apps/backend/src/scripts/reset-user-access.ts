import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'

type AllowedRole = 'ADMIN' | 'MANAGER' | 'BARTENDER' | 'CHEF'

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`
  const arg = process.argv.find((item) => item.startsWith(prefix))
  if (!arg) return undefined
  return arg.slice(prefix.length).trim()
}

function printUsageAndExit(): never {
  console.error('Uso: npm run reset:user -- --email=<email> --password=<novaSenha> [--role=ADMIN|MANAGER|BARTENDER|CHEF]')
  process.exit(1)
}

function parseRole(rawRole?: string): AllowedRole | undefined {
  if (!rawRole) return undefined

  const normalized = rawRole.trim().toUpperCase()
  const validRoles: AllowedRole[] = ['ADMIN', 'MANAGER', 'BARTENDER', 'CHEF']

  if (!validRoles.includes(normalized as AllowedRole)) {
    console.error(`Role invalida: ${rawRole}`)
    console.error(`Roles permitidas: ${validRoles.join(', ')}`)
    process.exit(1)
  }

  return normalized as AllowedRole
}

async function main() {
  const email = getArg('email')
  const password = getArg('password')
  const role = parseRole(getArg('role'))

  if (!email || !password) {
    printUsageAndExit()
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`Usuario nao encontrado para o email: ${email}`)
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: passwordHash,
      ...(role ? { role } : {})
    }
  })

  console.log('Acesso atualizado com sucesso:')
  console.log(`- email: ${email}`)
  console.log(`- role: ${role ?? user.role}`)
  console.log('- senha: redefinida')
}

main()
  .catch((error) => {
    console.error('Falha ao atualizar acesso:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
