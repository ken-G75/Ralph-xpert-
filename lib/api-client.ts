import type { Contact, Message, ApiResponse, Stats } from "./types"

const API_BASE = "/api"

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error("API request failed:", error)
      return {
        success: false,
        error: "Network error occurred",
      }
    }
  }

  // Auth methods
  async login(username: string, password: string) {
    return this.request<{ username: string; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" })
  }

  async verifyAuth() {
    return this.request<{ username: string; loginTime: string }>("/auth/verify")
  }

  // Contact methods
  async getContacts() {
    return this.request<Contact[]>("/contacts")
  }

  async saveContact(nom: string, codePays: string, numero: string) {
    return this.request<Contact>("/contacts", {
      method: "POST",
      body: JSON.stringify({ nom, codePays, numero }),
    })
  }

  async updateContact(id: string, nom: string, numeroComplet: string) {
    return this.request(`/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ nom, numeroComplet }),
    })
  }

  async deleteContact(id: string) {
    return this.request(`/contacts/${id}`, { method: "DELETE" })
  }

  async deleteAllContacts() {
    return this.request("/contacts", { method: "DELETE" })
  }

  async searchContacts(query: string) {
    return this.request<Contact[]>(`/contacts/search?q=${encodeURIComponent(query)}`)
  }

  async downloadVCF() {
    try {
      const response = await fetch(`${API_BASE}/contacts/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `ralph_xpert_contacts_${new Date().toISOString().split("T")[0]}.vcf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        return { success: true }
      }
      return { success: false, error: "Download failed" }
    } catch (error) {
      return { success: false, error: "Download failed" }
    }
  }

  // Message methods
  async getMessages() {
    return this.request<Message[]>("/messages")
  }

  async saveMessage(nom: string, email: string, telephone: string, sujet: string, message: string) {
    return this.request<Message>("/messages", {
      method: "POST",
      body: JSON.stringify({ nom, email, telephone, sujet, message }),
    })
  }

  async updateMessage(id: string, updates: Partial<Message>) {
    return this.request(`/messages/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  async deleteMessage(id: string) {
    return this.request(`/messages/${id}`, { method: "DELETE" })
  }

  async exportMessages() {
    try {
      const response = await fetch(`${API_BASE}/messages/export`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `ralph_xpert_messages_${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        return { success: true }
      }
      return { success: false, error: "Export failed" }
    } catch (error) {
      return { success: false, error: "Export failed" }
    }
  }

  // Stats methods
  async getStats() {
    return this.request<Stats & { recentEntries: any[]; objectifPourcent: number }>("/stats")
  }
}

export const apiClient = new ApiClient()
