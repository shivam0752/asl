// lib/linkedin.ts
import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

function extractTokenFromUrl(url: string): string | null {
  const hashPart = url.includes('#') ? url.split('#')[1] : '';
  const queryPart = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
  const fragmentParams = new URLSearchParams(hashPart);
  const queryParams = new URLSearchParams(queryPart);

  return (
    fragmentParams.get('provider_token') ??
    fragmentParams.get('access_token') ??
    queryParams.get('provider_token') ??
    queryParams.get('access_token')
  );
}

export async function connectLinkedIn(): Promise<{
    success: boolean;
    error?: string;
    accessToken?: string;
  }> {
    try {
      const redirectUri = Linking.createURL('/');
      
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
  
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
  
      if (result.type === 'success' && result.url) {
        const accessToken = extractTokenFromUrl(result.url);
  
        if (accessToken) {
          return { success: true, accessToken };
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.provider_token) {
          return { success: true, accessToken: session.provider_token };
        }
      }
  
      return { success: false, error: result.type === 'cancel' ? 'Cancelled' : 'Failed to retrieve token' };
    } catch (e: any) {
      console.error('LinkedIn connect error:', e);
      return { success: false, error: e?.message ?? 'LinkedIn connection failed' };
    }
  }

export async function fetchLinkedInProfile(accessToken: string) {
  try {
    const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userinfo = await userinfoRes.json();
    return {
      jobTitle:        userinfo?.headline ?? userinfo?.name ?? 'Professional',
      company:         undefined,
      yearsExperience: 2, // Default fallback
      positionsCount:  1,
      endorsedSkills:  10,
      certifications:  1,
      connections:     200,
    };
  } catch (e) {
    return { jobTitle: 'Professional', yearsExperience: 2 };
  }
}