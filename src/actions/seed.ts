'use server'

import { PrismaClient } from '@prisma/client'
import { updateTag, revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function seedDatabase() {
  // --- Admin User ---
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@nadd.local' }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@nadd.local',
        password: hashedPassword,
        role: 'admin'
      }
    })
    console.log('Created default admin user: admin@nadd.local / admin123')
  }

  const count = await prisma.product.count()
  
  if (count > 0) {
    console.log('Database already populated')
    return
  }

  // --- Product 1: Oud Sultan ---
  const p1 = await prisma.product.create({
    data: {
      slug: 'oud-sultan',
      name: 'Oud Sultan',
      price: 250.00,
      size: '3ml',
      family: 'Woody / Oriental',
      stock_count: 15,
      description: 'A majestic distillation of wild-harvested agarwood. Deep, resonant, and unapologetically rich with hints of smoke and damp earth.',
      subtitle: 'The King of Woods',
      concentration: 'Pure Attar',
      origin: 'Assam, India',
      extraction: 'Hydro-distillation',
      batch_no: 'B29-OUD',
      aged_time: '12 Years',
      ingredients: '100% Pure Agarwood Oil',
      how_to_wear_instructions: 'Apply a single swipe to pulse points. Do not rub.',
      shipping_rules: 'Ships worldwide via DHL Express. Requires signature.',
      notes: {
        create: [
          { time: 'Opening', tag: 'Smoky', notes: 'Campfire, dark leather, raw earth', description: 'Starts with a bold, smoky profile that immediately commands attention.' },
          { time: 'Heart', tag: 'Woody', notes: 'Aged mahogany, damp soil, subtle spice', description: 'Mellows into a rich, deep woody core that feels ancient and grounded.' },
          { time: 'Drydown', tag: 'Sweet', notes: 'Warm amber, soft musk, honeyed wood', description: 'Leaves a lingering, sweet woody warmth on the skin for hours.' }
        ]
      },
      metrics: {
        create: {
          longevity: '12+ Hours',
          sillage: 'Strong',
          intensity: 'High',
          best_in: 'Winter / Night'
        }
      }
    }
  })

  await prisma.images.createMany({
    data: [
      { productId: p1.id, entity_type: 'product', entity_id: p1.id, blob_url: 'https://images.unsplash.com/photo-1608500218890-c4e1adfb7991?q=80&w=600&auto=format&fit=crop', display_order: 1, alt_text: 'Oud Sultan Bottle' },
      { productId: p1.id, entity_type: 'product', entity_id: p1.id, blob_url: 'https://images.unsplash.com/photo-1629198688000-71f23e7456c7?q=80&w=600&auto=format&fit=crop', display_order: 2, alt_text: 'Oud Sultan Box' }
    ]
  })

  // --- Product 2: Rose Taif ---
  const p2 = await prisma.product.create({
    data: {
      slug: 'rose-taifi',
      name: 'Rose Taifi',
      price: 180.00,
      size: '3ml',
      family: 'Floral',
      stock_count: 5,
      description: 'Harvested from the cool mountains of Taif, Saudi Arabia. This is a bright, sharp, and intensely euphoric rose attar, undiluted and pure.',
      subtitle: 'The Desert Bloom',
      concentration: 'Pure Attar',
      origin: 'Taif, Saudi Arabia',
      extraction: 'Steam Distillation',
      batch_no: 'RT-2023',
      aged_time: '2 Years',
      ingredients: 'Pure Rosa Damascena Extract',
      how_to_wear_instructions: 'Apply lightly to wrists and neck.',
      shipping_rules: 'Ships worldwide.',
      notes: {
        create: [
          { time: 'Opening', tag: 'Fresh', notes: 'Dewy petals, green stems, sharp citrus', description: 'A burst of fresh, green rose that feels like a morning garden.' },
          { time: 'Heart', tag: 'Floral', notes: 'Intense rose, slight spice, honey', description: 'The absolute core of the Taif rose, rich and unapologetic.' },
          { time: 'Drydown', tag: 'Powdery', notes: 'Soft musk, dried petals', description: 'Fades into a soft, romantic powdery finish.' }
        ]
      },
      metrics: {
        create: {
          longevity: '8 Hours',
          sillage: 'Moderate',
          intensity: 'Medium',
          best_in: 'Spring / Day'
        }
      }
    }
  })

  await prisma.images.createMany({
    data: [
      { productId: p2.id, entity_type: 'product', entity_id: p2.id,  blob_url: 'https://images.unsplash.com/photo-1615397323136-1e0e7a2b0cb0?q=80&w=600&auto=format&fit=crop', display_order: 1, alt_text: 'Rose Taifi Bottle' }
    ]
  })

  // --- Product 3: Amber Royale ---
  const p3 = await prisma.product.create({
    data: {
      slug: 'amber-royale',
      name: 'Amber Royale',
      price: 120.00,
      size: '6ml',
      family: 'Oriental',
      stock_count: 20,
      description: 'A classic rich amber, beautifully balanced with labdanum and vanilla. A welcoming, comforting scent that wraps you in a golden aura.',
      subtitle: 'Golden Warmth',
      concentration: 'Attar Blend',
      origin: 'Grasse, France',
      extraction: 'Solvent Extraction & Blending',
      batch_no: 'AMB-01',
      aged_time: '6 Months',
      ingredients: 'Labdanum, Vanilla Extract, Sandalwood Oil',
      how_to_wear_instructions: 'Suitable for daily wear anywhere on the body.',
      shipping_rules: 'Standard shipping globally.',
      notes: {
        create: [
          { time: 'Opening', tag: 'Sweet', notes: 'Vanilla, caramel, soft spice', description: 'Instantly warm and inviting.' },
          { time: 'Heart', tag: 'Resinous', notes: 'Labdanum, benzoin, dark honey', description: 'The true amber accord shines through brightly.' },
          { time: 'Drydown', tag: 'Woody', notes: 'Sandalwood, rich musk', description: 'A smooth, satisfying, woody conclusion.' }
        ]
      },
      metrics: {
        create: {
          longevity: '10 Hours',
          sillage: 'Heavy',
          intensity: 'High',
          best_in: 'Autumn / Evening'
        }
      }
    }
  })

  await prisma.images.createMany({
    data: [
      { productId: p3.id, entity_type: 'product', entity_id: p3.id, blob_url: 'https://images.unsplash.com/photo-1595514535311-66774e1e7fdd?q=80&w=600&auto=format&fit=crop', display_order: 1, alt_text: 'Amber Royale Perfume' }
    ]
  })

  updateTag('products')
  revalidatePath('/admin')
  revalidatePath('/')
}
