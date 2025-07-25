import fs from "fs"
import path from "path"
import type { Contact, Message, AdminUser } from "./types"

const DATA_DIR = path.join(process.cwd(), "data")
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json")
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json")
const ADMIN_FILE = path.join(DATA_DIR, "admin.json")

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialize files if they don't exist
const initializeFiles = () => {
  if (!fs.existsSync(CONTACTS_FILE)) {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify([]))
  }

  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]))
  }

  if (!fs.existsSync(ADMIN_FILE)) {
    const defaultAdmin: AdminUser = {
      username: "AdminAdmin",
      password: "AdminAdmin", // In production, this should be hashed
    }
    fs.writeFileSync(ADMIN_FILE, JSON.stringify([defaultAdmin]))
  }
}

initializeFiles()

// Contact operations
export const getContacts = (): Contact[] => {
  try {
    const data = fs.readFileSync(CONTACTS_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

export const saveContact = (contact: Omit<Contact, "id" | "timestamp">): Contact => {
  const contacts = getContacts()
  const newContact: Contact = {
    ...contact,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    createdAt: new Date(),
  }

  contacts.push(newContact)
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2))
  return newContact
}

export const updateContact = (id: string, updates: Partial<Contact>): boolean => {
  const contacts = getContacts()
  const index = contacts.findIndex((c) => c.id === id)

  if (index === -1) return false

  contacts[index] = { ...contacts[index], ...updates }
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2))
  return true
}

export const deleteContact = (id: string): boolean => {
  const contacts = getContacts()
  const filteredContacts = contacts.filter((c) => c.id !== id)

  if (filteredContacts.length === contacts.length) return false

  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(filteredContacts, null, 2))
  return true
}

export const deleteAllContacts = (): boolean => {
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify([]))
  return true
}

// Message operations
export const getMessages = (): Message[] => {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

export const saveMessage = (message: Omit<Message, "id" | "timestamp" | "read">): Message => {
  const messages = getMessages()
  const newMessage: Message = {
    ...message,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    read: false,
    createdAt: new Date(),
  }

  messages.push(newMessage)
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2))
  return newMessage
}

export const updateMessage = (id: string, updates: Partial<Message>): boolean => {
  const messages = getMessages()
  const index = messages.findIndex((m) => m.id === id)

  if (index === -1) return false

  messages[index] = { ...messages[index], ...updates }
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2))
  return true
}

export const deleteMessage = (id: string): boolean => {
  const messages = getMessages()
  const filteredMessages = messages.filter((m) => m.id !== id)

  if (filteredMessages.length === messages.length) return false

  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(filteredMessages, null, 2))
  return true
}

// Admin operations
export const getAdminUsers = (): AdminUser[] => {
  try {
    const data = fs.readFileSync(ADMIN_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

export const validateAdmin = (username: string, password: string): boolean => {
  const admins = getAdminUsers()
  return admins.some((admin) => admin.username === username && admin.password === password)
}

// VCF Generation
export const generateVCF = (): string => {
  const contacts = getContacts()

  return contacts
    .map((contact) => {
      const cleanName = contact.nom
      return `BEGIN:VCARD
VERSION:3.0
FN:${cleanName}
TEL:${contact.numeroComplet}
ORG:Ralph Xpert Programme
NOTE:Contact from Ralph Xpert WhatsApp visibility service - Registered on ${new Date(contact.timestamp).toLocaleDateString("fr-FR")}
CATEGORIES:Ralph Xpert,WhatsApp,Business
END:VCARD`
    })
    .join("\n\n")
}

// CSV Generation for messages
export const generateMessagesCSV = (): string => {
  const messages = getMessages()

  const csvContent = [
    "Date,Nom,Email,Téléphone,Sujet,Message,Statut,ID",
    ...messages.map((msg) =>
      [
        new Date(msg.timestamp).toLocaleString("fr-FR"),
        `"${msg.nom}"`,
        msg.email,
        msg.telephone || "Non fourni",
        `"${msg.sujet}"`,
        `"${msg.message.replace(/"/g, '""')}"`,
        msg.read ? "Lu" : "Non lu",
        msg.id,
      ].join(","),
    ),
  ].join("\n")

  return csvContent
}
