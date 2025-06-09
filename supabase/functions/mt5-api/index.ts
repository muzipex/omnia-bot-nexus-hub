
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
      case 'start_auto_trading':
        return handleStartAutoTrading(supabaseClient, user.id, payload)
      case 'stop_auto_trading':
        return handleStopAutoTrading(supabaseClient, user.id)
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

async function callMT5Bridge(endpoint: string, data: any = {}) {
  try {
    const response = await fetch(`http://localhost:8000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`MT5 Bridge error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('MT5 Bridge connection error:', error);
    throw new Error('Cannot connect to MT5 Bridge. Make sure it is running on localhost:8000');
  }
}

async function handleConnect(supabase: any, userId: string, payload: any) {
  const { server, account_number, password } = payload

  try {
    // Connect to MT5 via Python bridge
    const mt5Result = await callMT5Bridge('/connect', {
      server,
      account_number,
      password
    });

    if (!mt5Result.success) {
      throw new Error(mt5Result.error || 'Failed to connect to MT5');
    }

    const accountInfo = mt5Result.account_info;

    // Store account info in database
    const { data, error } = await supabase
      .from('mt5_accounts')
      .upsert({
        user_id: userId,
        account_number,
        server,
        name: accountInfo.name || `Account ${account_number}`,
        company: accountInfo.company || 'Unknown',
        currency: accountInfo.currency || 'USD',
        balance: accountInfo.balance || 0,
        equity: accountInfo.equity || 0,
        margin: accountInfo.margin,
        free_margin: accountInfo.free_margin,
        margin_level: accountInfo.margin_level,
        leverage: accountInfo.leverage,
        is_active: true,
        last_sync: new Date().toISOString()
      })
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, account: data[0] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handlePlaceOrder(supabase: any, userId: string, payload: any) {
  const { symbol, trade_type, volume, price, stop_loss, take_profit, comment, magic_number } = payload

  try {
    // Place order via MT5 bridge
    const mt5Result = await callMT5Bridge('/place_order', {
      symbol,
      trade_type,
      volume,
      price,
      stop_loss,
      take_profit,
      comment,
      magic_number
    });

    if (!mt5Result.success) {
      throw new Error(mt5Result.error || 'Failed to place order');
    }

    const tradeInfo = mt5Result.trade_info;

    // Store trade in database
    const { data, error } = await supabase
      .from('mt5_trades')
      .insert({
        user_id: userId,
        ticket: tradeInfo.ticket,
        symbol,
        trade_type,
        volume,
        open_price: tradeInfo.open_price || price,
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
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleCloseOrder(supabase: any, userId: string, payload: any) {
  const { ticket, close_price, profit } = payload

  try {
    // Close order via MT5 bridge
    const mt5Result = await callMT5Bridge('/close_order', { ticket });

    if (!mt5Result.success) {
      throw new Error(mt5Result.error || 'Failed to close order');
    }

    // Update trade in database
    const { data, error } = await supabase
      .from('mt5_trades')
      .update({
        close_price: mt5Result.close_price || close_price,
        close_time: new Date().toISOString(),
        profit: mt5Result.profit || profit,
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
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleGetAccountInfo(supabase: any, userId: string) {
  try {
    // Get latest account info from MT5 bridge
    const mt5Result = await callMT5Bridge('/account_info');

    if (mt5Result.success && mt5Result.account_info) {
      // Update account in database
      await supabase
        .from('mt5_accounts')
        .update({
          balance: mt5Result.account_info.balance,
          equity: mt5Result.account_info.equity,
          margin: mt5Result.account_info.margin,
          free_margin: mt5Result.account_info.free_margin,
          margin_level: mt5Result.account_info.margin_level,
          last_sync: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_active', true);
    }

    // Get account from database
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
  } catch (error) {
    return new Response(
      JSON.stringify({ account: null, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleGetPositions(supabase: any, userId: string) {
  try {
    // Get positions from MT5 bridge
    const mt5Result = await callMT5Bridge('/positions');

    if (mt5Result.success && mt5Result.positions) {
      // Sync positions with database
      for (const position of mt5Result.positions) {
        await supabase
          .from('mt5_trades')
          .upsert({
            user_id: userId,
            ticket: position.ticket,
            symbol: position.symbol,
            trade_type: position.type,
            volume: position.volume,
            open_price: position.price_open,
            profit: position.profit,
            swap: position.swap,
            comment: position.comment,
            status: 'OPEN'
          }, { onConflict: 'ticket,user_id' });
      }
    }

    // Get positions from database
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
  } catch (error) {
    return new Response(
      JSON.stringify({ positions: [], error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleStartAutoTrading(supabase: any, userId: string, payload: any) {
  try {
    const mt5Result = await callMT5Bridge('/start_auto_trading', payload);

    return new Response(
      JSON.stringify({ success: mt5Result.success, error: mt5Result.error }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleStopAutoTrading(supabase: any, userId: string) {
  try {
    const mt5Result = await callMT5Bridge('/stop_auto_trading');

    return new Response(
      JSON.stringify({ success: mt5Result.success, error: mt5Result.error }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
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
