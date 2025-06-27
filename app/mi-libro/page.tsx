import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Smartphone, Globe, MapPin, ShoppingCart } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "RENUNCIO - Cambiar de trabajo y recuperar tu vida | Eliana Bracciaforte",
  description:
    "¿Y si renunciar no fuera el final, sino el comienzo? Descubre cómo transformar tu relación con el trabajo y recuperar tu vida. Libro disponible en formato físico y digital.",
  keywords: [
    "renuncio",
    "eliana bracciaforte",
    "cambiar trabajo",
    "libro trabajo",
    "desarrollo profesional",
    "bienestar laboral",
  ],
  openGraph: {
    title: "RENUNCIO - Cambiar de trabajo y recuperar tu vida",
    description: "Una guía íntima y poderosa para quienes se preguntan si están donde quieren estar.",
    images: ["/images/renuncio-header-small.jpg"],
  },
}

export default function MiLibroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-100 to-red-100">
        <div className="container mx-auto px-4 py-8">
          <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/images/renuncio-header-small.jpg"
              alt="RENUNCIO - Cambiar de trabajo y recuperar tu vida por Eliana Bracciaforte"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Book Introduction */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            ✨ RENUNCIO
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-800">
            Cambiar de trabajo y recuperar tu vida
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            <strong>Eliana Bracciaforte</strong>
          </p>

          <div className="prose prose-lg mx-auto text-gray-700 leading-relaxed">
            <p className="text-xl mb-6">
              <strong>¿Y si renunciar no fuera el final, sino el comienzo?</strong>
            </p>
            <p className="mb-6">
              Este libro es una invitación a repensar nuestra relación con el trabajo. A reconocer cuándo el costo de
              sostener un empleo es más alto que el de soltarlo. A tomar decisiones valientes, informadas y humanas.
            </p>
            <p className="mb-8">
              "Renuncio" no es solo una historia, es una guía íntima y poderosa para quienes se preguntan si están donde
              quieren estar.
            </p>
          </div>
        </div>

        {/* Where to Buy Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">📚 ¿Dónde conseguirlo?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Argentina */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4 h-20">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-xl">🇦🇷 Envíos dentro de Argentina</CardTitle>
                </div>
                <CardDescription>
                  Pedilo en tu librería amiga. Deciles que lo encarguen a través de Editorial Galerna 🧡
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                    <Link
                      href="https://www.galernaweb.com/productos/renuncio-eliana-bracciaforte/?utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=argentina_galerna"
                      target="_blank"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />🛒 Editorial Galerna
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      href="https://cuspide.com/producto/renuncio/?utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=argentina_cuspide"
                      target="_blank"
                    >
                      🛍️ Cúspide
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      href="https://www.yenny-elateneo.com/productos/renuncio/?utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=argentina_yenny"
                      target="_blank"
                    >
                      📖 Yenny / El Ateneo
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* International */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4 h-20">
                  <Globe className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-xl">🌎 Versión impresa en otros países</CardTitle>
                </div>
                <CardDescription>Disponible para envío internacional</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                    <Link
                      href="https://www.buscalibre.com.ar/libro-renuncio/9786316632524/p/64318014?utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=internacional_buscalibre"
                      target="_blank"
                    >
                      <Globe className="mr-2 h-4 w-4" />🌍 Buscalibre
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* E-book */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2 mb-4 h-20">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                  <CardTitle className="text-xl">📱 Versión e-book</CardTitle>
                </div>
                <CardDescription>Disponible en formato digital</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                    <Link
                      href="https://www.amazon.com/Renuncio-Cambiar-trabajo-recuperar-Spanish-ebook/dp/B0FC364QY4/?utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=ebook_amazon"
                      target="_blank"
                    >
                      <Smartphone className="mr-2 h-4 w-4" />📘 Amazon Kindle
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      href="https://books.google.com.ar/books?id=A6xjEQAAQBAJ&utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=ebook_google"
                      target="_blank"
                    >
                      📗 Google Books
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link
                      href="https://books.apple.com/search?term=renuncio%20eliana%20bracciaforte&utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=ebook_apple"
                      target="_blank"
                    >
                      📕 Apple Books
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Book Description */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-orange-500">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Sobre el libro</h3>
            <div className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                Según cálculos optimistas, dedicaremos una gran parte de nuestra vida a trabajar. ¿Cómo invertimos ese
                tiempo vital? ¿Qué significado les damos a las incontables horas y días dedicados al trabajo? Este libro
                nace de una premisa fundamental: transformar el trabajo en un motor de bienestar y realización personal.
              </p>
              <p>
                La idea de un trabajo gratificante suele percibirse como un privilegio reservado a unos pocos. Si bien
                esto es posible, no debe suceder necesariamente así, ya que el poder de transformar esa percepción está
                en nosotros. Por eso, este libro es a la vez una guía y una invitación a la acción: a reclamar las
                oportunidades, a tomar decisiones audaces, a atreverse a poner fin a contextos laborales tóxicos y
                abusivos, y a diseñar una trayectoria profesional que, con determinación, te lleve al trabajo que te
                haga sentir reconocido y motivado.
              </p>
              <p>
                Combinando la solidez de su trayectoria en el mundo laboral con la riqueza de su propia vivencia, Eliana
                Bracciaforte ha creado una hoja de ruta concreta y organizada para quienes anhelan un trabajo que
                trascienda la simple obligación, un trabajo integrado al resto de nuestra vida, que nos potencie, que
                nos complemente y que nos ayude a vivir como queremos.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">¿Listo para transformar tu relación con el trabajo?</h3>
            <p className="text-xl mb-8 opacity-90">
              Comienza tu viaje hacia un trabajo que te haga sentir reconocido y motivado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                <Link
                  href="https://www.galernaweb.com/productos/renuncio-eliana-bracciaforte/?utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=cta_final_fisico"
                  target="_blank"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Comprar libro físico
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-orange-600"
              >
                <Link
                  href="https://www.amazon.com/Renuncio-Cambiar-trabajo-recuperar-Spanish-ebook/dp/B0FC364QY4/?utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=cta_final_ebook"
                  target="_blank"
                >
                  <Smartphone className="mr-2 h-5 w-5" />
                  Comprar e-book
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
