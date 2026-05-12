export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PostForm from '@/components/PostForm'

export default async function PostPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/post')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Post an Item</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in as many details as possible — better descriptions lead to faster matches.
        </p>
      </div>

      <div className="card p-6">
        <PostForm />
      </div>
    </div>
  )
}
