import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: assets, error: assetsError } = await supabase
    .from('portfolio_assets')
    .select('asset_type, label, value, source')
    .eq('user_id', userId)
    .order('value', { ascending: false })

  if (assetsError) {
    return NextResponse.json({ error: assetsError.message }, { status: 500 })
  }

  const total = (assets ?? []).reduce((sum, item) => sum + Number(item.value), 0)

  const breakdown = (assets ?? []).map((item) => ({
    type: item.asset_type,
    label: item.label,
    value: Number(item.value),
    source: item.source,
  }))

  return NextResponse.json({
    total,
    breakdown,
  })
}