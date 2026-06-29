import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:support@careerlingo.com',
    vapidPublicKey,
    vapidPrivateKey
  );
}

export async function GET(req) {
  try {
    // Basic auth to prevent abuse of the cron endpoint (optional)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'careerlingo-cron'}`) {
      // In production, ensure this is protected
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date().toISOString().split('T')[0];

    // Find users who haven't learned today and have push subscriptions
    const { data: users, error } = await supabase
      .from('user_progress')
      .select('id, display_name, last_active_date, push_subscriptions')
      .neq('last_active_date', today)
      .not('push_subscriptions', 'eq', '[]'); // JSON '[]'

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ success: true, message: 'No users to notify' });
    }

    let successCount = 0;
    let failureCount = 0;

    const payload = JSON.stringify({
      title: 'Đã đến giờ học rồi! ⏰',
      body: 'Bạn chưa hoàn thành bài học hôm nay. Vào học ngay để giữ Streak nhé!',
      url: '/'
    });

    for (const user of users) {
      const subs = user.push_subscriptions;
      if (!Array.isArray(subs)) continue;

      let validSubs = [];
      let subsChanged = false;

      for (const sub of subs) {
        try {
          await webpush.sendNotification(sub, payload);
          validSubs.push(sub);
          successCount++;
        } catch (err) {
          // If the subscription is no longer valid (e.g. user revoked permission)
          if (err.statusCode === 404 || err.statusCode === 410) {
            subsChanged = true;
            failureCount++;
          } else {
            validSubs.push(sub);
          }
        }
      }

      // Cleanup expired subscriptions
      if (subsChanged) {
        await supabase
          .from('user_progress')
          .update({ push_subscriptions: validSubs })
          .eq('id', user.id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      sent: successCount, 
      failed_and_removed: failureCount 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
