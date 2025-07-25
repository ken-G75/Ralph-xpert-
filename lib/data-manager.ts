// Data management utility for Ralph Xpert
export interface Contact {
  id: string
  nom: string
  numeroComplet: string
  timestamp: Date
}

export interface Message {
  id: string
  nom: string
  email: string
  telephone: string
  sujet: string
  message: string
  timestamp: Date
  read: boolean
}

export interface Stats {
  totalMembers: number
  objectifPourcent: number
  recentEntries: Array<{ nom: string; numero: string }>
}

class DataManager {
  private static instance: DataManager

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager()
    }
    return DataManager.instance
  }

  // Contacts Management
  getContacts(): Contact[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem("ralph_xpert_contacts")
    return data ? JSON.parse(data) : []
  }

  addContact(nom: string, codePays: string, numero: string): Contact {
    const contacts = this.getContacts()
    const newContact: Contact = {
      id: Date.now().toString(),
      nom: `${nom} (RXP)`,
      numeroComplet: `${codePays} ${numero}`,
      timestamp: new Date(),
    }

    contacts.push(newContact)
    localStorage.setItem("ralph_xpert_contacts", JSON.stringify(contacts))

    // Trigger storage event for real-time updates
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "ralph_xpert_contacts",
        newValue: JSON.stringify(contacts),
      }),
    )

    return newContact
  }

  updateContact(id: string, nom: string, numeroComplet: string): void {
    const contacts = this.getContacts()
    const index = contacts.findIndex((c) => c.id === id)
    if (index !== -1) {
      contacts[index] = { ...contacts[index], nom: `${nom} (RXP)`, numeroComplet }
      localStorage.setItem("ralph_xpert_contacts", JSON.stringify(contacts))

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "ralph_xpert_contacts",
          newValue: JSON.stringify(contacts),
        }),
      )
    }
  }

  deleteContact(id: string): void {
    const contacts = this.getContacts().filter((c) => c.id !== id)
    localStorage.setItem("ralph_xpert_contacts", JSON.stringify(contacts))

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "ralph_xpert_contacts",
        newValue: JSON.stringify(contacts),
      }),
    )
  }

  deleteAllContacts(): void {
    localStorage.setItem("ralph_xpert_contacts", JSON.stringify([]))

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "ralph_xpert_contacts",
        newValue: JSON.stringify([]),
      }),
    )
  }

  searchContacts(searchTerm: string): Contact[] {
    const contacts = this.getContacts()
    return contacts.filter(
      (contact) =>
        contact.nom.toLowerCase().includes(searchTerm.toLowerCase()) || contact.numeroComplet.includes(searchTerm),
    )
  }

  // Messages Management
  getMessages(): Message[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem("ralph_xpert_messages")
    return data
      ? JSON.parse(data).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      : []
  }

  addMessage(nom: string, email: string, telephone: string, sujet: string, message: string): Message {
    const messages = this.getMessages()
    const newMessage: Message = {
      id: Date.now().toString(),
      nom,
      email,
      telephone,
      sujet,
      message,
      timestamp: new Date(),
      read: false,
    }

    messages.push(newMessage)
    localStorage.setItem("ralph_xpert_messages", JSON.stringify(messages))

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "ralph_xpert_messages",
        newValue: JSON.stringify(messages),
      }),
    )

    return newMessage
  }

  updateMessage(id: string, updates: Partial<Message>): void {
    const messages = this.getMessages()
    const index = messages.findIndex((m) => m.id === id)
    if (index !== -1) {
      messages[index] = { ...messages[index], ...updates }
      localStorage.setItem("ralph_xpert_messages", JSON.stringify(messages))

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "ralph_xpert_messages",
          newValue: JSON.stringify(messages),
        }),
      )
    }
  }

  deleteMessage(id: string): void {
    const messages = this.getMessages().filter((m) => m.id !== id)
    localStorage.setItem("ralph_xpert_messages", JSON.stringify(messages))

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "ralph_xpert_messages",
        newValue: JSON.stringify(messages),
      }),
    )
  }

  // Stats Management
  getStats(): Stats {
    const contacts = this.getContacts()
    const totalMembers = contacts.length
    const objectifPourcent = Math.min(Math.round((totalMembers / 2000) * 100), 100)

    // Get recent entries (last 3)
    const recentEntries = contacts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3)
      .map((contact) => ({
        nom: contact.nom,
        numero: contact.numeroComplet,
      }))

    return {
      totalMembers,
      objectifPourcent,
      recentEntries,
    }
  }

  // VCF Export
  generateVCF(): string {
    const contacts = this.getContacts()
    return contacts
      .map((contact) => {
        const cleanName = contact.nom // Keep the (RXP) suffix in VCF
        return `BEGIN:VCARD
VERSION:3.0
FN:${cleanName}
TEL:${contact.numeroComplet}
ORG:Ralph Xpert Programme
NOTE:Contact from Ralph Xpert WhatsApp visibility service
END:VCARD`
      })
      .join("\n\n")
  }

  // CSV Export for messages
  generateMessagesCSV(): string {
    const messages = this.getMessages()
    const csvContent = [
      "Date,Nom,Email,Téléphone,Sujet,Message,Statut",
      ...messages.map((msg) =>
        [
          new Date(msg.timestamp).toLocaleString("fr-FR"),
          `"${msg.nom}"`,
          msg.email,
          msg.telephone || "",
          `"${msg.sujet}"`,
          `"${msg.message.replace(/"/g, '""')}"`,
          msg.read ? "Lu" : "Non lu",
        ].join(","),
      ),
    ].join("\n")

    return csvContent
  }
}

export const dataManager = DataManager.getInstance()
