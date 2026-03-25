import { useState, useRef, useEffect } from 'react';
import { Send, Lightbulb, HelpCircle, Loader2 } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const suggestions = [
    'Combien de points avons-nous au total ?',
    'Quelle est la ville avec le plus de commerces ?',
    'Répartition du formel vs informel',
    'Donne-moi le top 10 des catégories',
];

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content:
                'Bonjour ! Je suis votre assistant expert GeoCommercial. Posez-moi vos questions sur les points de vente, les villes ou les tendances du marché au Maroc.',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        try {
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: messageText,
                    history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })) 
                })
            });

            if (!response.ok) throw new Error('Erreur réseau');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6).trim();
                            if (data === '[DONE]') break;
                            
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.content) {
                                    fullContent += parsed.content;
                                    setMessages((prev) => 
                                        prev.map((msg) => 
                                            msg.id === assistantMessageId 
                                                ? { ...msg, content: fullContent } 
                                                : msg
                                        )
                                    );
                                }
                            } catch (e) {
                                // Silent catch
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => 
                prev.map((msg) => 
                    msg.id === assistantMessageId 
                        ? { ...msg, content: "Désolé, je rencontre une difficulté pour répondre. Vérifiez que le serveur backend est bien lancé." } 
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <img src="/images/chatbot_avatar.png" alt="AI" className="w-6 h-6 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900">Assistant IA GeoCommercial</h2>
                        <span className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Expert en ligne
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {message.role === 'assistant' && (
                            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-white flex items-center justify-center p-1">
                                <img
                                    src="/images/chatbot_avatar.png"
                                    alt="Assistant"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200';
                                    }}
                                />
                            </div>
                        )}

                        <div
                            className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-sm ${message.role === 'user'
                                ? 'bg-accent text-white rounded-tr-none'
                                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                            <div className="text-[15px] whitespace-pre-line leading-relaxed prose prose-slate">
                                {message.content || (isLoading && message.id === messages[messages.length-1].id ? (
                                    <div className="flex items-center gap-2 text-slate-400 italic">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        L'IA réfléchit...
                                    </div>
                                ) : null)}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && !isLoading && (
                <div className="px-6 pb-4 bg-slate-50/30">
                    <div className="flex items-center gap-2 mb-3 text-sm text-slate-500 font-medium">
                        <HelpCircle className="w-4 h-4" />
                        <span>Questions fréquentes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => handleSendMessage(suggestion)}
                                className="px-4 py-2 bg-white border border-slate-200 hover:border-accent hover:text-accent text-sm text-slate-700 rounded-xl transition-all shadow-sm"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="flex gap-3 max-w-4xl mx-auto"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez votre question sur les données..."
                        className="flex-1 px-5 py-3 bg-slate-100 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="px-6 py-3 bg-accent text-white rounded-2xl hover:bg-accent-dark transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-accent/20"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
