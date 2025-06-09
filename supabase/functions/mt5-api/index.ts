
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { action, ...payload } = await req.json()

    switch (action) {
      case 'connect':
        return handleConnect(supabaseClient, user.id, payload)
      case 'place_order':
        return handlePlaceOrder(supabaseClient, user.id, payload)
      case 'close_order':
        return handleCloseOrder(supabaseClient, user.id, payload)
      case 'get_account_info':
        return handleGetAccountInfo(supabaseClient, user.id)
      case 'get_positions':
        return handleGetPositions(supabaseClient, user.id)
      case 'sync_trades':
        return handleSyncTrades(supabaseClient, user.id, payload)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function handleConnect(supabase: any, userId: string, payload: any) {
  const { account_number, server, name, company, currency, balance, equity } = payload

  const { data, error } = await supabase
    .from('mt5_accounts')
    .upsert({
      user_id: userId,
      account_number,
      server,
      name,
      company,
      currency,
      balance,
      equity,
      is_active: true,
      last_sync: new Date().toISOString()
    })
    .select()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, account: data[0] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handlePlaceOrder(supabase: any, userId: string, payload: any) {
  const { symbol, trade_type, volume, price, stop_loss, take_profit, comment, magic_number } = payload

  // Here you would typically make a request to your local MT5 API
  // For now, we'll simulate placing an order and record it
  const ticket = Math.floor(Math.random() * 1000000) + Date.now()

  const { data, error } = await supabase
    .from('mt5_trades')
    .insert({
      user_id: userId,
      ticket,
      symbol,
      trade_type,
      volume,
      open_price: price,
      stop_loss,
      take_profit,
      open_time: new Date().toISOString(),
      comment,
      magic_number,
      status: 'OPEN'
    })
    .select()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, trade: data[0] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCloseOrder(supabase: any, userId: string, payload: any) {
  const { ticket, close_price, profit } = payload

  const { data, error } = await supabase
    .from('mt5_trades')
    .update({
      close_price,
      close_time: new Date().toISOString(),
      profit,
      status: 'CLOSED'
    })
    .eq('ticket', ticket)
    .eq('user_id', userId)
    .select()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, trade: data[0] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetAccountInfo(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('mt5_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_sync', { ascending: false })
    .limit(1)

  if (error) throw error

  return new Response(
    JSON.stringify({ account: data[0] || null }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetPositions(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('mt5_trades')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'OPEN')
    .order('open_time', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify({ positions: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleSyncTrades(supabase: any, userId: string, payload: any) {
  const { trades } = payload

  const { data, error } = await supabase
    .from('mt5_trades')
    .upsert(
      trades.map((trade: any) => ({
        ...trade,
        user_id: userId
      })),
      { onConflict: 'ticket,user_id' }
    )
    .select()

  if (error) throw error

  return new Response(
    JSON.stringify({ success: true, synced: data.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
