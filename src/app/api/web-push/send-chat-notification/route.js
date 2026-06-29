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

export async function POST(req) {
  try {
    const body = await req.json();
    const { receiverId, senderName, content } = body;

    if (!receiverId || !senderName || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch receiver's push subscriptions
    const { data: user, error } = await supabase
      .from('user_progress')
      .select('push_subscriptions')
      .eq('id', receiverId)
      .single();

    if (error || !user || !user.push_subscriptions || user.push_subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'Receiver has no push subscriptions' });
    }

    // Format content for Vocab Cards
    const displayContent = content.startsWith('[VOCAB_CARD]') ? 'Đã chia sẻ một từ vựng' : content;

    const payload = JSON.stringify({
      title: `${senderName} vừa nhắn tin cho bạn`,
      body: displayContent,
      url: '/'
    });

    let successCount = 0;
    let failCount = 0;
    const activeSubscriptions = [];

    for (const sub of user.push_subscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
        successCount++;
        activeSubscriptions.push(sub); // Keep active ones
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log('Subscription expired or removed');
          failCount++;
        } else {
          console.error('Push error:', err);
          activeSubscriptions.push(sub); // Keep it if it's a temporary error
        }
      }
    }

    // Clean up expired subscriptions if needed
    if (failCount > 0 && activeSubscriptions.length !== user.push_subscriptions.length) {
      await supabase
        .from('user_progress')
        .update({ push_subscriptions: activeSubscriptions })
        .eq('id', receiverId);
    }

    return NextResponse.json({ success: true, message: `Sent ${successCount} chat notifications` });
  } catch (error) {
    console.error('Error sending chat push:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
