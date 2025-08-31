"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, MessageCircle, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

const countries = [
{ code: "+509", flag: "🇭🇹", name: "Haïti" },
{ code: "+1", flag: "🇨🇦", name: "Canada" },
{ code: "+1", flag: "🇺🇸", name: "États-Unis" },
{ code: "+33", flag: "🇫🇷", name: "France" },
{ code: "+49", flag: "🇩🇪", name: "Allemagne" },
{ code: "+44", flag: "🇬🇧", name: "Royaume-Uni" },
]

const testimonials = [
{
name: "Maya Influence",
role: "Créatrice digitale • Paris",
rating: 5,
icon: "📱",
stat: "+400% de vues",
content: "Mes statuts WhatsApp ont littéralement explosé ! Ralph Xpert m'a donné une visibilité incroyable.",
before: "250 vues",
after: "1 200 vues",
},
{
name: "Jean-Marc CEO",
role: "Entrepreneur • Port-au-Prince",
rating: 5,
icon: "💼",
stat: "+2 000 nouveaux contacts",
content: "Mon business a pris un tournant fou ! En 1 mois, j'ai gagné plus de 2 000 contacts WhatsApp.",
before: "150 contacts",
after: "2 150 contacts",
},
{
name: "Léna Design",
role: "Graphiste freelance • Lyon",
rating: 4,
icon: "🎨",
stat: "+350% d'engagement",
content:
"Une interface intuitive, des résultats concrets. J'ai triplé ma portée sur WhatsApp en quelques semaines.",
before: "180 vues",
after: "810 vues",
},
]

const faqs = [
{
question: "Comment mes vues vont-elles augmenter avec Ralph Xpert ?",
answer:
"Il suffit d'enregistrer votre nom et de rejoindre la communauté sur le groupe WhatsApp. Ensuite, vous recevrez le fichier à publier dans le groupe pour activer le système de vues.",
},
{
question: "Est-ce que mon compte WhatsApp est en sécurité ?",
answer: "Oui, votre compte est 100% sécurisé. Aucune information personnelle n'est compromise.",
},
{
question: "Est-ce gratuit ?",
answer: "Oui, le service est totalement gratuit. Aucun paiement n'est requis.",
},
{
question: "Est-ce que cela fonctionne dans tous les pays ?",
answer: "Oui, le système fonctionne dans tous les pays sans exception.",
},
]

export default function HomePage() {
const [formData, setFormData] = useState({
nom: "",
codePays: "",
numero: "",
})
const [stats, setStats] = useState({
totalMembers: 0,
objectifPourcent: 0,
recentEntries: [],
})
const [isSubmitting, setIsSubmitting] = useState(false)
const [message, setMessage] = useState({ type: "", content: "" })
const [openFaq, setOpenFaq] = useState<number | null>(null)

useEffect(() => {
loadStats()
}, [])

const loadStats = async () => {
const response = await apiClient.getStats()
if (response.success && response.data) {
setStats({
totalMembers: response.data.totalContacts,
objectifPourcent: response.data.objectifPourcent,
recentEntries: response.data.recentEntries,
})
}
}

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault()
if (!formData.nom || !formData.codePays || !formData.numero) {
setMessage({ type: "error", content: "Veuillez remplir tous les champs correctement." })
return
}

setIsSubmitting(true)  

const response = await apiClient.saveContact(formData.nom, formData.codePays, formData.numero)  

if (response.success) {  
  setMessage({ type: "success", content: "Votre numéro a été enregistré avec succès ! 🎉" })  
  setFormData({ nom: "", codePays: "", numero: "" })  

  // Reload stats  
  await loadStats()  
} else {  
  setMessage({ type: "error", content: response.error || "Une erreur est survenue. Veuillez réessayer." })  
}  

setIsSubmitting(false)

}

