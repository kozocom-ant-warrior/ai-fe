import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Lấy access token từ Amplify session
 * @returns Promise<string | null> Access token hoặc null nếu không có
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

