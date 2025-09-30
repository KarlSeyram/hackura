
'use client';

import { useState, useRef, useEffect } from 'react';
import { X, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getEbooks } from '@/lib/data';
import type { Ebook } from '@/lib/definitions';
import { askAssistant } from '@/ai/flows/ebook-chatbot';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allEbooks, setAllEbooks] = useState<Ebook[]>([]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Pre-fetch ebooks when component mounts
    const fetchEbooks = async () => {
        try {
            const ebooks = await getEbooks();
            setAllEbooks(ebooks);
        } catch (error) {
            console.error("Failed to fetch ebooks for chatbot:", error);
        }
    };
    fetchEbooks();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantResponse = await askAssistant(input, allEbooks);
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse.answer }]);
    } catch (error) {
      console.error("Error asking assistant:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="rounded-full w-14 h-14 shadow-lg">
          {isOpen ? <X className="h-6 w-6" /> : (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
            >
                <path d="M12 8V4H8" />
                <path d="m9 13-1-1" />
                <path d="m15 13-1-1" />
                <path d="m12 16-0.5-0.5" />
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </Button>
      </div>

      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-50 w-full max-w-sm shadow-2xl flex flex-col h-[70vh]">
            <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle className="text-lg">Hackura Assistant</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full" ref={scrollAreaRef}>
                    <div className="p-4 space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-foreground/50 animate-pulse [animation-delay:-0.3s]"></span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-foreground/50 animate-pulse [animation-delay:-0.15s]"></span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-foreground/50 animate-pulse"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-4">
                 <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask about cybersecurity..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <CornerDownLeft className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
      )}
    </>
  );
}
