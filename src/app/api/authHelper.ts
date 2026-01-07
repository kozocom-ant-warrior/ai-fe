import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Get access token from Amplify session
 * @returns Promise<string | null> Access token or null if not available
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() || null;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

