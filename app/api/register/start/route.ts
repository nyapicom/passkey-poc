import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { users, challenges, rpName, rpID } from '@/lib/webauthn';
import type { RegistrationRequest } from '@/types/webauthn';

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationRequest = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // ユーザーIDを生成（既存ユーザーの場合は既存のIDを使用）
    let user = users.get(username);
    if (!user) {
      user = {
        id: Buffer.from(username).toString('base64url'),
        username,
        credentials: [],
      };
      users.set(username, user);
    }

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: user.id,
      userName: username,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // チャレンジを保存
    challenges.set(username, options.challenge);

    return NextResponse.json(options);
  } catch (error) {
    console.error('Registration start error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
