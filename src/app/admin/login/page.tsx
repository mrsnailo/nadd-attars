import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/admin");
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: "2rem", border: "1px solid #ccc", borderRadius: 8 }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem", textAlign: "center" }}>Admin Login</h1>
      <LoginForm />
    </div>
  );
}
