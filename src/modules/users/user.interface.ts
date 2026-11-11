export interface RegisterUserPayload{
    name: string;
    email: string;
    password: string;
    profilePhoto?: string;
}

export interface UpdateStatusPayload {
  isBanned: boolean;
}
