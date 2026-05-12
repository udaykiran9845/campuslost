'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2 } from 'lucide-react'
import type { ItemCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ItemCategory, string][]

export default function PostForm() {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [type, setType] = useState<'lost' | 'found'>('lost')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ItemCategory>('other')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [dateOccurred, setDateOccurred] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be signed in to post an item.')
      setLoading(false)
      return
    }

    let image_url: string | null = null

    // Upload image if provided
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(path, imageFile)

      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('item-images')
        .getPublicUrl(path)
      image_url = urlData.publicUrl
    }

    const { data: newItem, error: insertError } = await supabase
      .from('items')
      .insert({
        type,
        title: title.trim(),
        category,
        description: description.trim() || null,
        location: location.trim() || null,
        date_occurred: dateOccurred || null,
        image_url,
        posted_by: user.id,
      })
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/items/${newItem.id}?posted=true`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Lost / Found toggle */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          I am posting a…
        </label>
        <div className="flex rounded-xl border border-gray-200 p-1">
          {(['lost', 'found'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                type === t
                  ? t === 'lost'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'lost' ? '🔴 Lost Item' : '🟢 Found Item'}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          What is the item? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Black leather wallet, iPhone 13, College ID card…"
          className="input"
          required
          maxLength={120}
        />
      </div>

      {/* Category */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as ItemCategory)}
          className="input"
        >
          {CATEGORIES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Description
          <span className="ml-1 font-normal text-gray-400">(be specific — colour, brand, contents)</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the item in detail — any distinguishing marks, what's inside, colour, brand…"
          rows={3}
          className="input resize-none"
          maxLength={1000}
        />
      </div>

      {/* Location & Date — side by side on desktop */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Location {type === 'lost' ? 'last seen' : 'where found'}
          </label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Main Library, 2nd Floor"
            className="input"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Date {type === 'lost' ? 'lost' : 'found'}
          </label>
          <input
            type="date"
            value={dateOccurred}
            onChange={e => setDateOccurred(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="input"
          />
        </div>
      </div>

      {/* Image upload */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Photo</label>
        {imagePreview ? (
          <div className="relative inline-block">
            <Image
              src={imagePreview}
              alt="Preview"
              width={200}
              height={150}
              className="rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-8 text-sm text-gray-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
          >
            <Upload size={18} />
            Click to upload a photo (optional, max 5MB)
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Posting…
          </>
        ) : (
          `Post ${type === 'lost' ? 'Lost' : 'Found'} Item`
        )}
      </button>
    </form>
  )
}
