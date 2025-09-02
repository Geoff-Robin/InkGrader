"use client"

import { useState, createContext, useEffect, ReactNode, Dispatch, SetStateAction } from "react"

type AuthContextType = {
  accessToken: string | null
  setAccessToken: Dispatch<SetStateAction<string | null>>
  refreshToken: string | null
  setRefreshToken: Dispatch<SetStateAction<string | null>>
}

// Create context with correct typing
export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  refreshToken: null,
  setRefreshToken: () => {},
})

type AuthContextProviderProps = {
  children: ReactNode
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const savedAccessToken = sessionStorage.getItem("accessToken")
      return savedAccessToken ? savedAccessToken : null
    }
    return null
  })

  const [refreshToken, setRefreshToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const savedRefreshToken = sessionStorage.getItem("refreshToken")
      return savedRefreshToken ? savedRefreshToken : null
    }
    return null
  })

  useEffect(() => {
    if (accessToken) {
      sessionStorage.setItem("accessToken", accessToken)
    } else {
      sessionStorage.removeItem("accessToken")
    }
  }, [accessToken])

  useEffect(() => {
    if (refreshToken) {
      sessionStorage.setItem("refreshToken", refreshToken)
    } else {
      sessionStorage.removeItem("refreshToken")
    }
  }, [refreshToken])

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        refreshToken,
        setRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
