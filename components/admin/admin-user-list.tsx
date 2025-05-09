"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Ban, CheckCircle, AlertTriangle, Shield, ShieldOff } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { banUser, unbanUser, makeAdmin, removeAdmin } from "@/lib/actions"
import type { AdminUser } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export function AdminUserList({ users }: { users: AdminUser[] }) {
  const [userList, setUserList] = useState(users)
  const [userToAction, setUserToAction] = useState<{
    user: AdminUser
    action: "ban" | "unban" | "makeAdmin" | "removeAdmin"
  } | null>(null)
  const { toast } = useToast()

  const handleBanUser = async (userId: string) => {
    try {
      await banUser(userId)
      setUserList((prev) => prev.map((user) => (user.id === userId ? { ...user, is_banned: true } : user)))
      setUserToAction(null)
      toast({
        title: "Usuario suspendido",
        description: "El usuario ha sido suspendido correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al suspender al usuario",
        variant: "destructive",
      })
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser(userId)
      setUserList((prev) => prev.map((user) => (user.id === userId ? { ...user, is_banned: false } : user)))
      setUserToAction(null)
      toast({
        title: "Usuario restaurado",
        description: "El usuario ha sido restaurado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al restaurar al usuario",
        variant: "destructive",
      })
    }
  }

  const handleMakeAdmin = async (userId: string) => {
    try {
      await makeAdmin(userId)
      setUserList((prev) => prev.map((user) => (user.id === userId ? { ...user, is_admin: true } : user)))
      setUserToAction(null)
      toast({
        title: "Administrador añadido",
        description: "El usuario ahora es administrador",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al hacer administrador al usuario",
        variant: "destructive",
      })
    }
  }

  const handleRemoveAdmin = async (userId: string) => {
    try {
      await removeAdmin(userId)
      setUserList((prev) => prev.map((user) => (user.id === userId ? { ...user, is_admin: false } : user)))
      setUserToAction(null)
      toast({
        title: "Administrador eliminado",
        description: "El usuario ya no es administrador",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al quitar permisos de administrador",
        variant: "destructive",
      })
    }
  }

  if (userList.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay usuarios registrados.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {userList.map((user) => (
          <div key={user.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{user.email}</h3>
                  {user.is_admin && <Badge className="bg-purple-600">Administrador</Badge>}
                  {user.is_banned && <Badge variant="destructive">Suspendido</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Usuario: {user.username || "Sin nombre de usuario"} • Registrado:{" "}
                  {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: es })}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{user.stories_count} historias</Badge>
                  <Badge variant="outline">{user.comments_count} comentarios</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.is_banned ? (
                  <Button
                    onClick={() => setUserToAction({ user, action: "unban" })}
                    variant="outline"
                    size="sm"
                    className="text-green-500"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Restaurar
                  </Button>
                ) : (
                  <Button
                    onClick={() => setUserToAction({ user, action: "ban" })}
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Suspender
                  </Button>
                )}

                {user.is_admin ? (
                  <Button onClick={() => setUserToAction({ user, action: "removeAdmin" })} variant="outline" size="sm">
                    <ShieldOff className="h-4 w-4 mr-1" />
                    Quitar Admin
                  </Button>
                ) : (
                  <Button onClick={() => setUserToAction({ user, action: "makeAdmin" })} variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-1" />
                    Hacer Admin
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!userToAction} onOpenChange={(open) => !open && setUserToAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {userToAction?.action === "ban" && "Confirmar suspensión"}
              {userToAction?.action === "unban" && "Confirmar restauración"}
              {userToAction?.action === "makeAdmin" && "Confirmar nuevo administrador"}
              {userToAction?.action === "removeAdmin" && "Confirmar eliminación de administrador"}
            </DialogTitle>
            <DialogDescription>
              {userToAction?.action === "ban" &&
                "¿Estás seguro de que quieres suspender a este usuario? No podrá iniciar sesión ni publicar contenido."}
              {userToAction?.action === "unban" &&
                "¿Estás seguro de que quieres restaurar a este usuario? Podrá volver a iniciar sesión y publicar contenido."}
              {userToAction?.action === "makeAdmin" &&
                "¿Estás seguro de que quieres hacer administrador a este usuario? Tendrá acceso completo al panel de administración."}
              {userToAction?.action === "removeAdmin" &&
                "¿Estás seguro de que quieres quitar los permisos de administrador a este usuario?"}
            </DialogDescription>
          </DialogHeader>

          {userToAction && (
            <div className="py-4">
              <p className="font-medium">{userToAction.user.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Usuario: {userToAction.user.username || "Sin nombre de usuario"}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToAction(null)}>
              Cancelar
            </Button>
            {userToAction?.action === "ban" && (
              <Button variant="destructive" onClick={() => userToAction && handleBanUser(userToAction.user.id)}>
                Suspender Usuario
              </Button>
            )}
            {userToAction?.action === "unban" && (
              <Button variant="default" onClick={() => userToAction && handleUnbanUser(userToAction.user.id)}>
                Restaurar Usuario
              </Button>
            )}
            {userToAction?.action === "makeAdmin" && (
              <Button variant="default" onClick={() => userToAction && handleMakeAdmin(userToAction.user.id)}>
                Hacer Administrador
              </Button>
            )}
            {userToAction?.action === "removeAdmin" && (
              <Button variant="destructive" onClick={() => userToAction && handleRemoveAdmin(userToAction.user.id)}>
                Quitar Administrador
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
