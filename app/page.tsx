"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Stats = {
  totalContacts: number
  objectif: number
  recentEntries: number
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // champs form pou ajoute contact
  const [nom, setNom] = useState("")
  const [codePays, setCodePays] = useState("")
  const [numero, setNumero] = useState("")

  // Charger stats yo
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats")
        if (!res.ok) throw new Error("Erreur lors du chargement des stats")
        const data = await res.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  // Ajouter contact
  const handleSaveContact = async () => {
    if (!nom || !codePays || !numero) {
      alert("Tanpri ranpli tout chan yo")
      return
    }
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, codePays, numero }),
      })
      if (!res.ok) throw new Error("Erreur reseaux")
      alert("Kontak anrejistre avèk siksè ✅")
      setNom("")
      setCodePays("")
      setNumero("")
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? "Chargement..." : error ? error : stats?.totalContacts ?? 0}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objectif (%)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? "Chargement..." : error ? error : stats?.objectif ?? 0} %
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entrées Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? "Chargement..." : error ? error : stats?.recentEntries ?? 0}
          </CardContent>
        </Card>
      </div>

      {/* Form pou ajoute kontak */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Contact</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Input
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
          <Input
            placeholder="Code Pays (ex: +509)"
            value={codePays}
            onChange={(e) => setCodePays(e.target.value)}
          />
          <Input
            placeholder="Numéro"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
          />
          <Button onClick={handleSaveContact}>Enregistrer</Button>
        </CardContent>
      </Card>
    </div>
  )
}
