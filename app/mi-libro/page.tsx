import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, BookOpen, Globe, Smartphone } from "lucide-react"
import { addUtmParams } from "@/lib/utm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "RENUNCIO - Cambiar de trabajo y recuperar tu vida | Eliana Bracciaforte",
  description:
    "Descubre cómo transformar tu relación con el trabajo. Una guía íntima y poderosa para tomar decisiones valientes y recuperar tu vida.",
  keywords: ["renuncio", "eliana bracciaforte", "cambiar trabajo", "libro trabajo", "desarrollo profesional"],
  openGraph: {
    title: "RENUNCIO - Cambiar de trabajo y recuperar tu vida",
    description: "Una guía íntima y poderosa para transformar tu relación con el trabajo",
    images: ["/images/renuncio-header-small.jpg"],
  },
}

export default function MiLibroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-12">
          <div className="relative">
            <Image
              src="/images/renuncio-header-small.jpg"
              alt="RENUNCIO - Eliana Bracciaforte"
              width={1200}
              height={400}
              className="w-full h-[300px] md:h-[400px] object-cover rounded-2xl shadow-2xl"
              priority
            />
            <div className="absolute inset-0 bg-black/20 rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title and Subtitle */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-4">
              ✨ RENUNCIO
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Cambiar de trabajo y recuperar tu vida
            </h2>
            <p className="text-xl text-orange-600 dark:text-orange-400 font-medium">Eliana Bracciaforte</p>
          </div>

          {/* Book Description */}
          <div className="mb-12">
            <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
                  ¿Y si renunciar no fuera el final, sino el comienzo?
                </h3>
                <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                  <p className="text-lg leading-relaxed mb-4">
                    Este libro es una invitación a repensar nuestra relación con el trabajo. A reconocer cuándo el costo
                    de sostener un empleo es más alto que el de soltarlo. A tomar decisiones valientes, informadas y
                    humanas.
                  </p>
                  <p className="text-lg leading-relaxed font-medium text-orange-600 dark:text-orange-400">
                    "Renuncio" no es solo una historia, es una guía íntima y poderosa para quienes se preguntan si están
                    donde quieren estar.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Where to Get It */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
              📚 ¿Dónde conseguirlo?
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Argentina Section */}
              <Card className="border-orange-200 dark:border-orange-800 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 h-20">
                    <span className="text-2xl">🇦🇷</span>
                    <h4 className="text-xl font-semibold">Envíos dentro de Argentina</h4>
                  </div>
                  <div className="space-y-3 flex-grow">
                    <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                      <Link
                        href={addUtmParams(
                          "https://www.galernaweb.com/productos/renuncio-eliana-bracciaforte/"
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Editorial Galerna 🧡
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href={addUtmParams("https://cuspide.com/producto/renuncio/")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🛍️ Cúspide
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href={addUtmParams(
                          "https://www.yenny-elateneo.com/productos/renuncio/"
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📖 Yenny / El Ateneo
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* International Section */}
              <Card className="border-blue-200 dark:border-blue-800 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 h-20">
                    <span className="text-2xl">🌎</span>
                    <h4 className="text-xl font-semibold">Versión impresa en otros países</h4>
                  </div>
                  <div className="space-y-3 flex-grow">
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                      <Link
                        href={addUtmParams(
                          "https://www.buscalibre.com.ar/libro-renuncio/9786316632524/p/64318014"
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="mr-2 h-4 w-4" />🌍 Buscalibre
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* E-book Section */}
              <Card className="border-purple-200 dark:border-purple-800 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 h-20">
                    <span className="text-2xl">📱</span>
                    <h4 className="text-xl font-semibold">Versión e-book</h4>
                  </div>
                  <div className="space-y-3 flex-grow">
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                      <Link
                        href={addUtmParams(
                          "https://www.amazon.com/Renuncio-Cambiar-trabajo-recuperar-Spanish-ebook/dp/B0FC364QY4/"
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Smartphone className="mr-2 h-4 w-4" />📘 Amazon Kindle
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link
                        href={addUtmParams(
                          "https://books.google.com.ar/books?id=A6xjEQAAQBAJ&newbks=0&lpg=PT29&dq=renuncio%20cambiar%20de%20trabajo%20y%20recuperar%20tu%20vida&pg=PA1#v=onepage&q&f=false"
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📗 Google Books
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="#" target="_blank" rel="noopener noreferrer">
                        📕 Apple Books
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Librería Amiga */}
            <Card className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-orange-300 dark:border-orange-700">
              <CardContent className="p-6 text-center">
                <h4 className="text-xl font-semibold mb-2 text-orange-800 dark:text-orange-200">
                  📚 Pedilo en tu librería amiga
                </h4>
                <p className="text-orange-700 dark:text-orange-300">
                  Deciles que lo encarguen a través de <strong>Editorial Galerna</strong> 🧡
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Back Cover Text */}
          <div className="mb-12">
            <Card className="border-none shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">Sobre el libro</h3>
                <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 space-y-4">
                  <p>
                    Según cálculos optimistas, dedicaremos una gran parte de nuestra vida a trabajar. ¿Cómo invertimos
                    ese tiempo vital? ¿Qué significado les damos a las incontables horas y días dedicados al trabajo?
                    Este libro nace de una premisa fundamental: transformar el trabajo en un motor de bienestar y
                    realización personal.
                  </p>
                  <p>
                    La idea de un trabajo gratificante suele percibirse como un privilegio reservado a unos pocos. Si
                    bien esto es posible, no debe suceder necesariamente así, ya que el poder de transformar esa
                    percepción está en nosotros. Por eso, este libro es a la vez una guía y una invitación a la acción:
                    a reclamar las oportunidades, a tomar decisiones audaces, a atreverse a poner fin a contextos
                    laborales tóxicos y abusivos, y a diseñar una trayectoria profesional que, con determinación, te
                    lleve al trabajo que te haga sentir reconocido y motivado.
                  </p>
                  <p>
                    Combinando la solidez de su trayectoria en el mundo laboral con la riqueza de su propia vivencia,
                    Eliana Bracciaforte ha creado una hoja de ruta concreta y organizada para quienes anhelan un trabajo
                    que trascienda la simple obligación, un trabajo integrado al resto de nuestra vida, que nos
                    potencie, que nos complemente y que nos ayude a vivir como queremos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="border-none shadow-xl bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">¿Listo para transformar tu relación con el trabajo?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Consigue tu copia de "Renuncio" y comienza el camino para recuperar tu vida.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                    <Link
                      href={addUtmParams(
                        "https://www.galernaweb.com/productos/renuncio-eliana-bracciaforte/"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Comprar libro físico
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                    <Link
                      href={addUtmParams(
                        "https://www.amazon.com/Renuncio-Cambiar-trabajo-recuperar-Spanish-ebook/dp/B0FC364QY4/"
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Comprar e-book
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
