"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContext, useState } from "react"
import { AuthContext } from "@/lib/authContext"
import { axiosInstance } from "@/axios"
import { useRouter } from "next/navigation"
import { Alert,AlertDescription } from "./ui/alert"

export function RegisterForm() {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setRefreshToken, setAccessToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleRegister = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true);
    try{
      const response = await axiosInstance.post('/api/auth/register',{
        username,
        email,
        password
      })
      const {access_token,refresh_token} = response.data;
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      router.push('/dashboard');
    }catch(err: any){
      const message = err.response?.data?.message || err.message || "Something went wrong";
      setError(message);
    }finally{
      setLoading(false)
    }

  }
  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email and username below to create a new account
        </p>
      </div>
      {error && (<Alert variant="destructive">
              <AlertDescription>Error: {error}</AlertDescription>
            </Alert>)}
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Log in
        </a>
      </div>
    </form>
  )
}
