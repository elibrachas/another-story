import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Smartphone, Globe, MapPin, ShoppingCart, Star, Quote, Heart, Users } from "lucide-react"
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

export default function MiLibro2Page() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_theme(colors.orange.400)_1px,_transparent_0)] bg-[size:20px_20px]"></div>
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                  <Star className="h-4 w-4 fill-current" />
                  Bestseller en desarrollo profesional
                </div>

                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    RENUNCIO
                  </span>
                </h1>

                <h2 className="text-2xl lg:text-3xl font-light text-gray-700 leading-relaxed">
                  Cambiar de trabajo y recuperar tu vida
                </h2>

                <p className="text-lg text-gray-600 font-medium">
                  por <span className="text-orange-600 font-semibold">Eliana Bracciaforte</span>
                </p>
              </div>

              <div className="space-y-6">
                <blockquote className="text-xl lg:text-2xl font-light text-gray-800 italic leading-relaxed">
                  "¿Y si renunciar no fuera el final, sino el comienzo?"
                </blockquote>

                <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                  Una guía íntima y poderosa para quienes se preguntan si están donde quieren estar. Transforma tu
                  relación con el trabajo y recupera tu vida.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="#comprar">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Conseguir el libro
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg rounded-full bg-transparent"
                >
                  <Link href="#sobre-libro">Leer más</Link>
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-400 border-2 border-white"
                      ></div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">+1000 lectores</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">4.8/5</span>
                </div>
              </div>
            </div>

            {/* Right Content - Book Image */}
            <div className="relative">
              <div className="relative mx-auto max-w-md lg:max-w-lg">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-red-200 to-orange-200 rounded-full opacity-40 animate-pulse delay-1000"></div>

                {/* Book Image Container */}
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                  <div className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src="/images/renuncio-header-small.jpg"
                      alt="RENUNCIO - Cambiar de trabajo y recuperar tu vida por Eliana Bracciaforte"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-orange-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-orange-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About the Book Section */}
      <section id="sobre-libro" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">Sobre el libro</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-red-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl">
                  <Quote className="h-8 w-8 text-orange-600 mb-4" />
                  <p className="text-lg text-gray-700 leading-relaxed italic">
                    "Este libro es una invitación a repensar nuestra relación con el trabajo. A reconocer cuándo el
                    costo de sostener un empleo es más alto que el de soltarlo."
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Una guía práctica</strong> para transformar tu relación con el trabajo y convertirlo en un
                      motor de bienestar.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Herramientas concretas</strong> para tomar decisiones audaces y diseñar tu trayectoria
                      profesional ideal.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-3 flex-shrink-0"></div>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Experiencia real</strong> combinada con la solidez profesional de años en el mundo
                      laboral.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">¿Para quién es este libro?</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-red-500 flex-shrink-0" />
                      Personas que sienten que su trabajo no las representa
                    </li>
                    <li className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-red-500 flex-shrink-0" />
                      Quienes buscan un cambio profesional significativo
                    </li>
                    <li className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-red-500 flex-shrink-0" />
                      Profesionales en contextos laborales tóxicos
                    </li>
                    <li className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-red-500 flex-shrink-0" />
                      Cualquiera que quiera integrar trabajo y vida personal
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-xl text-white">
                  <h3 className="text-xl font-semibold mb-2">Lo que vas a encontrar</h3>
                  <p className="opacity-90">
                    Una hoja de ruta concreta y organizada para quienes anhelan un trabajo que trascienda la simple
                    obligación.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">Lo que dicen los lectores</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-red-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                text: "Un libro que llegó en el momento perfecto. Me ayudó a tomar la decisión más importante de mi carrera.",
                author: "María González",
                role: "Gerente de Marketing",
              },
              {
                text: "Eliana logra combinar experiencia profesional con una narrativa muy humana. Altamente recomendado.",
                author: "Carlos Mendoza",
                role: "Consultor IT",
              },
              {
                text: "Finalmente un libro que habla de trabajo desde la perspectiva del bienestar personal. Transformador.",
                author: "Ana Rodríguez",
                role: "Directora de RRHH",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-4 italic leading-relaxed">"{testimonial.text}"</blockquote>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-800">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Where to Buy Section */}
      <section id="comprar" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800">Conseguí tu ejemplar</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-red-600 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Disponible en formato físico y digital. Elegí la opción que más te convenga.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Argentina */}
              <Card className="h-full flex flex-col border-2 hover:border-orange-200 transition-colors duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">🇦🇷 Argentina</CardTitle>
                  <CardDescription className="text-base">
                    Envíos a todo el país. Pedilo en tu librería amiga a través de Editorial Galerna.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  >
                    <Link
                      href="https://www.galernaweb.com/productos/renuncio-eliana-bracciaforte/?utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=argentina_galerna"
                      target="_blank"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Editorial Galerna
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full hover:bg-orange-50 hover:border-orange-300 bg-transparent"
                  >
                    <Link
                      href="https://cuspide.com/producto/renuncio/?utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=argentina_cuspide"
                      target="_blank"
                    >
                      Cúspide
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full hover:bg-orange-50 hover:border-orange-300 bg-transparent"
                  >
                    <Link
                      href="https://www.yenny-elateneo.com/productos/renuncio/?utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=argentina_yenny"
                      target="_blank"
                    >
                      Yenny / El Ateneo
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* International */}
              <Card className="h-full flex flex-col border-2 hover:border-orange-200 transition-colors duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">🌎 Internacional</CardTitle>
                  <CardDescription className="text-base">
                    Envíos internacionales disponibles para lectores de todo el mundo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                  >
                    <Link
                      href="https://www.buscalibre.com.ar/libro-renuncio/9786316632524/p/64318014?utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=internacional_buscalibre"
                      target="_blank"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Buscalibre
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* E-book */}
              <Card className="h-full flex flex-col border-2 hover:border-orange-200 transition-colors duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">📱 Digital</CardTitle>
                  <CardDescription className="text-base">
                    Descarga inmediata. Leé en tu dispositivo favorito.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    <Link
                      href="https://www.amazon.com/Renuncio-Cambiar-trabajo-recuperar-Spanish-ebook/dp/B0FC364QY4/?utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=ebook_amazon"
                      target="_blank"
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Amazon Kindle
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full hover:bg-purple-50 hover:border-purple-300 bg-transparent"
                  >
                    <Link
                      href="https://books.google.com.ar/books?id=A6xjEQAAQBAJ&utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=ebook_google"
                      target="_blank"
                    >
                      Google Books
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full hover:bg-purple-50 hover:border-purple-300 bg-transparent"
                  >
                    <Link
                      href="https://books.apple.com/search?term=renuncio%20eliana%20bracciaforte&utm_source=cronicaslaborales&utm_medium=website&utm_campaign=libro_renuncio&utm_content=ebook_apple"
                      target="_blank"
                    >
                      Apple Books
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">¿Listo para transformar tu vida laboral?</h2>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
              Comienza tu viaje hacia un trabajo que te haga sentir reconocido, motivado y pleno.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button
                asChild
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
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
                className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-6 text-lg rounded-full transition-all duration-300 bg-transparent"
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

            <div className="flex items-center justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>+1000 lectores</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span>4.8/5 estrellas</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
