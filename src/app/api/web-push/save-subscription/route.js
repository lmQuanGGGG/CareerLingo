import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req) {
  try {
    const { subscription, userId } = await req.json();

    if (!subscription || !userId) {
      return NextResponse.json({ error: 'Missing subscription or userId' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials in env' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user's current subscriptions
    const { data: user, error: fetchError } = await supabase
      .from('user_progress')
      .select('push_subscriptions')
      .eq('id', userId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    let subs = user?.push_subscriptions || [];
    if (!Array.isArray(subs)) subs = [];

    // Check if this subscription already exists
    const exists = subs.some(sub => sub.endpoint === subscription.endpoint);
    
    if (!exists) {
      subs.push(subscription);
      
      const { error: updateError } = await supabase
        .from('user_progress')
        .update({ push_subscriptions: subs })
        .eq('id', userId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Subscription saved' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
