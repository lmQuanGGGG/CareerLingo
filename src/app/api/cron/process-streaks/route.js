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
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'careerlingo-cron'}`) {
      // In production, ensure this is protected
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date();
    
    // Vercel Cron runs in UTC, but we calculate based on UTC+7 (Vietnam time)
    // When cron runs at 17:01 UTC, it is 00:01 in Vietnam (next day)
    const vnTime = new Date(today.getTime() + (7 * 60 * 60 * 1000));
    const vnTodayStr = vnTime.toISOString().split('T')[0];
    
    // Yesterday in VN time
    const yesterday = new Date(vnTime.getTime() - (24 * 60 * 60 * 1000));
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Fetch all users who have a streak
    const { data: allUsers, error } = await supabase
      .from('user_progress')
      .select('id, xp, streak, last_active_date, push_subscriptions')
      .gt('streak', 0); 

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let savedCount = 0;
    let lostCount = 0;
    let failureCount = 0;

    for (const user of (allUsers || [])) {
      if (!user.last_active_date) continue;
      
      const lastDateObj = new Date(user.last_active_date);
      const todayDateObj = new Date(vnTodayStr);
      const diffTime = Math.abs(todayDateObj - lastDateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If diffDays >= 2, they missed yesterday or more
      if (diffDays >= 2) {
        const missedDays = diffDays - 1;
        const cost = missedDays * 50;

        let payload = null;
        let updateData = {};

        if (user.xp >= cost) {
          // Save Streak
          updateData = {
            xp: user.xp - cost,
            last_active_date: yesterdayStr // Bridge the gap so it doesn't trigger again tomorrow if they study today
          };
          payload = JSON.stringify({
            title: 'Chuỗi học tập đã được cứu! 🛡️',
            body: `Hệ thống đã dùng ${cost} XP để bảo vệ Streak của bạn sau khi bạn bỏ lỡ ${missedDays} ngày.`,
            url: '/'
          });
          savedCount++;
        } else {
          // Lose Streak
          updateData = {
            streak: 0,
            last_active_date: yesterdayStr
          };
          payload = JSON.stringify({
            title: 'Chuỗi học tập đã đứt! 💔',
            body: `Bạn đã mất chuỗi ${user.streak} ngày vì quên học và không đủ XP để cứu. Bắt đầu lại từ hôm nay nhé!`,
            url: '/'
          });
          lostCount++;
        }

        // Update DB
        await supabase.from('user_progress').update(updateData).eq('id', user.id);

        // Send Notification
        const subs = user.push_subscriptions;
        if (Array.isArray(subs) && subs.length > 0) {
          let validSubs = [];
          let subsChanged = false;

          for (const sub of subs) {
            try {
              await webpush.sendNotification(sub, payload);
              validSubs.push(sub);
            } catch (err) {
              if (err.statusCode === 404 || err.statusCode === 410) {
                subsChanged = true;
                failureCount++;
              } else {
                validSubs.push(sub);
              }
            }
          }

          if (subsChanged) {
            await supabase
              .from('user_progress')
              .update({ push_subscriptions: validSubs })
              .eq('id', user.id);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      saved_streaks: savedCount,
      lost_streaks: lostCount,
      failed_subs: failureCount
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
