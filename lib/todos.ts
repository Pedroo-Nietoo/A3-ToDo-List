export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
  userId: string
}

export interface DeletedTodo extends Todo {
  deletedAt: string
}

export function getTodos(userId: string): Todo[] {
  const todos = JSON.parse(localStorage.getItem(`todos_${userId}`) || "[]")
  return todos
}

export function saveTodos(userId: string, todos: Todo[]): void {
  localStorage.setItem(`todos_${userId}`, JSON.stringify(todos))
}

export function getDeletedTodos(userId: string): DeletedTodo[] {
  const deletedTodos = JSON.parse(localStorage.getItem(`deleted_todos_${userId}`) || "[]")
  return deletedTodos
}

export function saveDeletedTodos(userId: string, deletedTodos: DeletedTodo[]): void {
  localStorage.setItem(`deleted_todos_${userId}`, JSON.stringify(deletedTodos))
}

export function addTodo(userId: string, text: string): Todo {
  const todos = getTodos(userId)
  const newTodo: Todo = {
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
    userId,
  }
  todos.push(newTodo)
  saveTodos(userId, todos)
  return newTodo
}

export function toggleTodo(userId: string, todoId: string): void {
  const todos = getTodos(userId)
  const todo = todos.find((t) => t.id === todoId)
  if (todo) {
    todo.completed = !todo.completed
    saveTodos(userId, todos)
  }
}

export function deleteTodo(userId: string, todoId: string): void {
  const todos = getTodos(userId)
  const todoIndex = todos.findIndex((t) => t.id === todoId)
  if (todoIndex > -1) {
    const [deletedTodo] = todos.splice(todoIndex, 1)
    saveTodos(userId, todos)

    const deletedTodos = getDeletedTodos(userId)
    const deletedTodoWithTimestamp: DeletedTodo = {
      ...deletedTodo,
      deletedAt: new Date().toISOString(),
    }
    deletedTodos.push(deletedTodoWithTimestamp)
    saveDeletedTodos(userId, deletedTodos)
  }
}

export function restoreTodo(userId: string, todoId: string): void {
  const deletedTodos = getDeletedTodos(userId)
  const todoIndex = deletedTodos.findIndex((t) => t.id === todoId)
  if (todoIndex > -1) {
    const [restoredTodo] = deletedTodos.splice(todoIndex, 1)
    saveDeletedTodos(userId, deletedTodos)

    const todos = getTodos(userId)
    const { deletedAt, ...todo } = restoredTodo
    todos.push(todo)
    saveTodos(userId, todos)
  }
}

export function permanentlyDeleteTodo(userId: string, todoId: string): void {
  const deletedTodos = getDeletedTodos(userId)
  const filteredTodos = deletedTodos.filter((t) => t.id !== todoId)
  saveDeletedTodos(userId, filteredTodos)
}

export function permanentlyDeleteAllTodos(userId: string): void {
  saveDeletedTodos(userId, [])
}

export function updateTodo(userId: string, todoId: string, newText: string): void {
  const todos = getTodos(userId)
  const todo = todos.find((t) => t.id === todoId)
  if (todo) {
    todo.text = newText
    saveTodos(userId, todos)
  }
}
