export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">Política de Privacidad de Crónicas Laborales</h1>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="lead">
          En www.cronicaslaborales.com valoramos tu privacidad y nos comprometemos a proteger tus datos personales. A
          continuación, te contamos de forma clara y sencilla cómo recopilamos, usamos y protegemos tu información.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. ¿Qué datos recopilamos?</h2>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>
            <strong>Información de registro:</strong> nombre de usuario, correo electrónico y contraseña (en forma
            encriptada) cuando creas una cuenta.
          </li>
          <li>
            <strong>Contenido de usuario:</strong> historias anónimas, comentarios y votos que envías o realizas en la
            plataforma.
          </li>
          <li>
            <strong>Datos de uso:</strong> información técnica sobre tu navegador y dispositivo, páginas visitadas,
            fecha y hora de acceso, con fines de análisis y mejora del servicio.
          </li>
          <li>
            <strong>Cookies y tecnologías similares:</strong> para recordar tu sesión, preferencias de idioma y
            configuración de visualización.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. ¿Para qué usamos tus datos?</h2>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>
            <strong>Autenticación y seguridad:</strong> gestionar tu cuenta, verificar tu identidad y proteger tu
            información.
          </li>
          <li>
            <strong>Publicación y votación:</strong> mostrar tus historias y contabilizar tus votos de manera correcta.
          </li>
          <li>
            <strong>Comunicación:</strong> enviarte correos electrónicos de confirmación, notificaciones importantes y
            actualizaciones del sitio.
          </li>
          <li>
            <strong>Mejora del servicio:</strong> analizar patrones de uso para optimizar la experiencia de navegación y
            desempeño de la plataforma.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. ¿Compartimos tu información?</h2>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>No vendemos tus datos a terceros.</li>
          <li>
            <strong>Proveedores de servicios:</strong> podemos compartir datos con empresas que nos ayudan a operar el
            sitio (hosting, envíos de correo, análisis de datos). Estos proveedores están obligados a tratar tus datos
            de manera confidencial.
          </li>
          <li>
            <strong>Requerimientos legales:</strong> si la ley lo exige o para proteger nuestros derechos en procesos
            judiciales.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. ¿Cómo protegemos tu información?</h2>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>
            <strong>Encriptación:</strong> tus contraseñas se almacenan cifradas y las conexiones al sitio usan HTTPS.
          </li>
          <li>
            <strong>RLS y políticas en Supabase:</strong> control de acceso a base de datos para evitar lecturas o
            escrituras no autorizadas.
          </li>
          <li>
            <strong>Auditorías y actualizaciones:</strong> revisamos periódicamente nuestras medidas de seguridad y
            aplicamos parches cuando es necesario.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Tus derechos</h2>
        <ul className="list-disc pl-6 my-4 space-y-2">
          <li>
            <strong>Acceso:</strong> puedes solicitar una copia de tus datos personales.
          </li>
          <li>
            <strong>Rectificación:</strong> corregir información inexacta o incompleta.
          </li>
          <li>
            <strong>Eliminación:</strong> pedir que borremos tu cuenta y datos asociados.
          </li>
          <li>
            <strong>Oposición y restricción:</strong> limitar el uso de tus datos para ciertos fines.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Conservación de datos</h2>
        <p>
          Mantendremos tu información activa mientras tu cuenta exista y por el tiempo necesario para cumplir con
          propósitos legales, resolver conflictos y hacer cumplir nuestros Términos de Servicio.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cambios en esta Política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad en cualquier momento. Publicaremos la versión revisada con la
          nueva fecha y, si los cambios son significativos, te lo comunicaremos por correo.
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
