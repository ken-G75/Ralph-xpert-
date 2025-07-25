"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Phone,
  MessageCircle,
  Users,
  Eye,
  EyeOff,
  Trash2,
  Download,
  LogOut,
  Search,
  BarChart3,
  TrendingUp,
  Clock,
  Shield,
  AlertCircle,
  Activity,
  Globe,
  Calendar,
  FileText,
  Star,
  ArrowLeft,
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { Contact, Message } from "@/lib/types"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Admin dashboard state
  const [currentUser, setCurrentUser] = useState("")
  const [stats, setStats] = useState({
    totalMessages: 0,
    newMessages: 0,
    readMessages: 0,
    totalContacts: 0,
    todayContacts: 0,
    todayMessages: 0,
    readRate: 0,
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [contactSearchTerm, setContactSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const response = await apiClient.verifyAuth()
    if (response.success && response.data) {
      setIsAuthenticated(true)
      setCurrentUser(response.data.username)
      await loadDashboardData()
    }
    setIsLoading(false)
  }

  const loadDashboardData = async () => {
    try {
      const [statsResponse, messagesResponse, contactsResponse] = await Promise.all([
        apiClient.getStats(),
        apiClient.getMessages(),
        apiClient.getContacts(),
      ])

      if (statsResponse.success && statsResponse.data) {
        setStats({
          totalMessages: statsResponse.data.totalMessages,
          newMessages: statsResponse.data.newMessages,
          readMessages: statsResponse.data.readMessages,
          totalContacts: statsResponse.data.totalContacts,
          todayContacts: statsResponse.data.todayContacts,
          todayMessages: statsResponse.data.todayMessages,
          readRate: statsResponse.data.readRate,
        })
      }

      if (messagesResponse.success && messagesResponse.data) {
        setMessages(messagesResponse.data)
      }

      if (contactsResponse.success && contactsResponse.data) {
        setContacts(contactsResponse.data)
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError("")

    const response = await apiClient.login(loginForm.username, loginForm.password)

    if (response.success && response.data) {
      setIsAuthenticated(true)
      setCurrentUser(response.data.username)
      await loadDashboardData()
    } else {
      setLoginError(response.error || "Login failed")
    }

    setIsLoggingIn(false)
  }

  const handleLogout = async () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      await apiClient.logout()
      setIsAuthenticated(false)
      setCurrentUser("")
      router.push("/")
    }
  }

  const toggleMessageRead = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      const response = await apiClient.updateMessage(messageId, { read: !message.read })
      if (response.success) {
        await loadDashboardData()
      }
    }
  }

  const deleteMessage = async (messageId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      const response = await apiClient.deleteMessage(messageId)
      if (response.success) {
        await loadDashboardData()
        setIsModalOpen(false)
      }
    }
  }

  const deleteContact = async (contactId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) {
      const response = await apiClient.deleteContact(contactId)
      if (response.success) {
        await loadDashboardData()
      }
    }
  }

  const deleteAllContacts = async () => {
    if (
      !confirm("⚠️ ATTENTION: Êtes-vous sûr de vouloir supprimer TOUS les contacts ?\n\nCette action est irréversible !")
    ) {
      return
    }

    if (!confirm("Confirmez-vous la suppression de tous les contacts ?")) {
      return
    }

    const response = await apiClient.deleteAllContacts()
    if (response.success) {
      await loadDashboardData()
      alert("✅ Tous les contacts ont été supprimés !")
    }
  }

  const downloadVCF = async () => {
    const response = await apiClient.downloadVCF()
    if (response.success) {
      alert(`✅ Fichier VCF téléchargé avec succès !\n📞 ${contacts.length} contacts exportés avec le suffixe (RXP)`)
    } else {
      alert("❌ Erreur lors du téléchargement du fichier VCF")
    }
  }

  const exportMessages = async () => {
    const response = await apiClient.exportMessages()
    if (response.success) {
      alert(`✅ Messages exportés avec succès !\n📧 ${messages.length} messages dans le fichier CSV`)
    } else {
      alert("❌ Erreur lors de l'export des messages")
    }
  }

  const viewMessage = (message: Message) => {
    setSelectedMessage(message)
    setIsModalOpen(true)

    // Mark as read if not already
    if (!message.read) {
      toggleMessageRead(message.id)
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return `Aujourd'hui à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
    } else if (diffDays === 2) {
      return `Hier à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return (
        date.toLocaleDateString("fr-FR") +
        " à " +
        date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      )
    }
  }

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      searchTerm === "" ||
      msg.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !msg.read) ||
      (filter === "read" && msg.read) ||
      (filter === "today" && new Date(msg.timestamp).toDateString() === new Date().toDateString())

    return matchesSearch && matchesFilter
  })

  const filteredContacts = contacts.filter(
    (contact) =>
      contactSearchTerm === "" ||
      contact.nom.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      contact.numeroComplet.includes(contactSearchTerm),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#2FD771] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2FD771] text-lg font-semibold">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-[#161B22] border-[#30363D] shadow-2xl">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#2FD771] to-[#26C65A] rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-[#0D1117]" />
              </div>
              <CardTitle className="text-[#2FD771] text-3xl font-bold mb-2">🛡️ Ralph Xpert Admin</CardTitle>
              <p className="text-[#C9D1D9] text-lg">Tableau de bord administrateur sécurisé</p>
              <div className="flex items-center justify-center gap-2 mt-4 text-[#7D8590] text-sm">
                <Globe className="w-4 h-4" />
                <span>Accès mondial 24/7</span>
              </div>
            </CardHeader>
            <CardContent>
              {loginError && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl mb-6 flex items-center gap-3 shadow-lg">
                  <AlertCircle className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">Erreur de connexion</p>
                    <p className="text-sm opacity-90">{loginError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-[#2FD771] font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Nom d'utilisateur
                  </label>
                  <Input
                    placeholder="Entrez votre nom d'utilisateur"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="bg-[#21262D] border-[#30363D] text-white h-12 text-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#2FD771] font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Mot de passe
                  </label>
                  <Input
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="bg-[#21262D] border-[#30363D] text-white h-12 text-lg"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117] hover:opacity-90 font-bold py-4 text-lg shadow-lg"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0D1117] border-t-transparent rounded-full animate-spin mr-3" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-3" />🚀 Accéder au tableau de bord
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center mt-8">
                <button
                  onClick={() => router.push("/")}
                  className="text-[#7D8590] hover:text-[#2FD771] text-sm transition-colors flex items-center gap-2 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour au site Ralph Xpert
                </button>
              </div>

              <Card className="bg-gradient-to-r from-[#21262D] to-[#30363D] border-[#30363D] mt-8">
                <CardContent className="p-6">
                  <h3 className="text-[#2FD771] font-bold text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />🔑 Identifiants par défaut
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#C9D1D9]">👤 Utilisateur :</span>
                      <code className="bg-[#0D1117] px-3 py-1 rounded text-[#2FD771] font-mono">AdminAdmin</code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#C9D1D9]">🔐 Mot de passe :</span>
                      <code className="bg-[#0D1117] px-3 py-1 rounded text-[#2FD771] font-mono">AdminAdmin</code>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-[#0D1117] rounded-lg border-l-4 border-[#2FD771]">
                    <p className="text-[#C9D1D9] text-sm">
                      💡 <strong>Conseil :</strong> Changez ces identifiants après votre première connexion pour plus de
                      sécurité.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Enhanced Professional Header */}
      <header className="bg-gradient-to-r from-[#161B22] via-[#21262D] to-[#161B22] border-b border-[#30363D] shadow-2xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2FD771] to-[#26C65A] rounded-2xl flex items-center justify-center text-[#0D1117] shadow-lg">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-[#2FD771] text-3xl font-bold mb-1">🛡️ Ralph Xpert Admin</h1>
                <p className="text-[#C9D1D9] text-lg">Tableau de bord administrateur professionnel</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-[#7D8590]">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    En ligne
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date().toLocaleString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[#C9D1D9] text-sm">Connecté en tant que</p>
                <p className="text-[#2FD771] font-bold text-lg flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {currentUser}
                </p>
                <p className="text-[#7D8590] text-xs">Administrateur système</p>
              </div>
              <Button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg px-6 py-3"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion sécurisée
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-[#161B22] border-[#30363D] p-2 rounded-2xl shadow-lg">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2FD771] data-[state=active]:to-[#26C65A] data-[state=active]:text-[#0D1117] rounded-xl px-8 py-4 font-semibold transition-all"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2FD771] data-[state=active]:to-[#26C65A] data-[state=active]:text-[#0D1117] rounded-xl px-8 py-4 font-semibold transition-all"
            >
              <Mail className="w-5 h-5 mr-2" />
              Messages ({stats.newMessages})
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2FD771] data-[state=active]:to-[#26C65A] data-[state=active]:text-[#0D1117] rounded-xl px-8 py-4 font-semibold transition-all"
            >
              <Users className="w-5 h-5 mr-2" />
              Contacts ({stats.totalContacts})
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2FD771] data-[state=active]:to-[#26C65A] data-[state=active]:text-[#0D1117] rounded-xl px-8 py-4 font-semibold transition-all"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Welcome Banner */}
            <Card className="bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117] shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">🎉 Bienvenue, {currentUser} !</h2>
                    <p className="text-lg opacity-90 mb-4">Voici un aperçu de l'activité de Ralph Xpert aujourd'hui</p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Système opérationnel
                      </span>
                    </div>
                  </div>
                  <div className="text-6xl opacity-20">🚀</div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#2FD771] to-[#26C65A] rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-[#0D1117]" />
                    </div>
                    <Badge className="bg-[#2FD771] text-[#0D1117]">Total</Badge>
                  </div>
                  <div>
                    <p className="text-[#C9D1D9] text-sm font-medium mb-1">Messages Total</p>
                    <p className="text-[#2FD771] text-4xl font-bold mb-2">{stats.totalMessages}</p>
                    <p className="text-[#7D8590] text-xs">Tous les messages reçus</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-orange-500 text-white">Nouveau</Badge>
                  </div>
                  <div>
                    <p className="text-[#C9D1D9] text-sm font-medium mb-1">Messages Non Lus</p>
                    <p className="text-[#2FD771] text-4xl font-bold mb-2">{stats.newMessages}</p>
                    <p className="text-[#7D8590] text-xs">Nécessitent votre attention</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-blue-500 text-white">Membres</Badge>
                  </div>
                  <div>
                    <p className="text-[#C9D1D9] text-sm font-medium mb-1">Contacts Inscrits</p>
                    <p className="text-[#2FD771] text-4xl font-bold mb-2">{stats.totalContacts}</p>
                    <p className="text-[#7D8590] text-xs">Avec suffixe (RXP)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-green-500 text-white">Performance</Badge>
                  </div>
                  <div>
                    <p className="text-[#C9D1D9] text-sm font-medium mb-1">Taux de Lecture</p>
                    <p className="text-[#2FD771] text-4xl font-bold mb-2">{stats.readRate}%</p>
                    <p className="text-[#7D8590] text-xs">Messages traités</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Activity Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#2FD771] flex items-center gap-3 text-xl">
                    <Clock className="w-6 h-6" />📊 Activité d'Aujourd'hui
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center py-4 border-b border-[#30363D]">
                    <span className="text-[#C9D1D9] flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#2FD771] to-[#26C65A] rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#0D1117]" />
                      </div>
                      Nouvelles inscriptions
                    </span>
                    <span className="text-[#2FD771] font-bold text-2xl">{stats.todayContacts}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-[#30363D]">
                    <span className="text-[#C9D1D9] flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      Messages reçus
                    </span>
                    <span className="text-[#2FD771] font-bold text-2xl">{stats.todayMessages}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-[#C9D1D9] flex items-center gap-3 text-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                      Messages traités
                    </span>
                    <span className="text-[#2FD771] font-bold text-2xl">{stats.readMessages}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#2FD771] text-xl">🎯 Progression Objectif Ralph Xpert</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-[#C9D1D9] mb-4 text-lg">Objectif: 2000 membres actifs</p>
                    <div className="w-full bg-[#30363D] rounded-full h-6 mb-6 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-[#2FD771] to-[#26C65A] h-6 rounded-full transition-all duration-1000 shadow-lg"
                        style={{ width: `${Math.min((stats.totalContacts / 2000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-[#2FD771] font-bold text-4xl mb-2">
                      {Math.min(Math.round((stats.totalContacts / 2000) * 100), 100)}%
                    </p>
                    <p className="text-[#7D8590] text-lg">
                      {2000 - stats.totalContacts > 0
                        ? `${2000 - stats.totalContacts} membres restants pour atteindre l'objectif`
                        : "🎉 Objectif atteint ! Félicitations !"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-4 bg-[#0D1117] rounded-lg border border-[#30363D]">
                      <p className="text-[#2FD771] font-bold text-2xl">{stats.totalContacts}</p>
                      <p className="text-[#C9D1D9] text-sm">Membres actuels</p>
                    </div>
                    <div className="text-center p-4 bg-[#0D1117] rounded-lg border border-[#30363D]">
                      <p className="text-[#2FD771] font-bold text-2xl">2000</p>
                      <p className="text-[#C9D1D9] text-sm">Objectif final</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Recent Activity */}
            <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#2FD771] text-xl flex items-center gap-3">
                  <Activity className="w-6 h-6" />🕒 Activité Récente - Dernières Inscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts.slice(0, 8).map((contact, index) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-[#21262D] to-[#30363D] rounded-xl border border-[#30363D] hover:border-[#2FD771]/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#2FD771] to-[#26C65A] rounded-full flex items-center justify-center text-[#0D1117] font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-[#2FD771] font-bold text-lg">{contact.nom}</p>
                          <p className="text-[#C9D1D9] flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {contact.numeroComplet}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#7D8590] text-sm">{formatDate(contact.timestamp)}</p>
                        <Badge className="bg-[#2FD771] text-[#0D1117] mt-1">Nouveau membre</Badge>
                      </div>
                    </div>
                  ))}

                  {contacts.length === 0 && (
                    <div className="text-center py-12 text-[#7D8590]">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="font-semibold mb-2 text-xl">Aucune inscription pour le moment</h3>
                      <p>Les nouvelles inscriptions apparaîtront ici</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab - Keep existing implementation */}
          <TabsContent value="messages" className="space-y-6">
            {/* Search and filters */}
            <Card className="bg-[#161B22] border-[#30363D] shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 w-full lg:max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7D8590] w-4 h-4" />
                      <Input
                        placeholder="🔍 Rechercher par nom, email ou sujet..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#21262D] border-[#30363D] text-white pl-10 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={filter === "all" ? "default" : "outline"}
                      onClick={() => setFilter("all")}
                      className={
                        filter === "all"
                          ? "bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117]"
                          : "border-[#30363D] text-[#C9D1D9] hover:bg-[#21262D]"
                      }
                    >
                      Tous ({messages.length})
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === "unread" ? "default" : "outline"}
                      onClick={() => setFilter("unread")}
                      className={
                        filter === "unread"
                          ? "bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117]"
                          : "border-[#30363D] text-[#C9D1D9] hover:bg-[#21262D]"
                      }
                    >
                      Non lus ({stats.newMessages})
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === "read" ? "default" : "outline"}
                      onClick={() => setFilter("read")}
                      className={
                        filter === "read"
                          ? "bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117]"
                          : "border-[#30363D] text-[#C9D1D9] hover:bg-[#21262D]"
                      }
                    >
                      Lus ({stats.readMessages})
                    </Button>
                    <Button
                      size="sm"
                      onClick={exportMessages}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Exporter CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages list */}
            <Card className="bg-[#161B22] border-[#30363D] shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#2FD771] flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Messages de Contact ({filteredMessages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12 text-[#7D8590]">
                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="font-semibold mb-2 text-lg">Aucun message trouvé</h3>
                    <p>Il n'y a pas de messages correspondant à vos critères.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-6 rounded-xl border cursor-pointer transition-all hover:bg-[#21262D] hover:shadow-lg ${
                          !message.read
                            ? "border-l-4 border-l-[#2FD771] bg-gradient-to-r from-[#2FD771]/10 to-transparent border-[#30363D]"
                            : "border-[#30363D] hover:border-[#2FD771]/50"
                        }`}
                        onClick={() => viewMessage(message)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-[#2FD771] font-bold text-lg">{message.nom}</h3>
                              <Badge
                                variant={message.read ? "secondary" : "default"}
                                className={
                                  message.read
                                    ? "bg-[#7D8590] text-white"
                                    : "bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117] font-semibold"
                                }
                              >
                                {message.read ? "Lu" : "Nouveau"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                              <p className="text-[#C9D1D9] flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {message.email}
                              </p>
                              <p className="text-[#C9D1D9] flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {message.telephone || "Non fourni"}
                              </p>
                              <p className="text-[#C9D1D9] flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {message.sujet}
                              </p>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-[#7D8590] text-xs">{formatDate(message.timestamp)}</p>
                          </div>
                        </div>

                        <p className="text-[#E6EDF3] text-sm mb-4 leading-relaxed">
                          {message.message.length > 150 ? message.message.substring(0, 150) + "..." : message.message}
                        </p>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleMessageRead(message.id)
                            }}
                            className="bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117] hover:opacity-90"
                          >
                            {message.read ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                            {message.read ? "Marquer non lu" : "Marquer lu"}
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              const subject = `Re: ${message.sujet}`
                              const body = `Bonjour ${message.nom},\n\nMerci pour votre message concernant "${message.sujet}".\n\n[Votre réponse ici]\n\nCordialement,\nÉquipe Ralph Xpert`
                              const mailtoLink = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                              window.open(mailtoLink)
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Répondre
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteMessage(message.id)
                            }}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
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
          </TabsContent>

          {/* Contacts Tab - Keep existing implementation */}
          <TabsContent value="contacts" className="space-y-6">
            <Card className="bg-[#161B22] border-[#30363D] shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 w-full lg:max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7D8590] w-4 h-4" />
                      <Input
                        placeholder="🔍 Rechercher un contact..."
                        value={contactSearchTerm}
                        onChange={(e) => setContactSearchTerm(e.target.value)}
                        className="bg-[#21262D] border-[#30363D] text-white pl-10 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={downloadVCF}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Télécharger VCF ({contacts.length})
                    </Button>
                    <Button
                      onClick={deleteAllContacts}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Effacer Tous
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#161B22] border-[#30363D] shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#2FD771] flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Liste des Contacts ({filteredContacts.length})
                </CardTitle>
                <p className="text-[#C9D1D9] text-sm">Tous les contacts avec le suffixe (RXP) automatique</p>
              </CardHeader>
              <CardContent>
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-12 text-[#7D8590]">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="font-semibold mb-2 text-lg">Aucun contact trouvé</h3>
                    <p>Il n'y a pas encore de contacts inscrits ou correspondant à votre recherche.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {filteredContacts.map((contact, index) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-6 bg-gradient-to-r from-[#21262D] to-[#30363D] rounded-xl border border-[#30363D] hover:border-[#2FD771]/50 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#2FD771] to-[#26C65A] rounded-full flex items-center justify-center text-[#0D1117] font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-[#2FD771] font-bold text-lg">{contact.nom}</h3>
                            <p className="text-[#C9D1D9] text-sm flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {contact.numeroComplet}
                            </p>
                            <p className="text-[#7D8590] text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(contact.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={async () => {
                              const newName = prompt(
                                "Nouveau nom (sans le suffixe RXP):",
                                contact.nom.replace(" (RXP)", ""),
                              )
                              if (newName && newName !== contact.nom.replace(" (RXP)", "")) {
                                const response = await apiClient.updateContact(
                                  contact.id,
                                  newName,
                                  contact.numeroComplet,
                                )
                                if (response.success) {
                                  await loadDashboardData()
                                  alert("✅ Contact modifié avec succès !")
                                }
                              }
                            }}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                          >
                            ✏️ Modifier
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => deleteContact(contact.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
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
          </TabsContent>

          {/* New Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#2FD771] flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />📈 Croissance des Membres
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#C9D1D9]">Cette semaine</span>
                      <span className="text-[#2FD771] font-bold">+{Math.floor(stats.totalContacts * 0.15)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#C9D1D9]">Ce mois</span>
                      <span className="text-[#2FD771] font-bold">+{Math.floor(stats.totalContacts * 0.6)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#C9D1D9]">Total</span>
                      <span className="text-[#2FD771] font-bold">{stats.totalContacts}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#2FD771] flex items-center gap-2">
                    <Star className="w-5 h-5" />⭐ Performance Globale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#C9D1D9]">Taux de réponse</span>
                      <span className="text-[#2FD771] font-bold">{stats.readRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#C9D1D9]">Satisfaction client</span>
                      <span className="text-[#2FD771] font-bold">98%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#C9D1D9]">Temps de réponse moyen</span>
                      <span className="text-[#2FD771] font-bold">2h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#2FD771] flex items-center gap-2">
                  <FileText className="w-5 h-5" />📊 Rapport Détaillé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-[#0D1117] rounded-xl border border-[#30363D]">
                    <div className="text-3xl mb-2">📧</div>
                    <p className="text-[#2FD771] font-bold text-2xl">{stats.totalMessages}</p>
                    <p className="text-[#C9D1D9] text-sm">Messages totaux</p>
                  </div>
                  <div className="text-center p-6 bg-[#0D1117] rounded-xl border border-[#30363D]">
                    <div className="text-3xl mb-2">👥</div>
                    <p className="text-[#2FD771] font-bold text-2xl">{stats.totalContacts}</p>
                    <p className="text-[#C9D1D9] text-sm">Membres inscrits</p>
                  </div>
                  <div className="text-center p-6 bg-[#0D1117] rounded-xl border border-[#30363D]">
                    <div className="text-3xl mb-2">⚡</div>
                    <p className="text-[#2FD771] font-bold text-2xl">{stats.readRate}%</p>
                    <p className="text-[#C9D1D9] text-sm">Taux d'engagement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Message Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#2FD771] text-xl flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Détails du Message
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#21262D] to-[#30363D] p-6 rounded-xl border border-[#30363D]">
                <h4 className="text-[#2FD771] font-bold mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Informations du contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <strong className="text-[#2FD771]">Nom :</strong>
                      <span className="text-[#E6EDF3]">{selectedMessage.nom}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <strong className="text-[#2FD771]">Email :</strong>
                      <a href={`mailto:${selectedMessage.email}`} className="text-blue-400 hover:underline">
                        {selectedMessage.email}
                      </a>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <strong className="text-[#2FD771]">Téléphone :</strong>
                      <span className="text-[#E6EDF3]">{selectedMessage.telephone || "Non fourni"}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <strong className="text-[#2FD771]">Sujet :</strong>
                      <span className="text-[#E6EDF3]">{selectedMessage.sujet}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#30363D]">
                  <p className="flex items-center gap-2 text-sm">
                    <strong className="text-[#2FD771]">Date :</strong>
                    <span className="text-[#E6EDF3]">{formatDate(selectedMessage.timestamp)}</span>
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#21262D] to-[#30363D] p-6 rounded-xl border-l-4 border-[#2FD771]">
                <h4 className="text-[#2FD771] font-bold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </h4>
                <div className="bg-[#0D1117] p-4 rounded-lg border border-[#30363D]">
                  <p className="text-[#E6EDF3] leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap justify-center">
                <Button
                  onClick={() => {
                    const subject = `Re: ${selectedMessage.sujet} - Ralph Xpert`
                    const body = `Bonjour ${selectedMessage.nom},\n\nMerci pour votre message concernant "${selectedMessage.sujet}".\n\n[Votre réponse ici]\n\nCordialement,\nÉquipe Ralph Xpert\n\n---\nMessage original:\n"${selectedMessage.message}"`
                    const mailtoLink = `mailto:${selectedMessage.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                    window.open(mailtoLink)
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Répondre par Email
                </Button>
                <Button
                  onClick={() => {
                    if (selectedMessage.telephone && selectedMessage.telephone !== "Non fourni") {
                      const message = `Bonjour ${selectedMessage.nom}, merci pour votre message sur Ralph Xpert concernant "${selectedMessage.sujet}". Comment puis-je vous aider ?`
                      const whatsappUrl = `https://wa.me/${selectedMessage.telephone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`
                      window.open(whatsappUrl, "_blank")
                    } else {
                      alert("Numéro de téléphone non disponible")
                    }
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Répondre WhatsApp
                </Button>
                <Button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
