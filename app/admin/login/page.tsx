"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!credentials.username || !credentials.password) {
      setError("Veuillez remplir tous les champs")
      return
    }

    setIsLoading(true)
    setError("")

    // Simulate authentication
    setTimeout(() => {
      if (credentials.username === "Admin" && credentials.password === "Admin") {
        // Store auth token
        localStorage.setItem("adminToken", "mock-token-123")
        localStorage.setItem("adminUser", credentials.username)
        localStorage.setItem("loginTime", new Date().toISOString())

        router.push("/admin/dashboard")
      } else {
        setError("Identifiants incorrects. Veuillez réessayer.")
        setCredentials((prev) => ({ ...prev, password: "" }))
      }
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1117] to-[#161B22] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-[#161B22] border-[#30363D] shadow-2xl">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">🔐</div>
            <CardTitle className="text-[#2FD771] text-2xl font-bold">Admin Panel</CardTitle>
            <p className="text-[#C9D1D9]">Connectez-vous pour accéder au tableau de bord administrateur</p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-lg mb-4 text-sm font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#2FD771] font-semibold mb-2">Nom d'utilisateur</label>
                <Input
                  placeholder="Entrez votre nom d'utilisateur"
                  value={credentials.username}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                  className="bg-[#21262D] border-[#30363D] text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[#2FD771] font-semibold mb-2">Mot de passe</label>
                <Input
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  className="bg-[#21262D] border-[#30363D] text-white"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117] hover:opacity-90 font-bold"
              >
                {isLoading ? "⏳ Connexion..." : "🚀 Se connecter"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <Link href="/" className="text-[#7D8590] hover:text-[#2FD771] text-sm transition-colors">
                ← Retour au site
              </Link>
            </div>

            <Card className="bg-[#21262D] border-[#30363D] mt-6">
              <CardContent className="p-4">
                <h3 className="text-[#2FD771] font-semibold text-sm mb-2">🔑 Identifiants par défaut :</h3>
                <p className="text-[#C9D1D9] text-xs">
                  <strong>Utilisateur :</strong> Admin
                </p>
                <p className="text-[#C9D1D9] text-xs">
                  <strong>Mot de passe :</strong> Admin
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
