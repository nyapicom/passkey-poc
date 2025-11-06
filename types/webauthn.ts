export interface User {
  id: string;
  username: string;
  credentials: Credential[];
}

export interface Credential {
  credentialID: Uint8Array;
  credentialPublicKey: Uint8Array;
  counter: number;
}

export interface AuthenticationRequest {
  username: string;
}

export interface RegistrationRequest {
  username: string;
}

export interface RegistrationFinishRequest {
  username: string;
  credential: any;
}

export interface AuthenticationFinishRequest {
  username: string;
  credential: any;
}

export interface VerificationResponse {
  verified: boolean;
  username?: string;
}
