import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
].join(' ');

export async function connectGoogleFit(): Promise<{
  success: boolean;
  error?: string;
  accessToken?: string;
}> {
  try {
    const redirectUri = Linking.createURL('/');
    console.log('=== Google Fit Redirect URI:', redirectUri);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:          redirectUri,
        scopes:              GOOGLE_FIT_SCOPES,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt:      'consent',
        },
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No OAuth URL returned');

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUri
    );

    console.log('=== Google Fit browser result type:', result.type);

    if (result.type === 'success' && result.url) {
      const fullUrl  = result.url;
      const fragment = fullUrl.includes('#') ? fullUrl.split('#')[1] : '';
      const query    = fullUrl.includes('?') ? fullUrl.split('?')[1].split('#')[0] : '';
      const params   = new URLSearchParams(fragment || query);

      const accessToken   = params.get('access_token');
      const providerToken = params.get('provider_token');
      const refreshToken  = params.get('refresh_token');

      console.log('=== Access token exists:', !!accessToken);
      console.log('=== Provider token exists:', !!providerToken);

      if (accessToken) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token:  accessToken,
            refresh_token: refreshToken ?? '',
          });

        console.log('=== Session set:', sessionData?.session?.user?.email);
        console.log('=== Session error:', sessionError?.message);

        if (sessionData?.session) {
          return {
            success:     true,
            accessToken: providerToken ?? accessToken,
          };
        }
      }

      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession?.session) {
        return {
          success:     true,
          accessToken: currentSession.session.provider_token ?? undefined,
        };
      }
    }

    if (result.type === 'cancel') {
      return { success: false, error: 'Connection cancelled' };
    }

    return { success: false, error: 'Connection failed — type: ' + result.type };

  } catch (e: any) {
    console.log('=== Google Fit full error:', e);
    return { success: false, error: e?.message ?? 'Google Fit connection failed' };
  }
}

export async function fetchGoogleFitData(accessToken: string): Promise<{
  avgDailySteps:   number;
  avgSleepHours:   number;
  avgHeartRate:    number;
  weeklyWorkouts:  number;
  activeMinutes:   number;
}> {
  try {
    const now           = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const response = await fetch(
      'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregateBy: [
            { dataTypeName: 'com.google.step_count.delta'  },
            { dataTypeName: 'com.google.active_minutes'    },
            { dataTypeName: 'com.google.heart_rate.bpm'    },
            { dataTypeName: 'com.google.sleep.segment'     },
          ],
          bucketByTime:    { durationMillis: 86400000 },
          startTimeMillis: thirtyDaysAgo,
          endTimeMillis:   now,
        }),
      }
    );

    const data    = await response.json();
    const buckets = data?.bucket ?? [];

    console.log('=== Google Fit buckets count:', buckets.length);

    let totalSteps      = 0;
    let totalActiveMin  = 0;
    let totalHeartRate  = 0;
    let heartRateCount  = 0;
    let workoutDays     = 0;
    let totalSleepHours = 0;
    let sleepDays       = 0;
    const dayCount      = buckets.length || 1;

    buckets.forEach((bucket: any) => {
      bucket.dataset?.forEach((dataset: any) => {
        dataset.point?.forEach((point: any) => {
          const type = dataset.dataSourceId ?? '';
          if (type.includes('step_count')) {
            totalSteps += point.value?.[0]?.intVal ?? 0;
          }
          if (type.includes('active_minutes')) {
            const mins = point.value?.[0]?.intVal ?? 0;
            totalActiveMin += mins;
            if (mins > 20) workoutDays++;
          }
          if (type.includes('heart_rate')) {
            totalHeartRate += point.value?.[0]?.fpVal ?? 0;
            heartRateCount++;
          }
          if (type.includes('sleep')) {
            if (point.value?.[0]?.intVal === 72) {
              const durationMs =
                parseInt(point.endTimeNanos) / 1e6 -
                parseInt(point.startTimeNanos) / 1e6;
              totalSleepHours += durationMs / (1000 * 60 * 60);
              sleepDays++;
            }
          }
        });
      });
    });

    const result = {
      avgDailySteps:  Math.round(totalSteps / dayCount),
      avgSleepHours:  sleepDays > 0 ? Math.round(totalSleepHours / sleepDays) : 7,
      avgHeartRate:   heartRateCount > 0 ? Math.round(totalHeartRate / heartRateCount) : 70,
      weeklyWorkouts: Math.round((workoutDays / dayCount) * 7),
      activeMinutes:  Math.round(totalActiveMin / dayCount),
    };

    console.log('=== Google Fit result:', JSON.stringify(result));
    return result;

  } catch (e) {
    console.log('=== Google Fit fetch error:', e);
    return {
      avgDailySteps:  7000,
      avgSleepHours:  7,
      avgHeartRate:   70,
      weeklyWorkouts: 3,
      activeMinutes:  30,
    };
  }
}