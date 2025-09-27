-- =================================================================
--  SCRIPT DE SEED PARA O PROJETO OPENLETTERS
--  Data: 27 de setembro de 2025
--  Finalidade: Popular o banco de dados com dados de teste consistentes.
-- =================================================================

-- Apaga todos os dados existentes nas tabelas para garantir um estado limpo.
-- A ordem é importante devido às chaves estrangeiras.
-- TRUNCATE é mais rápido que DELETE para esvaziar tabelas.
-- RESTART IDENTITY reseta quaisquer contadores de sequência (não usamos, mas é boa prática).
-- CASCADE remove dados em tabelas dependentes automaticamente.
TRUNCATE TABLE signatures, letters, users RESTART IDENTITY CASCADE;

-- Inserção de Usuários de Exemplo
-- A senha para todos os usuários é "senha123"
-- O hash bcrypt correspondente é: '$2a$10$fP8.i6nIK2is9h2Q8j6s7e3J.qLF3x8pY1if5sQJd2yY9gB0p4.Sm'
INSERT INTO users (id, email, password_hash, is_verified) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ana.silva@email.com', '$2a$10$fP8.i6nIK2is9h2Q8j6s7e3J.qLF3x8pY1if5sQJd2yY9gB0p4.Sm', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'bruno.costa@email.com', '$2a$10$fP8.i6nIK2is9h2Q8j6s7e3J.qLF3x8pY1if5sQJd2yY9gB0p4.Sm', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'carla.mendes@email.com', '$2a$10$fP8.i6nIK2is9h2Q8j6s7e3J.qLF3x8pY1if5sQJd2yY9gB0p4.Sm', true),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'daniel.rocha@email.com', '$2a$10$fP8.i6nIK2is9h2Q8j6s7e3J.qLF3x8pY1if5sQJd2yY9gB0p4.Sm', true);


-- Inserção de Cartas de Exemplo
INSERT INTO letters (id, sender_id, recipient_email, subject, body, created_at) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'prefeitura@cidadelegal.gov.br', 'Mais Ciclovias na Avenida Principal', 'Como cidadãos preocupados com a mobilidade urbana e o meio ambiente, solicitamos a construção de ciclovias seguras...', NOW() - INTERVAL '4 days'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ceo@techcorp.com', 'Pelo Futuro do Trabalho Remoto na TechCorp', 'Nós, os funcionários, escrevemos esta carta para expressar nosso forte desejo de manter uma política de trabalho remoto flexível...', NOW() - INTERVAL '3 days'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'contato@universidade.edu', 'Revisão Urgente das Taxas da Cantina', 'Escrevemos em nome do corpo estudantil para pedir uma revisão dos preços praticados na cantina do campus. Os valores atuais são proibitivos...', NOW() - INTERVAL '2 days'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'cultura@estado.gov.br', 'Apoio ao Teatro Local da Cidade', 'A comunidade artística local vem por meio desta solicitar apoio e incentivo para a manutenção do nosso teatro...', NOW() - INTERVAL '1 day'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'ceo@techcorp.com', 'Sugestão de melhoria na intranet', 'Gostaria de sugerir uma melhoria simples na interface da intranet corporativa para facilitar o acesso aos holerites.', NOW());


-- Inserção de Assinaturas de Exemplo
-- A carta da cantina (b...b13) será a mais popular.
-- A carta da intranet (b...b15) não terá nenhuma assinatura.
INSERT INTO signatures (user_id, letter_id) VALUES
-- Assinaturas para a carta da Cantina (3 assinaturas)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b13'),

-- Assinaturas para a carta do Trabalho Remoto (2 assinaturas)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b12'),

-- Assinaturas para a carta das Ciclovias (1 assinatura)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b11');

-- A carta do Teatro também terá 1 assinatura
INSERT INTO signatures (user_id, letter_id) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b14');


SELECT 'Banco de dados populado com dados de teste!' as status;