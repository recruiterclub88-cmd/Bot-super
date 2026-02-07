'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
    const [systemPrompt, setSystemPrompt] = useState('');
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        // Получаем настройки
        const { data: settings } = await supabase.from('settings').select('*').single();
        if (settings) {
            setSystemPrompt(settings.system_prompt);
        }

        // Получаем историю (последние 50 сообщений)
        const { data: chatData } = await supabase
            .from('chat_history')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        setHistory(chatData || []);
        setLoading(false);
    }

    async function saveSettings() {
        setSaving(true);
        const { error } = await supabase
            .from('settings')
            .update({ system_prompt: systemPrompt })
            .eq('id', 1);

        if (error) {
            alert('Ошибка при сохранении: ' + error.message);
        } else {
            alert('Настройки сохранены!');
        }
        setSaving(false);
    }

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="admin-container">
            <h1>Панель управления WhatsApp Ботом</h1>

            <section className="settings-section">
                <h2>Настройка Gemini (AI)</h2>
                <div className="field">
                    <label>Системный промпт (инструкции для бота):</label>
                    <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="Например: Ты — менеджер по продажам..."
                    />
                </div>
                <button onClick={saveSettings} disabled={saving}>
                    {saving ? 'Сохранение...' : 'Сохранить настройки'}
                </button>
            </section>

            <section className="history-section">
                <h2>Последние сообщения</h2>
                <div className="history-list">
                    {history.length === 0 && <p>История пуста</p>}
                    {history.map((msg) => (
                        <div key={msg.id} className={`message ${msg.role}`}>
                            <span className="sender">{msg.chat_id} ({msg.role === 'model' ? 'Бот' : 'Клиент'}):</span>
                            <p className="content">{msg.content}</p>
                            <span className="time">{new Date(msg.created_at).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </section>

            <style>{`
        .admin-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #fdfdfd;
          color: #333;
        }
        h1 { color: #1a73e8; border-bottom: 2px solid #eee; padding-bottom: 1rem; }
        section { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 2rem; border: 1px solid #eee; }
        h2 { margin-top: 0; font-size: 1.25rem; color: #444; }
        .field { margin: 1rem 0; }
        label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
        textarea { width: 100%; height: 150px; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; resize: vertical; box-sizing: border-box; }
        button { background: #1a73e8; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-weight: 600; transition: background 0.2s; }
        button:hover { background: #1557b0; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        
        .history-list { display: flex; flex-direction: column; gap: 1rem; max-height: 500px; overflow-y: auto; padding-right: 0.5rem; }
        .message { padding: 0.75rem; border-radius: 8px; border: 1px solid #eee; }
        .message.user { background: #e8f0fe; align-self: flex-start; border-color: #d2e3fc; }
        .message.model { background: #f1f3f4; align-self: flex-end; border-color: #dadce0; text-align: right; }
        .sender { font-weight: 600; font-size: 0.8rem; color: #666; display: block; margin-bottom: 0.25rem; }
        .content { margin: 0; line-height: 1.4; }
        .time { font-size: 0.7rem; color: #999; display: block; margin-top: 0.5rem; }
        .loading { text-align: center; padding: 5rem; font-size: 1.5rem; }
      `}</style>
        </div>
    );
}
