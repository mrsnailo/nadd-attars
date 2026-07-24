'use server'

import { revalidatePath } from 'next/cache'

export async function seedDatabase() {
  console.log("Mock seed triggered (will be overwritten by sibling task)");
  revalidatePath('/admin');
  revalidatePath('/');
}
