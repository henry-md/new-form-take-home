import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

// We only really need to change globalThis in dev, because in prod anything outside module
// exports ("top level code") are cached for all api calls (until the warm instance goes idle for too long)
if (process.env.NODE_ENV !== 'production'){
  globalThis.prisma = prisma
}
