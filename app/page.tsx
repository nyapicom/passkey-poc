'use client';

import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import styles from './page.module.css';

type MessageType = 'info' | 'success' | 'error';

export default function Home() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('info');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const showMessage = (text: string, type: MessageType = 'info') => {
    setMessage(text);
    setMessageType(type);

    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      showMessage('ユーザー名を入力してください', 'error');
      return;
    }

    try {
      showMessage('パスキーを登録中...', 'info');
      setIsRegistering(true);

      // 登録オプションを取得
      const optionsResponse = await fetch('/api/register/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!optionsResponse.ok) {
        throw new Error('登録開始に失敗しました');
      }

      const options = await optionsResponse.json();

      // WebAuthn APIを使ってクレデンシャルを作成
      const credential = await startRegistration(options);

      // サーバーで検証
      const verificationResponse = await fetch('/api/register/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, credential }),
      });

      if (!verificationResponse.ok) {
        throw new Error('登録の検証に失敗しました');
      }

      const verificationResult = await verificationResponse.json();

      if (verificationResult.verified) {
        showMessage('パスキーの登録が完了しました！', 'success');
        setCurrentUser(username);
      } else {
        throw new Error('検証に失敗しました');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showMessage(`登録エラー: ${error instanceof Error ? error.message : '不明なエラー'}`, 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim()) {
      showMessage('ユーザー名を入力してください', 'error');
      return;
    }

    try {
      showMessage('認証中...', 'info');
      setIsLoggingIn(true);

      // 認証オプションを取得
      const optionsResponse = await fetch('/api/login/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!optionsResponse.ok) {
        throw new Error('ユーザーが見つからないか、パスキーが登録されていません');
      }

      const options = await optionsResponse.json();

      // WebAuthn APIを使って認証
      const credential = await startAuthentication(options);

      // サーバーで検証
      const verificationResponse = await fetch('/api/login/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, credential }),
      });

      if (!verificationResponse.ok) {
        throw new Error('認証の検証に失敗しました');
      }

      const verificationResult = await verificationResponse.json();

      if (verificationResult.verified) {
        showMessage('ログインに成功しました！', 'success');
        setCurrentUser(username);
      } else {
        throw new Error('検証に失敗しました');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      showMessage(`認証エラー: ${error instanceof Error ? error.message : '不明なエラー'}`, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    showMessage('ログアウトしました', 'info');
  };

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <h1 className={styles.title}>🔐 パスキー認証</h1>
        <p className={styles.subtitle}>パスワード不要のセキュアなログイン</p>

        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.label}>
            ユーザー名
          </label>
          <input
            type="text"
            id="username"
            className={styles.input}
            placeholder="ユーザー名を入力"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={currentUser !== null}
            autoComplete="username webauthn"
          />
        </div>

        <button
          className={styles.button}
          onClick={handleRegister}
          disabled={currentUser !== null || isRegistering}
        >
          {isRegistering ? '登録中...' : '新規登録'}
        </button>
        <button
          className={styles.button}
          onClick={handleLogin}
          disabled={currentUser !== null || isLoggingIn}
        >
          {isLoggingIn ? '認証中...' : 'ログイン'}
        </button>

        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>
            {message}
          </div>
        )}

        {currentUser && (
          <div className={styles.status}>
            <h3 className={styles.statusTitle}>ログイン成功!</h3>
            <p className={styles.statusText}>
              <strong className={styles.statusUser}>{currentUser}</strong> としてログインしています
            </p>
            <button className={styles.logoutButton} onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
