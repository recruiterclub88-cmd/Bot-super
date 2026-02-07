-- Таблица настроек бота
CREATE TABLE settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    system_prompt TEXT DEFAULT 'Ты — полезный ассистент в WhatsApp.',
    auto_replies JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Инициализация настроек (если таблицы пуста)
INSERT INTO settings (id, system_prompt)
VALUES (1, 'Ты — полезный ассистент в WhatsApp.')
ON CONFLICT (id) DO NOTHING;

-- Таблица истории сообщений
CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id TEXT NOT NULL, -- WhatsApp ID (например, 79261234567@c.us)
    role TEXT NOT NULL, -- 'user' или 'model'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Индекс для быстрого поиска истории по конкретному чату
CREATE INDEX idx_chat_history_chat_id ON chat_history(chat_id);
