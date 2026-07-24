"use client"

import { useActionState } from "react"
import { loginAction } from "./actions"

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(loginAction, undefined)

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
        <input 
          type="email" 
          name="email" 
          id="email" 
          required 
          style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px" }} 
        />
      </div>

      <div>
        <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
        <input 
          type="password" 
          name="password" 
          id="password" 
          required 
          style={{ width: "100%", padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px" }} 
        />
      </div>

      {errorMessage && (
        <div style={{ color: "red", fontSize: "0.875rem" }}>
          {errorMessage}
        </div>
      )}

      <button 
        type="submit" 
        disabled={isPending}
        style={{ 
          marginTop: "1rem", 
          padding: "0.75rem", 
          background: "#000", 
          color: "#D4AF37", 
          border: "none", 
          borderRadius: "4px",
          fontWeight: "bold",
          cursor: isPending ? "not-allowed" : "pointer" 
        }}
      >
        {isPending ? "Logging in..." : "Log In"}
      </button>
    </form>
  )
}
