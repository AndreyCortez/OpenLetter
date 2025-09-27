--=========== INÍCIO DO SCRIPT ===========--
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


--========================================--
--          CRIAÇÃO DAS TABELAS
--========================================--

-- Tabela para armazenar os usuários da aplicação
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
    password_hash VARCHAR(255) NOT NULL,
    
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token TEXT,
    verification_token_expires_at TIMESTAMPTZ,

    -- Campo para controle de cooldown de envio de cartas
    last_letter_sent_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE users IS 'Armazena os usuários, credenciais de login e status de verificação.';
COMMENT ON COLUMN users.password_hash IS 'Hash da senha gerado por um algoritmo seguro (ex: bcrypt). NUNCA armazene senhas em texto puro.';


-- Tabela para armazenar as cartas abertas
CREATE TABLE letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL CHECK (recipient_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
    
    subject TEXT NOT NULL,
    body TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE letters IS 'Contém o conteúdo de cada carta aberta enviada por um usuário.';
COMMENT ON COLUMN letters.sender_id IS 'Chave estrangeira que liga a carta ao seu autor na tabela de usuários.';


-- Tabela de junção para registrar as assinaturas (relação Muitos-para-Muitos)
CREATE TABLE signatures (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    letter_id UUID NOT NULL REFERENCES letters(id) ON DELETE CASCADE,
    
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, letter_id)
);
COMMENT ON TABLE signatures IS 'Tabela de ligação que registra qual usuário assinou qual carta.';


--========================================--
--     CRIAÇÃO DE ÍNDICES PARA OTIMIZAÇÃO
--========================================--

COMMENT ON INDEX pk_users IS 'Índice de chave primária para buscas rápidas de usuários por ID.';

CREATE INDEX idx_letters_subject ON letters USING GIN (to_tsvector('portuguese', subject));
COMMENT ON INDEX idx_letters_subject IS 'Índice GIN para busca de texto completo otimizada no campo subject.';

CREATE INDEX idx_letters_sender_id ON letters (sender_id);
CREATE INDEX idx_letters_recipient_email ON letters (recipient_email);

CREATE INDEX idx_signatures_letter_id ON signatures (letter_id);


--========================================--
--       CRIAÇÃO DE GATILHOS (TRIGGERS)
--========================================--

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
COMMENT ON TRIGGER set_timestamp ON users IS 'Atualiza automaticamente o campo updated_at em qualquer modificação de um usuário.';


--=========== FIM DO SCRIPT ===========--