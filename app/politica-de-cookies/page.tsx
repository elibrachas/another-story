import Link from "next/link"

export const metadata = {
  title: "Política de Cookies | Crónicas Laborales",
  description: "Política de cookies de Crónicas Laborales",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export const themeColor = [
  { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  { media: "(prefers-color-scheme: dark)", color: "#000000" },
]

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">Política de Cookies</h1>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="lead">
          En Crónicas Laborales utilizamos cookies para mejorar tu experiencia de navegación. Esta política explica qué
          son las cookies, cómo las utilizamos y cómo puedes controlarlas.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet, smartphone)
          cuando visitas un sitio web. Estas cookies nos permiten reconocer tu dispositivo en visitas posteriores,
          proporcionarte una mejor experiencia y entender cómo utilizas nuestro sitio.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Tipos de cookies que utilizamos</h2>
        <h3 className="text-xl font-medium mt-6 mb-3">Cookies esenciales</h3>
        <p>
          Estas cookies son necesarias para el funcionamiento básico del sitio. Te permiten navegar por el sitio y
          utilizar sus funciones, como acceder a áreas seguras. Sin estas cookies, no podríamos proporcionar los
          servicios que has solicitado.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">Cookies de preferencias</h3>
        <p>
          Estas cookies nos permiten recordar información que cambia el aspecto o el comportamiento del sitio, como tu
          preferencia de tema (claro u oscuro) o tu estado de inicio de sesión.
        </p>

        <h3 className="text-xl font-medium mt-6 mb-3">Cookies analíticas</h3>
        <p>
          Utilizamos cookies analíticas para entender cómo interactúan los visitantes con nuestro sitio. Estas cookies
          nos ayudan a mejorar nuestro sitio al recopilar y reportar información sobre su uso.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Google Analytics</h2>
        <p>
          Utilizamos Google Analytics, un servicio de análisis web proporcionado por Google, Inc. Google Analytics
          utiliza cookies para ayudarnos a analizar cómo los usuarios utilizan nuestro sitio. La información generada
          por la cookie sobre tu uso del sitio web (incluyendo tu dirección IP) será transmitida y almacenada por Google
          en servidores en Estados Unidos.
        </p>
        <p>
          Google utilizará esta información con el propósito de evaluar tu uso del sitio web, compilar informes sobre la
          actividad del sitio web para los operadores del sitio web y proporcionar otros servicios relacionados con la
          actividad del sitio web y el uso de Internet. Google también puede transferir esta información a terceros
          cuando así lo requiera la ley, o cuando dichos terceros procesen la información en nombre de Google.
        </p>
        <p>
          Puedes optar por no ser rastreado por Google Analytics instalando el{" "}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-500 hover:underline"
          >
            complemento de inhabilitación para navegadores de Google Analytics
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Control de cookies</h2>
        <p>
          La mayoría de los navegadores web permiten cierto control de la mayoría de las cookies a través de la
          configuración del navegador. Para saber más sobre las cookies, incluyendo cómo ver qué cookies se han
          establecido y cómo gestionarlas y eliminarlas, visita{" "}
          <a
            href="https://www.allaboutcookies.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-500 hover:underline"
          >
            www.allaboutcookies.org
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies de terceros</h2>
        <p>
          En algunos casos especiales, también utilizamos cookies proporcionadas por terceros de confianza. Nuestro
          sitio utiliza servicios de análisis que nos ayudan a entender cómo utilizas el sitio y cómo podemos mejorar tu
          experiencia.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Actualizaciones a esta política</h2>
        <p>
          Podemos actualizar esta política de cookies de vez en cuando para reflejar, por ejemplo, cambios en las
          cookies que utilizamos o por otros motivos operativos, legales o regulatorios. Te animamos a que visites
          regularmente esta página para estar informado sobre el uso de cookies y las tecnologías relacionadas.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contacto</h2>
        <p>
          Si tienes alguna pregunta sobre nuestro uso de cookies, por favor contacta con nosotros a través de la sección
          de contacto en nuestra web.
        </p>

        <div className="mt-10 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <p className="text-sm text-center">
            Última actualización:{" "}
            {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-purple-500 hover:underline">
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  )
}
