export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">Términos de Servicio de Crónicas Laborales</h1>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="lead">
          Bienvenido a www.cronicaslaborales.com. Estos Términos de Servicio ("Términos") regulan tu uso de nuestro
          sitio y servicios. Por favor, léelos con atención.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Aceptación de los Términos</h2>
        <p>
          Al acceder o utilizar Crónicas Laborales, aceptas estos Términos en su totalidad y te comprometes a
          cumplirlos. Si no estás de acuerdo, por favor no uses nuestro sitio.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Descripción del servicio</h2>
        <p>
          Crónicas Laborales es una plataforma donde los usuarios pueden leer, compartir y votar historias reales de
          situaciones laborales tóxicas. Nuestro propósito es ofrecer un espacio anónimo y seguro para visibilizar
          experiencias y fomentar la reflexión.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Registro y cuentas de usuario</h2>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Para votar y acceder a funciones avanzadas, debes crear una cuenta.</li>
          <li>Debes proporcionar información veraz al registrarte.</li>
          <li>Eres responsable de mantener la confidencialidad de tus datos de acceso.</li>
          <li>No permitas que otros usen tu cuenta.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Envío de contenido</h2>
        <p>Todas las historias enviadas deben ser relatos de experiencias laborales reales.</p>
        <p>No se permite contenido con:</p>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Descripciones sexuales explícitas.</li>
          <li>Discurso de odio, amenazas o ataques personales.</li>
          <li>Información que identifique directamente a terceras personas sin su consentimiento.</li>
        </ul>
        <p>
          Al enviar contenido, garantizas que tienes los derechos necesarios y otorgas a Crónicas Laborales licencia
          para mostrarlo y distribuirlo en la plataforma.
        </p>
        <p>
          <strong>Uso en redes sociales:</strong> Al compartir tu historia, autorizas a Crónicas Laborales a seleccionar
          y compartir dicho contenido en las redes sociales oficiales de Crónicas Laborales y en las redes personales de
          Eliana Bracciaforte. Siempre mantendremos el anonimato de las historias y respetaremos la integridad del
          contenido original.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Moderación y publicación</h2>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>
            Las historias se someten a un proceso de revisión y edición (incluyendo limpieza de estilo con GPT) antes de
            su publicación.
          </li>
          <li>
            El equipo de Crónicas Laborales puede rechazar, editar o eliminar cualquier contenido que viole estos
            Términos.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Votaciones y participación</h2>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Cada usuario puede votar una vez por historia.</li>
          <li>Los votos deben reflejar una opinión personal y genuina.</li>
          <li>No se tolerará manipulación de votos o conductas fraudulentas.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Comentarios y comunicación entre usuarios</h2>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>Los comentarios deben ser respetuosos y constructivos en todo momento.</li>
          <li>No se permite lenguaje ofensivo, insultos, amenazas o cualquier forma de comunicación violenta.</li>
          <li>Está prohibido el acoso a otros usuarios o la incitación a conductas negativas.</li>
          <li>
            Los comentarios deben estar relacionados con el contenido de las historias o aportar valor a la
            conversación.
          </li>
          <li>
            Todos los comentarios están sujetos a moderación y pueden ser editados o eliminados si violan estas normas.
          </li>
          <li>
            Los usuarios que incumplan repetidamente estas normas pueden ver restringido su acceso a la plataforma.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Propiedad intelectual</h2>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>
            El contenido publicado es propiedad de sus autores, pero con licencia para que Crónicas Laborales lo muestre
            y distribuya.
          </li>
          <li>
            Los nombres, marcas y logotipos de Crónicas Laborales están protegidos por derechos de autor y no podrán
            usarse sin autorización.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Privacidad</h2>
        <p>Consulta nuestra Política de Privacidad para entender cómo recopilamos y usamos tus datos.</p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Limitación de responsabilidad</h2>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>
            Crónicas Laborales no se hace responsable por daños directos, indirectos o derivados del uso del sitio.
          </li>
          <li>No garantizamos la precisión absoluta de las historias ni asumimos responsabilidad por su contenido.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Cambios en los Términos</h2>
        <p>
          Podemos modificar estos Términos en cualquier momento. Publicaremos la versión actualizada en el sitio y la
          fecha de revisión. Tu uso continuado constituye aceptación de los cambios.
        </p>

        <div className="mt-10 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <p className="text-sm text-center">
            Última actualización:{" "}
            {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  )
}
