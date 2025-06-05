"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/components/auth-provider"
import { RotateCcw, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  getDeletedTodos,
  restoreTodo,
  permanentlyDeleteTodo,
  type DeletedTodo,
  permanentlyDeleteAllTodos,
} from "@/lib/todos"
import { toast } from "sonner"
import { ConfirmAlertDialog } from "@/components/confirm-alert-dialog"

export default function TrashPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [deletedTodos, setDeletedTodos] = useState<DeletedTodo[]>([])
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
      return
    }

    if (user) {
      setDeletedTodos(getDeletedTodos(user.id))
    }
  }, [user, loading, router])

  const handleRestoreTodo = (todoId: string) => {
    try {
      if (user) {
        restoreTodo(user.id, todoId)
        setDeletedTodos((prev) => prev.filter((todo) => todo.id !== todoId))
        toast.success("Tarefa restaurada com sucesso!", {
          duration: 5000,
          description: "A tarefa foi movida de volta para a lista ativa.",
        })
      }
    } catch (error) {
      toast.error("Erro ao restaurar a tarefa.")
    }
  }

  const handlePermanentDelete = (todoId: string) => {
    try {
      if (user) {
        permanentlyDeleteTodo(user.id, todoId)
        setDeletedTodos((prev) => prev.filter((todo) => todo.id !== todoId))
        toast.success("Tarefa excluída permanentemente!", {
          duration: 5000,
          description: "A tarefa foi removida permanentemente da lixeira.",
        })
      }
    } catch (error) {
      toast.error("Erro ao excluir a tarefa.")
    }
  }

  const handleDeleteAll = () => {
    try {
      if (user) {
        permanentlyDeleteAllTodos(user.id)
        setDeletedTodos([])
        setIsDeleteAllOpen(false)
        toast.success("Todas as tarefas foram excluídas permanentemente!", {
          duration: 5000,
          description: "A lixeira foi esvaziada.",
        })
      }
    } catch (error) {
      toast.error("Erro ao excluir todas as tarefas.")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Lixeira</h1>
              <p className="text-sm text-muted-foreground">
                {deletedTodos.length} {deletedTodos.length === 1 ? "item" : "itens"} excluídos
              </p>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    Tarefas Excluídas

                  </div>
                  {deletedTodos.length > 0 && (
                    <ConfirmAlertDialog
                      title="Excluir todas as tarefas"
                      description="Deseja excluir todas as tarefas da lixeira? Esta ação é irreversível."
                      confirmText="Excluir Todas"
                      onConfirm={handleDeleteAll}
                      open={isDeleteAllOpen}
                      onOpenChange={setIsDeleteAllOpen}
                    >
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:border-red-200">
                        Excluir todas as tarefas
                      </Button>
                    </ConfirmAlertDialog>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deletedTodos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Trash2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">A lixeira está vazia</h3>
                    <p className="text-muted-foreground">As tarefas excluídas aparecerão aqui e podem ser restauradas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deletedTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}
                          >
                            {todo.text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Excluída em {formatDate(todo.deletedAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <ConfirmAlertDialog
                            title="Restaurar tarefa"
                            description="Deseja realmente restaurar esta tarefa?"
                            confirmText="Restaurar"
                            onConfirm={() => handleRestoreTodo(todo.id)}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:border-green-200"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restaurar
                            </Button>
                          </ConfirmAlertDialog>
                          <ConfirmAlertDialog
                            title="Excluir permanentemente"
                            description="Deseja excluir permanentemente? Esta ação é irreversível."
                            confirmText="Excluir"
                            onConfirm={() => handlePermanentDelete(todo.id)}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:border-red-200"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir Permanentemente
                            </Button>
                          </ConfirmAlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
