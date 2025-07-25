"use client"

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
} from "lucide-react"
import { dataManager, type Contact, type Message } from "@/lib/data-manager"

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState("")
  const [stats, setStats] = useState({
    totalMessages: 0,
    newMessages: 0,
    readMessages: 0,
    totalContacts: 0,
    todayRegistrations: 0,
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
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load data function
  const loadData = () => {
    const allMessages = dataManager.getMessages()
    const allContacts = dataManager.getContacts()

    setMessages(allMessages)
    setContacts(allContacts)

    // Calculate stats
    const today = new Date().toDateString()
    const todayRegistrations = allContacts.filter((c) => new Date(c.timestamp).toDateString() === today).length

    const todayMessages = allMessages.filter((m) => new Date(m.timestamp).toDateString() === today).length

    const readRate =
      allMessages.length > 0 ? Math.round((allMessages.filter((m) => m.read).length / allMessages.length) * 100) : 0

    setStats({
      totalMessages: allMessages.length,
      newMessages: allMessages.filter((m) => !m.read).length,
      readMessages: allMessages.filter((m) => m.read).length,
      totalContacts: allContacts.length,
      todayRegistrations,
      todayMessages,
      readRate,
    })
  }

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("adminToken")
    const user = localStorage.getItem("adminUser")

    if (!token) {
      router.push("/admin/login")
      return
    }

    setCurrentUser(user || "Admin")

    // Load initial data
    loadData()
    setIsLoading(false)

    // Listen for storage changes to update data in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ralph_xpert_contacts" || e.key === "ralph_xpert_messages") {
        loadData()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [router])

  const handleLogout = () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminUser")
      localStorage.removeItem("loginTime")
      router.push("/admin/login")
    }
  }

  const toggleMessageRead = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      dataManager.updateMessage(messageId, { read: !message.read })
      loadData() // Refresh data
    }
  }

  const deleteMessage = (messageId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      dataManager.deleteMessage(messageId)
      loadData()
      setIsModalOpen(false)
    }
  }

  const deleteContact = (contactId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) {
      dataManager.deleteContact(contactId)
      loadData()
    }
  }

  const deleteAllContacts = () => {
    if (
      !confirm("⚠️ ATTENTION: Êtes-vous sûr de vouloir supprimer TOUS les contacts ?\n\nCette action est irréversible !")
    ) {
      return
    }

    if (!confirm("Confirmez-vous la suppression de tous les contacts ?")) {
      return
    }

    dataManager.deleteAllContacts()
    loadData()
    alert("✅ Tous les contacts ont été supprimés !")
  }

  const downloadVCF = () => {
    const vcfContent = dataManager.generateVCF()
    const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ralph_xpert_contacts_${new Date().toISOString().split("T")[0]}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    alert(`✅ Fichier VCF téléchargé avec succès !\n📞 ${contacts.length} contacts exportés avec le suffixe (RXP)`)
  }

  const exportMessages = () => {
    const csvContent = dataManager.generateMessagesCSV()
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `messages_ralph_xpert_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    alert(`✅ Messages exportés avec succès !\n📧 ${messages.length} messages dans le fichier CSV`)
  }

  const viewMessage = (message: Message) => {
    setSelectedMessage(message)
    setIsModalOpen(true)

    // Mark as read if not already
    if (!message.read) {
      toggleMessageRead(message.id)
    }
  }

  const formatDate = (timestamp: Date) => {
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
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-[#2FD771]">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      {/* Professional Header */}
      <header className="bg-gradient-to-r from-[#161B22] via-[#21262D] to-[#161B22] border-b border-[#30363D] shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2FD771] to-[#26C65A] rounded-xl flex items-center justify-center text-[#0D1117] font-bold text-xl">
                🛡️
              </div>
              <div>
                <h1 className="text-[#2FD771] text-2xl font-bold">Ralph Xpert Admin</h1>
                <p className="text-[#C9D1D9] text-sm">Tableau de bord administrateur</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[#C9D1D9] text-sm">Connecté en tant que</p>
                <p className="text-[#2FD771] font-semibold">{currentUser}</p>
              </div>
              <Button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="stats" className="space-y-8">
          <TabsList className="bg-[#161B22] border-[#30363D] p-1 rounded-xl">
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2FD771] data-[state=active]:to-[#26C65A] data-[state=active]:text-[#0D1117] rounded-lg px-6 py-3 font-semibold transition-all"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2FD771] data-[state=active]:to-[#26C65A] data-[state=active]:text-[#0D1117] rounded-lg px-6 py-3 font-semibold transition-all"
            >
              <Mail className="w-4 h-4 mr-2" />
              Messages ({stats.newMessages})
            </TabsTrigger>
            <TabsTrigger
              value="contacts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#2FD771] data-[state=active]:to-[#26C65A] data-[state=active]:text-[#0D1117] rounded-lg px-6 py-3 font-semibold transition-all"
            >
              <Users className="w-4 h-4 mr-2" />
              Contacts ({stats.totalContacts})
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Stats Tab */}
          <TabsContent value="stats" className="space-y-8">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#C9D1D9] text-sm font-medium">Messages Total</p>
                      <p className="text-[#2FD771] text-3xl font-bold">{stats.totalMessages}</p>
                      <p className="text-[#7D8590] text-xs mt-1">Tous les messages reçus</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#2FD771] to-[#26C65A] rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-[#0D1117]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#C9D1D9] text-sm font-medium">Nouveaux Messages</p>
                      <p className="text-[#2FD771] text-3xl font-bold">{stats.newMessages}</p>
                      <p className="text-[#7D8590] text-xs mt-1">Messages non lus</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                        !
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#C9D1D9] text-sm font-medium">Contacts Inscrits</p>
                      <p className="text-[#2FD771] text-3xl font-bold">{stats.totalContacts}</p>
                      <p className="text-[#7D8590] text-xs mt-1">Membres avec suffixe (RXP)</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#C9D1D9] text-sm font-medium">Taux de Lecture</p>
                      <p className="text-[#2FD771] text-3xl font-bold">{stats.readRate}%</p>
                      <p className="text-[#7D8590] text-xs mt-1">Messages traités</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#2FD771] flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Activité d'Aujourd'hui
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-[#30363D]">
                    <span className="text-[#C9D1D9] flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Nouvelles inscriptions
                    </span>
                    <span className="text-[#2FD771] font-bold text-lg">{stats.todayRegistrations}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#30363D]">
                    <span className="text-[#C9D1D9] flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Messages reçus
                    </span>
                    <span className="text-[#2FD771] font-bold text-lg">{stats.todayMessages}</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[#C9D1D9] flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Messages traités
                    </span>
                    <span className="text-[#2FD771] font-bold text-lg">{stats.readMessages}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[#2FD771]">📊 Progression Objectif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-[#C9D1D9] mb-2">Objectif: 2000 membres</p>
                    <div className="w-full bg-[#30363D] rounded-full h-4 mb-4">
                      <div
                        className="bg-gradient-to-r from-[#2FD771] to-[#26C65A] h-4 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((stats.totalContacts / 2000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-[#2FD771] font-bold text-2xl">
                      {Math.min(Math.round((stats.totalContacts / 2000) * 100), 100)}%
                    </p>
                    <p className="text-[#7D8590] text-sm">
                      {2000 - stats.totalContacts > 0
                        ? `${2000 - stats.totalContacts} membres restants`
                        : "Objectif atteint ! 🎉"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-gradient-to-br from-[#161B22] to-[#21262D] border-[#30363D] shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#2FD771]">🕒 Activité Récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contacts.slice(0, 5).map((contact, index) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 bg-[#21262D] rounded-lg border border-[#30363D]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#2FD771] to-[#26C65A] rounded-full flex items-center justify-center text-[#0D1117] font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-[#2FD771] font-semibold">{contact.nom}</p>
                          <p className="text-[#C9D1D9] text-sm">{contact.numeroComplet}</p>
                        </div>
                      </div>
                      <p className="text-[#7D8590] text-xs">{formatDate(contact.timestamp)}</p>
                    </div>
                  ))}

                  {contacts.length === 0 && (
                    <div className="text-center py-8 text-[#7D8590]">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune inscription pour le moment</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
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

          {/* Enhanced Contacts Tab */}
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
                            onClick={() => {
                              const newName = prompt(
                                "Nouveau nom (sans le suffixe RXP):",
                                contact.nom.replace(" (RXP)", ""),
                              )
                              if (newName && newName !== contact.nom.replace(" (RXP)", "")) {
                                dataManager.updateContact(contact.id, newName, contact.numeroComplet)
                                loadData()
                                alert("✅ Contact modifié avec succès !")
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
