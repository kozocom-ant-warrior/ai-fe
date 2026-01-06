const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || 'ap-southeast-1_BXDk3dhbU',
      userPoolClientId: process.env.NEXT_PUBLIC_CLIENT_ID || '40d5q9prdkl811tenqkj1b9uvs',
      region: process.env.NEXT_PUBLIC_REGION || 'ap-southeast-1',
      domain: process.env.NEXT_PUBLIC_DOMAIN || '',
      loginWith: {
        email: true,
        password: true,
      },
    },
  },
};

export default amplifyConfig;