return (
<div className="min-h-screen bg-[#0D1117] text-white">
{/* Hero Section */}
<section className="relative overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-br from-[#2FD771]/20 to-transparent" />
<div className="container mx-auto px-4 py-16 relative">
<Card className="max-w-2xl mx-auto bg-[#161B22] border-[#30363D]">
<CardContent className="p-8 text-center">
<h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2FD771]">🎯 Bienvenue sur Ralph Xpert</h1>
<p className="text-lg text-[#C9D1D9] mb-8">
Ralph Xpert vous ouvre les portes d'un nouveau niveau de visibilité.
<br />
Préparez-vous à faire passer votre statut WhatsApp à un tout autre niveau !
</p>

{message.content && (  
            <div  
              className={`p-4 rounded-lg mb-6 ${  
                message.type === "success"  
                  ? "bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117]"  
                  : "bg-gradient-to-r from-red-500 to-red-600 text-white"  
              }`}  
            >  
              {message.content}  
            </div>  
          )}  

          <form onSubmit={handleSubmit} className="space-y-4">  
            <Input  
              placeholder="Nom et prénom (ex: Ralph Xpert)"  
              value={formData.nom}  
              onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}  
              className="bg-[#21262D] border-[#30363D] text-white"  
              required  
            />  

            <Select  
              value={formData.codePays}  
              onValueChange={(value) => setFormData((prev) => ({ ...prev, codePays: value }))}  
            >  
              <SelectTrigger className="bg-[#21262D] border-[#30363D] text-white">  
                <SelectValue placeholder="Choisissez un pays" />  
              </SelectTrigger>  
              <SelectContent className="bg-[#21262D] border-[#30363D]">  
                {countries.map((country) => (  
                  <SelectItem key={`${country.code}-${country.name}`} value={country.code} className="text-white">  
                    {country.flag} {country.name} ({country.code})  
                  </SelectItem>  
                ))}  
              </SelectContent>  
            </Select>  

            <Input  
              type="tel"  
              placeholder="Numéro (ex: 45xx xxxx)"  
              value={formData.numero}  
              onChange={(e) => setFormData((prev) => ({ ...prev, numero: e.target.value }))}  
              className="bg-[#21262D] border-[#30363D] text-white"  
              required  
            />  

            <Button  
              type="submit"  
              disabled={isSubmitting}  
              className="w-full bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117] hover:opacity-90 font-bold"  
            >  
              {isSubmitting ? "⏳ Inscription en cours..." : "📝 S'inscrire"}  
            </Button>  
          </form>  
        </CardContent>  
      </Card>  
    </div>  
  </section>  

  {/* Stats Section */}  
  <section className="container mx-auto px-4 py-16">  
    <Card className="bg-[#161B22] border-[#30363D]">  
      <CardHeader>  
        <CardTitle className="text-2xl text-[#2FD771] text-center">📊 Statistiques Communauté</CardTitle>  
      </CardHeader>  
      <CardContent className="space-y-6">  
        <div className="text-center space-y-2">  
          <p className="text-[#C9D1D9]">  
            👥 Total membres inscrits:{" "}  
            <span className="text-[#2FD771] font-bold">{stats.totalMembers.toLocaleString()}</span>  
          </p>  
          <p className="text-[#C9D1D9]">  
            📈 Objectif atteint: <span className="text-[#2FD771] font-bold">{stats.objectifPourcent}%</span>  
          </p>  
        </div>  

        <div className="space-y-2">  
          <Progress value={stats.objectifPourcent} className="h-6" />  
          <div className="text-center text-sm text-[#2FD771] font-bold">{stats.objectifPourcent}%</div>  
        </div>  

        <div>  
          <h3 className="text-[#2FD771] font-bold mb-4">👥 Derniers inscrits</h3>  
          <div className="space-y-2">  
            {stats.recentEntries.map((entry: any, index) => (  
              <div key={index} className="bg-[#0D1117] p-3 rounded-lg border-l-3 border-[#2FD771]">  
                👤 <span className="text-[#2FD771] font-bold">{entry.nom}</span> —{" "}  
                <span className="text-[#C9D1D9]">{entry.numero}</span>  
              </div>  
            ))}  
          </div>  
        </div>  
      </CardContent>  
    </Card>  
  </section>  

  {/* Action Buttons */}  
  <section className="container mx-auto px-4 py-8">  
    <div className="flex flex-col sm:flex-row gap-4 justify-center">  
      <Link href="/recherche">  
        <Button className="bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117] hover:opacity-90 font-bold">  
          🔍 Rechercher / Modifier vos contacts  
        </Button>  
      </Link>  
    </div>  
  </section>  

  {/* Testimonials */}  
  <section className="container mx-auto px-4 py-16">  
    <h2 className="text-3xl font-bold text-center text-[#2FD771] mb-12">Ils ont déjà explosé grâce à nous 💥</h2>  

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">  
      {testimonials.map((testimonial, index) => (  
        <Card key={index} className="bg-[#161B22] border-[#30363D] hover:transform hover:scale-105 transition-all">  
          <CardContent className="p-6">  
            <div className="flex items-center gap-3 mb-4">  
              <span className="text-2xl">{testimonial.icon}</span>  
              <div>  
                <h3 className="text-[#2FD771] font-bold">{testimonial.name}</h3>  
                <p className="text-[#C9D1D9] text-sm">{testimonial.role}</p>  
                <div className="flex text-yellow-400">  
                  {Array.from({ length: testimonial.rating }).map((_, i) => (  
                    <Star key={i} className="w-4 h-4 fill-current" />  
                  ))}  
                </div>  
              </div>  
            </div>  

            <div className="text-[#2FD771] font-bold text-lg mb-3">{testimonial.stat}</div>  

            <p className="text-[#C9D1D9] mb-4">{testimonial.content}</p>  

            <div className="flex justify-between text-sm">  
              <span>  
                <strong>Avant :</strong> <span className="text-red-400">{testimonial.before}</span>  
              </span>  
              <span>  
                <strong>Après :</strong> <span className="text-[#2FD771]">{testimonial.after}</span>  
              </span>  
            </div>  
          </CardContent>  
        </Card>  
      ))}  
    </div>  
  </section>  

  {/* Newsletter */}  
  <section className="container mx-auto px-4 py-16">  
    <Card className="bg-gradient-to-r from-[#161B22] to-[#21262D] border-[#30363D]">  
      <CardContent className="p-8 text-center">  
        <h2 className="text-2xl font-bold text-[#2FD771] mb-4">🎯 Restez informé(e)</h2>  
        <p className="text-[#C9D1D9] mb-6 max-w-md mx-auto">  
          Inscrivez-vous pour recevoir nos dernières actualités, conseils exclusifs et astuces pour booster votre  
          réseau WhatsApp.  
        </p>  

        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">  
          <Input  
            type="email"  
            placeholder="Votre adresse Gmail"  
            className="bg-[#21262D] border-[#30363D] text-white flex-1"  
          />  
          <Button className="bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117] hover:opacity-90 font-bold">  
            S'inscrire  
          </Button>  
        </div>  

        <p className="text-xs text-[#7D8590] mt-4">  
          En vous inscrivant, vous acceptez de recevoir nos emails. Vous pouvez vous désabonner à tout moment.  
        </p>  
      </CardContent>  
    </Card>  
  </section>  

  {/* FAQ */}  
  <section className="container mx-auto px-4 py-16">  
    <Card className="bg-[#161B22] border-[#30363D]">  
      <CardHeader>  
        <CardTitle className="text-2xl text-[#2FD771] text-center">Questions Fréquemment Posées</CardTitle>  
      </CardHeader>  
      <CardContent>  
        <div className="space-y-4">  
          {faqs.map((faq, index) => (  
            <div key={index} className="border-b border-[#30363D] pb-4">  
              <button  
                className="w-full text-left p-4 hover:bg-[#21262D] rounded-lg transition-colors flex justify-between items-center"  
                onClick={() => setOpenFaq(openFaq === index ? null : index)}  
              >  
                <span className="font-semibold text-white">{faq.question}</span>  
                <span className="text-[#2FD771] text-xl font-bold">{openFaq === index ? "−" : "+"}</span>  
              </button>  
              {openFaq === index && (  
                <div className="px-4 pb-4 text-[#C9D1D9] bg-[#0D1117] rounded-lg mt-2">{faq.answer}</div>  
              )}  
            </div>  
          ))}  
        </div>  
      </CardContent>  
    </Card>  
  </section>  

  {/* CTA Section */}  
  <section className="container mx-auto px-4 py-16">  
    <Card className="bg-gradient-to-r from-[#2FD771] to-[#26C65A] text-[#0D1117]">  
      <CardContent className="p-8 text-center">  
        <h2 className="text-2xl font-bold mb-4">🚀 Augmentez votre visibilité dès aujourd'hui</h2>  
        <p className="mb-6 max-w-md mx-auto">  
          Rejoignez des centaines de créateurs qui utilisent déjà Ralph Xpert pour faire rayonner leur activité sur  
          WhatsApp et ailleurs.  
        </p>  
        <Link href="/contact">  
          <Button className="bg-[#0D1117] text-[#2FD771] hover:bg-[#161B22] font-bold">  
            📞 Contacter nous dès aujourd'hui  
          </Button>  
        </Link>  
      </CardContent>  
    </Card>  
  </section>  

  {/* Footer */}  
  <footer className="bg-gradient-to-r from-[#161B22] to-[#21262D] border-t border-[#30363D]">  
    <div className="container mx-auto px-4 py-12">  
      <div className="grid md:grid-cols-3 gap-8">  
        <div>  
          <h2 className="text-[#2FD771] font-bold text-xl mb-4">RALPH XPERT PROGRAMME</h2>  
          <p className="text-[#C9D1D9] text-sm">  
            La plateforme de référence pour développer votre réseau WhatsApp et maximiser l'impact de vos statuts.  
          </p>  
        </div>  

        <div>  
          <h3 className="text-[#2FD771] font-bold mb-4">Services</h3>  
          <ul className="space-y-2 text-[#C9D1D9] text-sm">  
            <li>Boost de contacts</li>  
            <li>Vues de statut</li>  
            <li>Analytics avancées</li>  
            <li>Formation premium</li>  
          </ul>  
        </div>  

        <div>  
          <h3 className="text-[#2FD771] font-bold mb-4">Contact & Support</h3>  
          <div className="space-y-2 text-[#C9D1D9] text-sm">  
            <div className="flex items-center gap-2">  
              <Mail className="w-4 h-4" />  
              <a href="mailto:elogekenguer@gmail.com" className="hover:text-[#2FD771]">  
                elogekenguer@gmail.com  
              </a>  
            </div>  
            <div className="flex items-center gap-2">  
              <Phone className="w-4 h-4" />  
              <a href="tel:+18494597173" className="hover:text-[#2FD771]">  
                +1 849 459 7173  
              </a>  
            </div>  
            <div className="flex items-center gap-2">  
              <MessageCircle className="w-4 h-4" />  
              <a  
                href="https://wa.me/18494597173"  
                target="_blank"  
                rel="noopener noreferrer"  
                className="hover:text-[#2FD771]"  
              >  
                WhatsApp 24/7 Disponible  
              </a>  
            </div>  
          </div>  
        </div>  
      </div>  

      <div className="border-t border-[#30363D] mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-[#7D8590] text-sm">  
        <span>© 2025 RALPH XPERT PROGRAMME. Tous droits réservés.</span>  
        <span>  
          Créé par <strong>Mr RALPH</strong>  
        </span>  
      </div>  
    </div>  
  </footer>  
</div>

)
}

    
