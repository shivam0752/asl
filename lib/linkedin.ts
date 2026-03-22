import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export async function connectLinkedIn(): Promise<{
  success: boolean;
  error?: string;
  accessToken?: string;
}> {
  try {
    const redirectUri = Linking.createURL('/');
    console.log('=== LinkedIn Redirect URI:', redirectUri);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo:          redirectUri,
        scopes:              'openid profile email',
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No OAuth URL returned');

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUri
    );

    console.log('=== LinkedIn browser result type:', result.type);

    if (result.type === 'success' && result.url) {
      const fullUrl  = result.url;
      const fragment = fullUrl.includes('#') ? fullUrl.split('#')[1] : '';
      const query    = fullUrl.includes('?') ? fullUrl.split('?')[1].split('#')[0] : '';
      const params   = new URLSearchParams(fragment || query);

      const accessToken      = params.get('access_token');
      const providerToken    = params.get('provider_token');
      const refreshToken     = params.get('refresh_token');

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
    console.log('=== LinkedIn full error:', e);
    return { success: false, error: e?.message ?? 'LinkedIn connection failed' };
  }
}

export async function fetchLinkedInProfile(accessToken: string): Promise<{
  jobTitle?:       string;
  company?:        string;
  yearsExperience?: number;
  positionsCount?: number;
  endorsedSkills?: number;
  certifications?: number;
  connections?:    number;
}> {
  try {
    console.log('=== Fetching LinkedIn userinfo...');

    const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log('=== userinfo status:', userinfoRes.status);
    const userinfo = await userinfoRes.json();
    console.log('=== userinfo:', JSON.stringify(userinfo));

    return {
      jobTitle:        userinfo?.headline ?? userinfo?.name ?? '',
      company:         undefined,
      yearsExperience: 0,
      positionsCount:  1,
      endorsedSkills:  0,
      certifications:  0,
      connections:     0,
    };
  } catch (e) {
    console.log('=== LinkedIn profile fetch error:', e);
    return {};
  }
}