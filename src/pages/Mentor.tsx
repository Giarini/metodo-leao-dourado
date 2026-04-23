import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

type Message = { id: string; role: 'user' | 'ai'; content: string }

export default function Mentor() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'ai',
      content:
        'Olá! Sou seu Mentor IA Fernando Fontes. Como posso guiar sua jornada de metacognição hoje?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userText = input.trim()
    setInput('')

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userText }
    setMessages((prev) => [...prev, newUserMsg])
    setIsLoading(true)

    try {
      const res = await pb.send('/backend/v1/search/mentor', {
        method: 'POST',
        body: JSON.stringify({ query: userText }),
      })
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'ai', content: res.reply },
      ])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'ai',
          content: 'Tivemos um pequeno bloqueio mental de comunicação. Pode repetir?',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <Avatar className="w-14 h-14 border-2 border-[#D4AF37]">
          <AvatarImage src="https://img.usecurling.com/ppl/medium?gender=male&seed=fernando" />
          <AvatarFallback className="bg-[#D4AF37] text-black font-bold">FF</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#D4AF37] tracking-wide">Mentor IA</h1>
          <p className="text-slate-400">Seu guia neurocientífico e motivacional.</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col bg-black/40 backdrop-blur-xl border-[#D4AF37]/30 min-h-[500px]">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-4 max-w-[85%]',
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : '',
                )}
              >
                <Avatar
                  className={cn(
                    'w-10 h-10 border',
                    msg.role === 'ai' ? 'border-[#D4AF37]' : 'border-slate-600',
                  )}
                >
                  {msg.role === 'ai' ? (
                    <AvatarImage src="https://img.usecurling.com/ppl/medium?gender=male&seed=fernando" />
                  ) : (
                    <AvatarFallback className="bg-slate-800 text-white">
                      {user?.name?.substring(0, 2).toUpperCase() || 'AL'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={cn(
                    'p-4 rounded-2xl text-base leading-relaxed',
                    msg.role === 'ai'
                      ? 'bg-black/60 border border-[#D4AF37]/20 text-slate-200 rounded-tl-none'
                      : 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-white rounded-tr-none',
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 max-w-[85%]">
                <Avatar className="w-10 h-10 border border-[#D4AF37]">
                  <AvatarImage src="https://img.usecurling.com/ppl/medium?gender=male&seed=fernando" />
                </Avatar>
                <div className="p-4 rounded-2xl bg-black/60 border border-[#D4AF37]/20 rounded-tl-none flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-[#D4AF37]/20 bg-black/40">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2 items-end"
          >
            <Textarea
              placeholder="Descreva sua dúvida ou situação..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              className="min-h-[60px] bg-black/60 border-[#D4AF37]/30 focus-visible:ring-[#D4AF37] resize-none text-white"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-[60px] w-[60px] bg-[#D4AF37] hover:bg-[#AA8A2A] text-black shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
