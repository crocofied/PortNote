"use client";

import { useEffect, useState } from "react"
import axios from "axios";
import ErrorToast from "@/components/Error";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter();

  const login = async () => {
    if (!username || !password) {
      setError("Please enter both email and password")
      setShowError(true)
      return
    }

    try {
      const response = await axios.post("/api/auth/login", { username, password })
      const { token } = response.data

      Cookies.set("token", token, {expires: 7})

      router.push("/dash")
    } catch (error: any) {
      setError(error.response?.data?.error || "Login failed. Please try again.")
      setShowError(true)
    }
  }

  useEffect(() => {
    if(Cookies.get("token")){
      router.push("/dash")
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold">PortNote</h1>
      </div>

      <div className="w-full max-w-md" aria-label="Login Form">
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-8">
          <legend className="fieldset-legend text-xl font-bold px-4" aria-label="Login">Login</legend>

          <div className="space-y-6">
            <div>
              <label className="label font-medium" aria-label="Username">
                <span className="label-text text-base">Username</span>
              </label>
              <input type="email" className="input input-bordered w-full" placeholder="Enter your username" onChange={(e) => setUsername(e.target.value)} aria-label="Username"/>
            </div>

            <div>
              <label className="label font-medium" aria-label="Password">
                <span className="label-text text-base">Password</span>
              </label>
              <input type="password" className="input input-bordered w-full" placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} aria-label="Password"/>
            </div>
            <button className="btn btn-neutral w-full" onClick={login} aria-label="Login">Login</button>
          </div>
        </fieldset>
      </div>
      <ErrorToast
        message={error}
        show={showError}
        onClose={() => setShowError(false)}
      />
    </div>
  )
}
