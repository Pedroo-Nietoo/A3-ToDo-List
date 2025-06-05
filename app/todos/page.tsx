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
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getTodos, addTodo, toggleTodo, deleteTodo, type Todo } from "@/lib/todos"

export default function TodosPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")

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

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">My Todos</h1>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} tasks completed
            </p>
          </div>
        </header>
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Today's Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleAddTodo} className="flex gap-3">
                  <Input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="What needs to be done?"
                    className="flex-1 h-11"
                  />
                  <Button type="submit" size="default" className="px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </form>

                <div className="space-y-3">
                  {todos.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                      <p className="text-muted-foreground">Add your first task above to get started!</p>
                    </div>
                  ) : (
                    todos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 ${
                          todo.completed ? "opacity-60 bg-muted/30" : "hover:border-primary/20"
                        }`}
                      >
                        <Checkbox
                          id={`todo-${todo.id}`}
                          checked={todo.completed}
                          onCheckedChange={() => handleToggleTodo(todo.id)}
                          className="h-5 w-5"
                        />
                        <label
                          htmlFor={`todo-${todo.id}`}
                          className={`flex-1 cursor-pointer text-sm font-medium ${
                            todo.completed ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {todo.text}
                        </label>
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

                {totalCount > 0 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">{totalCount} total tasks</div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-muted rounded-full w-32">
                        <div
                          className="h-2 bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                      </span>
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
