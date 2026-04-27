import pb from '@/lib/pocketbase/client'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id?: string
  user: string
  role: ChatRole
  content: string
  level_context?: number
  created?: string
  updated?: string
}

export const getChatHistory = async () => {
  return pb.collection('chat_messages').getList<ChatMessage>(1, 50, {
    sort: '-created',
  })
}

export const createChatMessage = async (data: Omit<ChatMessage, 'id' | 'created' | 'updated'>) => {
  return pb.collection('chat_messages').create<ChatMessage>(data)
}
