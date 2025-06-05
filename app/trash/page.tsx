"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/components/auth-provider"
import { RotateCcw, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getDeletedTodos, restoreTodo, permanentlyDeleteTodo, type DeletedTodo } from "@/lib/todos"

export default function TrashPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [deletedTodos, setDeletedTodos] = useState<DeletedTodo[]>([])

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
    if (user) {
      restoreTodo(user.id, todoId)
      setDeletedTodos((prev) => prev.filter((todo) => todo.id !== todoId))
    }
  }

  const handlePermanentDelete = (todoId: string) => {
    if (user) {
      permanentlyDeleteTodo(user.id, todoId)
      setDeletedTodos((prev) => prev.filter((todo) => todo.id !== todoId))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
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
          <p className="mt-2 text-muted-foreground">Loading...</p>
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
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Trash</h1>
            <p className="text-sm text-muted-foreground">
              {deletedTodos.length} deleted {deletedTodos.length === 1 ? "item" : "items"}
            </p>
          </div>
        </header>
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Trash2 className="h-5 w-5" />
                  Deleted Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deletedTodos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Trash2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Trash is empty</h3>
                    <p className="text-muted-foreground">Deleted tasks will appear here and can be restored</p>
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
                          <p className="text-xs text-muted-foreground mt-1">Deleted on {formatDate(todo.deletedAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreTodo(todo.id)}
                            className="text-green-600 hover:text-green-700 hover:border-green-200"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePermanentDelete(todo.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-200"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete Forever
                          </Button>
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
