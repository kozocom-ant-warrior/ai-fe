'use client';

import React from 'react';
import { AuthProvider as OidcAuthProvider } from 'react-oidc-context';

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_BXDk3dhbU",
  client_id: "40d5q9prdkl811tenqkj1b9uvs",
  redirect_uri: "https://d84l1y8p4kdic.cloudfront.net",
  response_type: "code" as const,
  scope: "phone openid email",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <OidcAuthProvider {...cognitoAuthConfig}>
      {children}
    </OidcAuthProvider>
  );
}

