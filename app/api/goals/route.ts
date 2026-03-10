import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const {
    user_id,
    name,
    description,
    category,
    target_amount,
    current_amount,
    deadline,
    priority,
    status,
  } = body

  if (!user_id || !name || !category || target_amount == null) {
    return NextResponse.json(
      { error: 'user_id, name, category, and target_amount are required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id,
      name,
      description: description ?? null,
      category,
      target_amount,
      current_amount: current_amount ?? 0,
      deadline: deadline ?? null,
      priority: priority ?? 'medium',
      status: status ?? 'active',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}