import { useState, useRef, useEffect } from 'react';
import { usePointsOfSale } from '../../hooks/usePointsOfSale';
import { Send, Lightbulb, HelpCircle } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const suggestions = [
    'Combien de points dans une ville ?',
    'Top catégories',
    'Zones sous-couvertes',
    'Répartition formel vs informel',
];

export default function Chat() {
    const { data: pointsOfSale } = usePointsOfSale();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content:
                'Bonjour. Je suis votre assistant pour explorer le référentiel commercial du Maroc. Posez-moi vos questions sur les points de vente, les régions, ou les catégories.',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [explainMode, setExplainMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        setTimeout(() => {
            const response = generateResponse(messageText.toLowerCase());
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
        }, 500);
    };

    const generateResponse = (query: string): string => {
        const formalCount = pointsOfSale.filter((p) => p.isFormal).length;
        const informalCount = pointsOfSale.length - formalCount;

        const categoryCount = pointsOfSale.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        // Determine city mentioned in query by matching known cities from the dataset
        const cities = Array.from(new Set(pointsOfSale.map(p => p.city))).filter(Boolean);
        // Match longest city name first to avoid partial matches
        cities.sort((a, b) => b.length - a.length);
        const lowerQuery = query.toLowerCase();
        const matchedCity = cities.find(c => lowerQuery.includes(c.toLowerCase()));

        let response = '';

        if (matchedCity) {
            const cityPoints = pointsOfSale.filter((p) => p.city.toLowerCase() === matchedCity.toLowerCase()).length;
            response = `Il y a **${cityPoints} points de vente** à ${matchedCity} dans notre base.`;
            if (explainMode) {
                response += '\n\n_Source : filtrage par ville dans le dataset CSV_';
            }
        } else if (query.includes('zone') || query.includes('couvert')) {
            // Provide a short coverage summary with top cities
            const byCity = pointsOfSale.reduce((acc, p) => {
                acc[p.city] = (acc[p.city] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            const topCities = Object.entries(byCity)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(c => `${c[0]} (${c[1]})`)
                .join(', ');

            response = `Couverture par ville (top 5) : ${topCities}. Total points dans le dataset : **${pointsOfSale.length}**.`;
            if (explainMode) {
                response += '\n\n_Source : agrégation par ville du fichier CSV_';
            }
        } else if (query.includes('formel') || query.includes('informel')) {
            const formalPercent = pointsOfSale.length === 0 ? '0.0' : ((formalCount / pointsOfSale.length) * 100).toFixed(1);
            const informalPercent = pointsOfSale.length === 0 ? '0.0' : ((informalCount / pointsOfSale.length) * 100).toFixed(1);
            response = `Sur **${pointsOfSale.length} points**, **${formalPercent}%** sont formels (${formalCount}) et **${informalPercent}%** informels (${informalCount}).`;
            if (explainMode) {
                response += '\n\n_Source : champ "Statut" du dataset CSV_';
            }
        } else if (query.includes('catégorie') || query.includes('top')) {
            response = `Les catégories principales sont : ${topCategories
                .map((t) => `**${t[0]}** (${t[1]} points)`)
                .join(', ')}.`;
            if (explainMode) {
                response += '\n\n_Source : agrégation par catégorie du CSV_';
            }
        } else {
            response = `Désolé, je n'ai pas compris votre question. Essayez des questions comme "Combien de points dans une ville ?" ou "Top catégories".`;
        }

        return response;
    };

    const handleSuggestion = (suggestion: string) => {
        handleSendMessage(suggestion);
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Chatbot</h2>
                <button
                    onClick={() => setExplainMode(!explainMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${explainMode
                        ? 'bg-accent text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                >
                    <Lightbulb className="w-4 h-4" />
                    Explain mode
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {message.role === 'assistant' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-white">
                                <img
                                    src="/images/chatbot_avatar.png"
                                    alt="Assistant"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200';
                                    }}
                                />
                            </div>
                        )}

                        <div
                            className={`max-w-xl px-4 py-3 rounded-2xl shadow-sm ${message.role === 'user'
                                ? 'bg-accent text-white rounded-tr-none'
                                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                                }`}
                        >
                            <div className="text-sm whitespace-pre-line leading-relaxed">{message.content}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
                <div className="px-6 pb-4">
                    <div className="flex items-center gap-2 mb-3 text-sm text-slate-600">
                        <HelpCircle className="w-4 h-4" />
                        <span>Suggestions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => handleSuggestion(suggestion)}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-sm text-slate-700 rounded-lg transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-slate-200">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez votre question..."
                        className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
