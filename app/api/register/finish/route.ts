import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { users, challenges, origin, rpID } from '@/lib/webauthn';
import type { RegistrationFinishRequest } from '@/types/webauthn';

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationFinishRequest = await request.json();
    const { username, credential } = body;

    const user = users.get(username);
    const expectedChallenge = challenges.get(username);

    if (!user || !expectedChallenge) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      // クレデンシャルを保存
      user.credentials.push({
        credentialID,
        credentialPublicKey,
        counter,
      });

      challenges.delete(username);

      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Registration finish error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
