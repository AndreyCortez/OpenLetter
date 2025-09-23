// src/pages/WritePage.jsx
import { useState } from 'react';

export default function WritePage() {
  // Simula o email do usuário logado. Em uma aplicação real, viria do contexto de autenticação.
  const loggedInUserEmail = "helena.gomes@email.com";

  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    body: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Monta o objeto final da carta
    const letter = {
      sender: loggedInUserEmail,
      recipient: formData.recipient,
      subject: formData.subject,
      body: formData.body,
    };
    
    console.log("Enviando carta:", letter);
    // Aqui você fará a chamada para a sua API backend para enviar e salvar a carta.
    // Ex: await axios.post('/api/letters', letter);
    alert('Carta enviada! (Verifique o console para ver os dados)');
    
    // Limpa o formulário após o envio
    setFormData({ recipient: '', subject: '', body: '' });
  };

  // Estilo base para os campos de input e textarea
  const inputStyle = "w-full p-2 border border-slate-300 bg-white focus:outline-none focus:border-slate-500";
  const disabledInputStyle = "w-full p-2 border border-slate-200 bg-slate-100 text-slate-500";


  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="mb-4">Escrever Nova Carta</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Remetente (Não editável) */}
        <div>
          <label htmlFor="sender" className="block mb-1">Remetente</label>
          <input
            type="email"
            id="sender"
            name="sender"
            value={loggedInUserEmail}
            className={disabledInputStyle}
            disabled
          />
        </div>
        
        {/* Campo Destinatário */}
        <div>
          <label htmlFor="recipient" className="block mb-1">Destinatário</label>
          <input
            type="email"
            id="recipient"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            className={inputStyle}
            required
            placeholder="email@destinatario.com"
          />
        </div>

        {/* Campo Título */}
        <div>
          <label htmlFor="subject" className="block mb-1">Título</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={inputStyle}
            required
            placeholder="Assunto da carta"
          />
        </div>

        {/* Campo Corpo */}
        <div>
          <label htmlFor="body" className="block mb-1">Corpo</label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            className={inputStyle}
            rows="12"
            required
            placeholder="Escreva sua carta aqui..."
          />
        </div>

        {/* Botão de Envio */}
        <div>
          <button 
            type="submit" 
            className="underline hover:bg-slate-200 p-2"
          >
            > Enviar Carta
          </button>
        </div>
      </form>
    </div>
  );
}