"use client";

import { createContext, useState, useEffect, ReactNode } from "react";

// Context value type
interface AuthContextType {
  interests: string[] | null;
  setInterests: (interests: string[] | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  refreshToken: string | null;
  setRefreshToken: (token: string | null) => void;
}

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Create context
export const AuthContext = createContext<AuthContextType>({
  interests: null,
  setInterests: () => {},
  accessToken: null,
  setAccessToken: () => {},
  refreshToken: null,
  setRefreshToken: () => {},
});

// Provider component
export function AuthContextProvider({ children }: AuthProviderProps) {
  const [interests, setInterests] = useState<string[] | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Load from sessionStorage on client
  useEffect(() => {
    const savedInterests = sessionStorage.getItem("interests");
    if (savedInterests) setInterests(JSON.parse(savedInterests));

    const savedAccessToken = sessionStorage.getItem("accessToken");
    if (savedAccessToken) setAccessToken(savedAccessToken);

    const savedRefreshToken = sessionStorage.getItem("refreshToken");
    if (savedRefreshToken) setRefreshToken(savedRefreshToken);
  }, []);

  // Save interests
  useEffect(() => {
    if (interests) sessionStorage.setItem("interests", JSON.stringify(interests));
    else sessionStorage.removeItem("interests");
  }, [interests]);

  // Save accessToken
  useEffect(() => {
    if (accessToken) sessionStorage.setItem("accessToken", accessToken);
    else sessionStorage.removeItem("accessToken");
  }, [accessToken]);

  // Save refreshToken
  useEffect(() => {
    if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
    else sessionStorage.removeItem("refreshToken");
  }, [refreshToken]);

  return (
    <AuthContext.Provider
      value={{
        interests,
        setInterests,
        accessToken,
        setAccessToken,
        refreshToken,
        setRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
