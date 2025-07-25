"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import type { Contact } from "@/lib/types"

const countries = [
  { code: "+509", flag: "🇭🇹", name: "Haïti" },
  { code: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "+1", flag: "🇺🇸", name: "États-Unis" },
  { code: "+33", flag: "🇫🇷", name: "France" },
]

export default function RecherchePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Contact[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [editForm, setEditForm] = useState({ nom: "", codePays: "", numero: "" })
  const [message, setMessage] = useState({ type: "", content: "" })

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setMessage({ type: "error", content: "Veuillez entrer un nom ou un numéro à rechercher" })
      return
    }

    setIsSearching(true)
    setMessage({ type: "", content: "" })

    const response = await apiClient.searchContacts(searchTerm)

    if (response.success && response.data) {
      setSearchResults(response.data)
      setShowResults(true)
    } else {
      setMessage({ type: "error", content: response.error || "Erreur lors de la recherche" })
    }

    setIsSearching(false)
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    const parts = contact.numeroComplet.split(" ")
    const codePays = parts[0]
    const numero = parts.slice(1).join(" ")

    setEditForm({
      nom: contact.nom.replace(" (RXP)", ""),
      codePays,
      numero,
    })
  }

  const handleSave = async () => {
    if (!editForm.nom || !editForm.codePays || !editForm.numero || !editingContact) {
      setMessage({ type: "error", content: "Veuillez remplir tous les champs" })
      return
    }

    const response = await apiClient.updateContact(
      editingContact.id,
      editForm.nom,
      `${editForm.codePays} ${editForm.numero}`,
    )

    if (response.success) {
      setMessage({ type: "success", content: "✅ Contact modifié avec succès !" })
      setEditingContact(null)

      // Refresh search results
      const searchResponse = await apiClient.searchContacts(searchTerm)
      if (searchResponse.success && searchResponse.data) {
        setSearchResults(searchResponse.data)
      }
    } else {
      setMessage({ type: "error", content: response.error || "Erreur lors de la modification" })
    }
  }

  const handleDelete = async (contact: Contact) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le contact "${contact.nom}" ?`)) {
      return
    }

    const response = await apiClient.deleteContact(contact.id)

    if (response.success) {
      setMessage({ type: "success", content: "✅ Contact supprimé avec succès !" })

      // Refresh search results
      const searchResponse = await apiClient.searchContacts(searchTerm)
      if (searchResponse.success && searchResponse.data) {
        setSearchResults(searchResponse.data)
      }
    } else {
      setMessage({ type: "error", content: response.error || "Erreur lors de la suppression" })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#2FD771] hover:text-[#26C65A] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>

        <Card className="bg-[#161B22] border-[#30363D] max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-[#2FD771] text-2xl text-center">🔍 Recherche & Modification</CardTitle>
            <p className="text-[#C9D1D9] text-center">
              Recherchez votre contact par nom ou numéro de téléphone pour le modifier ou le supprimer.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {message.content && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117]"
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                }`}
              >
                {message.content}
              </div>
            )}

            <div className="flex gap-3">
              <Input
                placeholder="Tapez votre nom ou numéro de téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-[#21262D] border-[#30363D] text-white flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117] hover:opacity-90"
              >
                {isSearching ? "⏳" : <Search className="w-4 h-4" />}
                {isSearching ? "Recherche..." : "Rechercher"}
              </Button>
            </div>

            {showResults && (
              <Card className="bg-[#0D1117] border-[#30363D]">
                <CardContent className="p-4">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-8 text-[#7D8590]">
                      <div className="text-4xl mb-4">😔</div>
                      <p className="font-semibold">Aucun contact trouvé</p>
                      <p className="text-sm">Vérifiez l'orthographe ou essayez avec un autre terme</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between p-4 bg-[#161B22] rounded-lg border-l-4 border-[#2FD771] hover:transform hover:translateX-1 transition-all"
                        >
                          <div>
                            <h3 className="text-[#2FD771] font-semibold">{contact.nom}</h3>
                            <p className="text-[#C9D1D9] text-sm">📞 {contact.numeroComplet}</p>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => handleEdit(contact)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Modifier
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-[#161B22] border-[#30363D] text-white">
                                <DialogHeader>
                                  <DialogTitle className="text-[#2FD771]">✏️ Modifier le Contact</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-[#2FD771] font-semibold mb-2">Nom complet</label>
                                    <Input
                                      value={editForm.nom}
                                      onChange={(e) => setEditForm((prev) => ({ ...prev, nom: e.target.value }))}
                                      className="bg-[#21262D] border-[#30363D] text-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[#2FD771] font-semibold mb-2">Code pays</label>
                                    <Select
                                      value={editForm.codePays}
                                      onValueChange={(value) => setEditForm((prev) => ({ ...prev, codePays: value }))}
                                    >
                                      <SelectTrigger className="bg-[#21262D] border-[#30363D] text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="bg-[#21262D] border-[#30363D]">
                                        {countries.map((country) => (
                                          <SelectItem
                                            key={`${country.code}-${country.name}`}
                                            value={country.code}
                                            className="text-white"
                                          >
                                            {country.flag} {country.name} ({country.code})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <label className="block text-[#2FD771] font-semibold mb-2">Numéro</label>
                                    <Input
                                      value={editForm.numero}
                                      onChange={(e) => setEditForm((prev) => ({ ...prev, numero: e.target.value }))}
                                      className="bg-[#21262D] border-[#30363D] text-white"
                                    />
                                  </div>

                                  <div className="flex gap-3 justify-end">
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditingContact(null)}
                                      className="border-[#30363D] text-[#C9D1D9] hover:bg-[#21262D]"
                                    >
                                      Annuler
                                    </Button>
                                    <Button
                                      onClick={handleSave}
                                      className="bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117] hover:opacity-90"
                                    >
                                      💾 Sauvegarder
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              size="sm"
                              onClick={() => handleDelete(contact)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
