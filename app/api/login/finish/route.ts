import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { users, challenges, origin, rpID } from '@/lib/webauthn';
import type { AuthenticationFinishRequest } from '@/types/webauthn';

export async function POST(request: NextRequest) {
  try {
    const body: AuthenticationFinishRequest = await request.json();
    const { username, credential } = body;

    const user = users.get(username);
    const expectedChallenge = challenges.get(username);

    if (!user || !expectedChallenge) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // 使用されたクレデンシャルを探す
    const credentialID = credential.id;
    const userCredential = user.credentials.find(
      cred => Buffer.from(cred.credentialID).toString('base64url') === credentialID
    );

    if (!userCredential) {
      return NextResponse.json(
        { error: 'Credential not found' },
        { status: 400 }
      );
    }

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: userCredential.credentialID,
        credentialPublicKey: userCredential.credentialPublicKey,
        counter: userCredential.counter,
      },
    });

    if (verification.verified) {
      // カウンターを更新
      userCredential.counter = verification.authenticationInfo.newCounter;

      challenges.delete(username);

      return NextResponse.json({ verified: true, username });
    } else {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Authentication finish error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
