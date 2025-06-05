"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/components/auth-provider"
import { Plus, Trash2, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { getTodos, addTodo, toggleTodo, deleteTodo, updateTodo, saveDeletedTodos, getDeletedTodos, type Todo } from "@/lib/todos"

import confetti from "canvas-confetti"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function TodosPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [editTodoText, setEditTodoText] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
      return
    }

    if (user) {
      setTodos(getTodos(user.id))
    }
  }, [user, loading, router])

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim() && user) {
      const todo = addTodo(user.id, newTodo.trim())
      setTodos((prev) => [...prev, todo])
      setNewTodo("")
    }
  }

  const handleToggleTodo = (todoId: string) => {
    if (user) {
      toggleTodo(user.id, todoId)
      setTodos((prev) => prev.map((todo) => (todo.id === todoId ? { ...todo, completed: !todo.completed } : todo)))
    }
  }

  const handleDeleteTodo = (todoId: string) => {
    if (user) {
      deleteTodo(user.id, todoId)
      setTodos((prev) => prev.filter((todo) => todo.id !== todoId))
    }
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodoId(todo.id)
    setEditTodoText(todo.text)
  }

  const handleSaveEdit = (todoId: string) => {
    if (editTodoText.trim() && user) {
      updateTodo(user.id, todoId, editTodoText.trim())
      setTodos((prev) =>
        prev.map((todo) => (todo.id === todoId ? { ...todo, text: editTodoText.trim() } : todo))
      )
      setEditingTodoId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingTodoId(null)
  }

  const handleDeleteAllTodos = () => {
    if (user) {
      const deletedTodos = todos.map((todo) => ({
        ...todo,
        deletedAt: new Date().toISOString(),
      }))
      saveDeletedTodos(user.id, [
        ...getDeletedTodos(user.id),
        ...deletedTodos,
      ])
      setTodos([])
      localStorage.removeItem(`todos_${user.id}`)
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  useEffect(() => {
    if (percentage === 100 && totalCount > 0) {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      }, 250)
    }
  }, [percentage, totalCount])

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
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Minhas Tarefas</h1>
            <p className="text-sm text-muted-foreground">
              {completedCount} de {totalCount} tarefas concluídas
            </p>
          </div>
        </header>
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Tarefas do Dia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleAddTodo} className="flex gap-3">
                  <Input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="O que precisa ser feito?"
                    className="flex-1 h-11"
                  />
                  <Button type="submit" size="default" className="px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Tarefa
                  </Button>
                </form>

                <ScrollArea className="h-[600px] rounded-md border p-4">
                  <div className="space-y-3">
                    {todos.length === 0 ? (
                      <div className="text-center py-52">
                        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                          <Plus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Nenhuma tarefa cadastrada</h3>
                        <p className="text-muted-foreground">Adicione sua primeira tarefa acima para começar!</p>
                      </div>
                    ) : (
                      todos.map((todo) => (
                        <div
                          key={todo.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 ${todo.completed ? "opacity-60 bg-muted/30" : "hover:border-primary/20"
                            }`}
                        >
                          <Checkbox
                            id={`todo-${todo.id}`}
                            checked={todo.completed}
                            onCheckedChange={() => handleToggleTodo(todo.id)}
                            className="h-5 w-5"
                          />

                          {editingTodoId === todo.id ? (
                            <Input
                              value={editTodoText}
                              onChange={(e) => setEditTodoText(e.target.value)}
                              onBlur={() => handleSaveEdit(todo.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  handleSaveEdit(todo.id)
                                } else if (e.key === "Escape") {
                                  handleCancelEdit()
                                }
                              }}
                              className="flex-1 text-sm"
                              autoFocus
                            />
                          ) : (
                            <label
                              htmlFor={`todo-${todo.id}`}
                              className={`flex-1 cursor-pointer text-sm font-medium ${todo.completed ? "line-through text-muted-foreground" : ""
                                }`}
                              onDoubleClick={() => handleEditTodo(todo)}
                            >
                              {todo.text}
                            </label>
                          )}

                          {editingTodoId !== todo.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTodo(todo)}
                              className="text-muted-foreground hover:text-primary h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {totalCount > 0 && (
                  <div className="flex flex-col gap-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {totalCount} {totalCount === 1 ? 'tarefa' : 'tarefas'} no total
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-muted rounded-full w-32">
                          <div
                            className="h-2 bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        className="text-destructive hover:text-destructive/80"
                        onClick={handleDeleteAllTodos}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir todas as tarefas
                      </Button>
                    </div>
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
