'use server'

import prisma from '@/lib/prisma'
import { updateTag } from 'next/cache'
import { storeSettingsSchema, type StoreSettingsInput } from '@/lib/validations'
import { requireAdmin } from '@/lib/auth-guard'

export async function updateStoreSettings(data: StoreSettingsInput) {
  await requireAdmin()
  const parsed = storeSettingsSchema.parse(data)
  const settings = await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: parsed,
    create: { id: 'default', ...parsed },
  })
  updateTag('store-settings')
  return settings
}
