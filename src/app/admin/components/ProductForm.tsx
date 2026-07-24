'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct, uploadImage, ProductInput } from '@/actions/admin'

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = !!initialData

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    price: initialData?.price?.toString() || '',
    currency: initialData?.currency || 'USD',
    size: initialData?.size || '',
    family: initialData?.family || '',
    stock_count: initialData?.stock_count || 0,
    description: initialData?.description || '',
    subtitle: initialData?.subtitle || '',
    concentration: initialData?.concentration || '',
    origin: initialData?.origin || '',
    extraction: initialData?.extraction || '',
  })
  
  const [images, setImages] = useState<{ entity_type: string; entity_id?: string; blob_url: string; display_order: number; alt_text: string | null }[]>(
    initialData?.images || []
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'stock_count' ? parseInt(value, 10) : value }))
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    try {
      setLoading(true)
      const data = new FormData()
      data.append('file', e.target.files[0])
      const res = await uploadImage(data)
      setImages(prev => [...prev, {
        entity_type: 'product',
        blob_url: res.blob_url,
        display_order: prev.length,
        alt_text: ''
      }])
    } catch (err) {
      console.error(err)
      alert("Failed to upload image")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: ProductInput = {
        ...formData,
        price: formData.price, // Prisma handles string/number correctly via conversion when mapped in API? Wait, the Prisma generated type for Decimal requires a number, string, or Decimal instance.
        images
      } as any

      if (isEditing) {
        await updateProduct(initialData.id, payload)
      } else {
        await createProduct(payload)
      }
      router.push('/admin')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Error saving product')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', marginBottom: '4rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required style={{ padding: '0.5rem', border: '1px solid #ccc' }} />
        <input name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug" required style={{ padding: '0.5rem', border: '1px solid #ccc' }} />
        
        <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price" required style={{ padding: '0.5rem', border: '1px solid #ccc' }} />
        <input name="currency" value={formData.currency} onChange={handleChange} placeholder="Currency (USD)" style={{ padding: '0.5rem', border: '1px solid #ccc' }} />
        
        <input name="size" value={formData.size} onChange={handleChange} placeholder="Size (e.g. 50 ML)" required style={{ padding: '0.5rem', border: '1px solid #ccc' }} />
        <input name="family" value={formData.family} onChange={handleChange} placeholder="Family" required style={{ padding: '0.5rem', border: '1px solid #ccc' }} />
        
        <input name="stock_count" type="number" value={formData.stock_count} onChange={handleChange} placeholder="Stock Count" required style={{ padding: '0.5rem', border: '1px solid #ccc' }} />
        <input name="concentration" value={formData.concentration} onChange={handleChange} placeholder="Concentration" style={{ padding: '0.5rem', border: '1px solid #ccc' }} />
      </div>

      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" rows={4} style={{ padding: '0.5rem', border: '1px solid #ccc' }} />
      <textarea name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="Subtitle" rows={2} style={{ padding: '0.5rem', border: '1px solid #ccc' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <input name="origin" value={formData.origin} onChange={handleChange} placeholder="Origin" style={{ padding: '0.5rem', border: '1px solid #ccc' }} />
        <input name="extraction" value={formData.extraction} onChange={handleChange} placeholder="Extraction" style={{ padding: '0.5rem', border: '1px solid #ccc' }} />
      </div>

      <div style={{ marginTop: '1rem', border: '1px dashed #ccc', padding: '1rem' }}>
        <h3>Images</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '1rem 0' }}>
          {images.map((img, i) => (
            <div key={i} style={{ width: '100px', height: '100px', background: `url(${img.blob_url}) center/cover` }} />
          ))}
        </div>
        <input type="file" accept="image/*" onChange={handleUpload} disabled={loading} />
        {loading && <span>Uploading...</span>}
      </div>

      <button type="submit" disabled={loading} style={{ background: '#D4AF37', color: '#fff', padding: '1rem', fontSize: '1.2rem', cursor: 'pointer', border: 'none' }}>
        {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  )
}
