import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react'
import { addDays, format, subDays } from 'date-fns'

export type Entry = {
  id: string
  type: 'dourado' | 'cobre'
  date: string
  content: string
  action?: string
}

export type Task = {
  id: string
  title: string
  deadline: string
  createdAt: string
}

export type Message = {
  id: string
  role: 'user' | 'ai'
  content: string
  date: string
}

interface AppState {
  user: { name: string; email: string } | null
  setUser: (u: { name: string; email: string } | null) => void
  entries: Entry[]
  addEntry: (e: Entry) => void
  tasks: Task[]
  addTask: (t: Task) => void
  messages: Message[]
  addMessage: (m: Message) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  const [entries, setEntries] = useState<Entry[]>([
    {
      id: '1',
      type: 'dourado',
      date: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
      content: 'Tive um ótimo insight sobre tomada de decisão após ler o capítulo 3.',
    },
    {
      id: '2',
      type: 'cobre',
      date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
      content: 'Procrastinei na tarefa principal do dia e fiquei com inhaca mental.',
      action: 'Fazer a tarefa amanhã como a primeira coisa do dia.',
    },
  ])

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Decidir sobre o novo escopo do projeto',
      deadline: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
      createdAt: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
    },
    {
      id: '2',
      title: 'Conversa difícil com a equipe',
      deadline: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      createdAt: format(subDays(new Date(), 10), 'yyyy-MM-dd'),
    },
  ])

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content:
        'Olá! Sou seu Mentor IA Fernando Fontes. Como posso guiar sua jornada de metacognição hoje?',
      date: new Date().toISOString(),
    },
  ])

  const value = useMemo(
    () => ({
      user,
      setUser,
      entries,
      addEntry: (e: Entry) => setEntries((p) => [...p, e]),
      tasks,
      addTask: (t: Task) => setTasks((p) => [...p, t]),
      messages,
      addMessage: (m: Message) => setMessages((p) => [...p, m]),
    }),
    [user, entries, tasks, messages],
  )

  return React.createElement(AppContext.Provider, { value }, children)
}

export default function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore must be used within AppProvider')
  return ctx
}
