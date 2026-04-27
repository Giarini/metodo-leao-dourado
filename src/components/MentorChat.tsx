import { useState, useRef, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import imgMentor from '../assets/fementoria-b538d.png'
import { getChatHistory, createChatMessage } from '@/services/chat_messages'
import { MentorChatChips } from '@/components/MentorChatChips'

type Message = {
  id: string
  role: 'user' | 'ai'
  content: string
  isError?: boolean
  originalText?: string
}

export function MentorChat({ isWidget = false }: { isWidget?: boolean }) {
  const { user } = useAuth()
  const location = useLocation()
  const params = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingHistory, setIsFetchingHistory] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true
    const loadHistory = async () => {
      if (!user?.id) return
      try {
        const history = await getChatHistory()
        if (!mounted) return

        if (history.items.length > 0) {
          const formatted: Message[] = history.items
            .map((h) => ({
              id: h.id || Math.random().toString(),
              role: h.role === 'assistant' ? 'ai' : 'user',
              content: h.content,
            }))
            .reverse()
          setMessages(formatted)
        } else {
          setMessages([
            {
              id: 'init',
              role: 'ai',
              content:
                'Olá! Sou seu Mentor IA Fernando Fontes. Como posso guiar sua jornada de metacognição hoje?',
            },
          ])
        }
      } catch (error) {
        console.error('Failed to load chat history', error)
        if (mounted) {
          setMessages([
            {
              id: 'init',
              role: 'ai',
              content:
                'Olá! Sou seu Mentor IA Fernando Fontes. Como posso guiar sua jornada de metacognição hoje?',
            },
          ])
        }
      } finally {
        if (mounted) setIsFetchingHistory(false)
      }
    }
    loadHistory()
    return () => {
      mounted = false
    }
  }, [user?.id])

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 50)
    }
  }, [messages, isLoading, isFetchingHistory])

  const handleSend = async (textToUse?: string) => {
    const userText = textToUse || input.trim()
    if (!userText || isLoading || isFetchingHistory) return

    if (!textToUse) setInput('')

    setMessages((prev) => prev.filter((m) => !(m.isError && m.originalText === textToUse)))

    setMessages((prev) => {
      if (
        prev.length > 0 &&
        prev[prev.length - 1].content === userText &&
        prev[prev.length - 1].role === 'user'
      )
        return prev
      return [...prev, { id: Date.now().toString(), role: 'user', content: userText }]
    })

    setIsLoading(true)

    // Using explicitly 0 if null/undefined for general overview
    const isGeneralLevel = location.pathname === '/niveis'
    const currentLevelId = params.id ? parseInt(params.id, 10) : null
    const levelContext = isGeneralLevel ? 0 : (currentLevelId ?? user?.unlocked_level ?? 0)

    try {
      let reply = ''
      let success = false
      let retryCount = 0

      while (retryCount < 2 && !success) {
        try {
          const res = await pb.send('/backend/v1/search/mentor', {
            method: 'POST',
            body: JSON.stringify({ query: userText, levelContext }),
            // pb.send explicitly includes token, ensuring persistence
          })
          reply = res.reply
          success = true
        } catch (err: any) {
          retryCount++
          if (retryCount >= 2) {
            console.error(
              'Mentor search failed. Payload:',
              { query: userText, levelContext },
              'Response:',
              err?.response,
              'Status:',
              err?.status,
            )
            throw err
          }
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      if (success && user?.id) {
        // Credit Protection Logic: Only save both messages on successful reply
        await createChatMessage({
          user: user.id,
          role: 'user',
          content: userText,
          level_context: levelContext,
        }).catch((err) => console.error('Failed to save user message:', err))

        await createChatMessage({
          user: user.id,
          role: 'assistant',
          content: reply,
          level_context: levelContext,
        }).catch((err) => console.error('Failed to save assistant message:', err))
      }

      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'ai', content: reply }])
    } catch (e: any) {
      const isTimeout = e?.status === 0 || e?.status === 408 || e?.status === 504
      const errorMsg = isTimeout
        ? 'A conexão expirou. Tivemos um pequeno bloqueio mental de comunicação. Pode repetir?'
        : e?.response?.message || 'Ocorreu um erro ao processar sua mensagem. Tente novamente.'

      // UI State Recovery: keep text in input so user doesn't need to retype
      setInput(userText)

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'ai',
          content: errorMsg,
          isError: true,
          originalText: userText,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col h-full w-full', isWidget ? '' : 'space-y-4')}>
      {!isWidget && (
        <div className="flex items-center gap-3 md:gap-4 mb-2 shrink-0">
          <Avatar className="w-12 h-12 md:w-14 md:h-14 border-2 border-[#D4AF37]">
            <AvatarImage src={imgMentor} className="object-cover" />
            <AvatarFallback className="bg-[#D4AF37] text-black font-bold">FF</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#D4AF37] tracking-wide">
              Mentor IA
            </h1>
            <p className="text-sm md:text-base text-slate-400">
              Seu guia neurocientífico e motivacional.
            </p>
          </div>
        </div>
      )}

      <Card
        className={cn(
          'flex-1 flex flex-col bg-black/40 backdrop-blur-xl border-[#D4AF37]/30 overflow-hidden',
          isWidget ? 'border-0 bg-transparent rounded-none' : 'min-h-[400px] md:min-h-[500px]',
        )}
      >
        <ScrollArea className="flex-1 p-3 md:p-4" ref={scrollRef}>
          {isFetchingHistory ? (
            <div className="flex h-full min-h-[200px] items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6 pb-4 flex flex-col">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2 md:gap-4 max-w-[90%] md:max-w-[85%]',
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : '',
                  )}
                >
                  <Avatar
                    className={cn(
                      'w-8 h-8 md:w-10 md:h-10 border shrink-0',
                      msg.role === 'ai' ? 'border-[#D4AF37]' : 'border-slate-600',
                    )}
                  >
                    {msg.role === 'ai' ? (
                      <AvatarImage src={imgMentor} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-slate-800 text-white text-xs md:text-sm">
                        {user?.name?.substring(0, 2).toUpperCase() || 'AL'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div
                    className={cn(
                      'flex flex-col gap-1',
                      msg.role === 'user' ? 'items-end' : 'items-start',
                    )}
                  >
                    <div
                      className={cn(
                        'p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap',
                        msg.role === 'ai'
                          ? msg.isError
                            ? 'bg-red-950/40 border border-red-500/30 text-red-200 rounded-tl-none'
                            : 'bg-black/60 border border-[#D4AF37]/20 text-slate-200 rounded-tl-none'
                          : 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-white rounded-tr-none',
                      )}
                    >
                      {msg.content}
                    </div>
                    {msg.isError && msg.originalText && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-1 bg-black/50 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:text-[#D4AF37]"
                        onClick={() => handleSend(msg.originalText)}
                        disabled={isLoading}
                      >
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Tentar Novamente
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 md:gap-4 max-w-[90%] md:max-w-[85%]">
                  <Avatar className="w-8 h-8 md:w-10 md:h-10 border border-[#D4AF37] shrink-0">
                    <AvatarImage src={imgMentor} className="object-cover" />
                  </Avatar>
                  <div className="p-3 md:p-4 rounded-2xl bg-black/60 border border-[#D4AF37]/20 rounded-tl-none flex items-center gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#D4AF37] rounded-full animate-bounce" />
                    <div
                      className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#D4AF37] rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <div
                      className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#D4AF37] rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div
          className={cn(
            'p-2 md:p-4 border-t border-[#D4AF37]/20 bg-black/60 backdrop-blur-md',
            isWidget && 'pb-6',
          )}
        >
          <MentorChatChips
            level={user?.unlocked_level ?? 0}
            isLoading={isLoading || isFetchingHistory}
            onSelect={handleSend}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2 items-center"
          >
            <Input
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              enterKeyHint="send"
              disabled={isLoading || isFetchingHistory}
              className="flex-1 h-12 bg-black/60 border-[#D4AF37]/30 focus-visible:ring-[#D4AF37] text-white text-base md:text-sm rounded-xl"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading || isFetchingHistory}
              className="h-12 w-12 rounded-xl bg-[#D4AF37] hover:bg-[#AA8A2A] text-black shrink-0 transition-transform active:scale-95 flex items-center justify-center p-0"
            >
              <Send className="w-5 h-5 ml-1" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
