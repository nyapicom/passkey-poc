import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { users, challenges, rpID } from '@/lib/webauthn';
import type { AuthenticationRequest } from '@/types/webauthn';

export async function POST(request: NextRequest) {
  try {
    const body: AuthenticationRequest = await request.json();
    const { username } = body;

    const user = users.get(username);
    if (!user || user.credentials.length === 0) {
      return NextResponse.json(
        { error: 'User not found or no credentials registered' },
        { status: 400 }
      );
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.credentials.map(cred => ({
        id: cred.credentialID,
        type: 'public-key' as const,
      })),
      userVerification: 'preferred',
    });

    challenges.set(username, options.challenge);

    return NextResponse.json(options);
  } catch (error) {
    console.error('Authentication start error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
