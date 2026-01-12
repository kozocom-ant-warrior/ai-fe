const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
      userPoolClientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      region: process.env.NEXT_PUBLIC_REGION,
      domain: process.env.NEXT_PUBLIC_DOMAIN,
      loginWith: {
        email: true,
        password: true,
      },
    },
  },
};

export default amplifyConfig;

