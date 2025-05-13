"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Users, BookOpen, MessageSquare, ThumbsUp } from "lucide-react"
import { getAppStats } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"

type Stats = {
  totalStories: number
  pendingStories: number
  publishedStories: number
  totalComments: number
  totalUsers: number
  newUsers: number
  totalUpvotes: number
}

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const loadStats = async () => {
    try {
      setLoading(true)
      const result = await getAppStats()

      if (!result.success) {
        throw new Error(result.error || "Error al cargar estadísticas")
      }

      setStats(result.stats)
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar estadísticas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await loadStats()
      toast({
        title: "Estadísticas actualizadas",
        description: "Las estadísticas se han actualizado correctamente",
      })
    } catch (error) {
      // Error ya manejado en loadStats
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">Cargando estadísticas...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se pudieron cargar las estadísticas.</p>
        <Button onClick={handleRefresh} className="mt-4">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2" disabled={refreshing}>
          {refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usuarios Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{stats.newUsers} nuevos en los últimos 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Historias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalStories}</div>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.publishedStories} publicadas, {stats.pendingStories} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comentarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalComments}</div>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(stats.totalComments / Math.max(stats.publishedStories, 1)).toFixed(1)} comentarios por historia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Votos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalUpvotes}</div>
              <ThumbsUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(stats.totalUpvotes / Math.max(stats.publishedStories, 1)).toFixed(1)} votos por historia
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
