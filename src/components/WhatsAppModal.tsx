import React, { useState, useEffect } from 'react';
import { OrdemServico } from '../types';
import { cleanPhone, formatCurrency, formatOSNumber } from '../utils/formatters';
import { MessageSquare, X, Copy, ExternalLink, Check } from 'lucide-react';

interface WhatsAppModalProps {
  os: OrdemServico;
  onClose: () => void;
}

type TemplateType = 'entrada' | 'orcamento' | 'pronto' | 'personalizado';

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ os, onClose }) => {
  const [template, setTemplate] = useState<TemplateType>('orcamento');
  const [targetPhone, setTargetPhone] = useState<string>(os.telefone);
  const [customText, setCustomText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate template message text
  const generateMessage = (tipo: TemplateType): string => {
    const numOS = formatOSNumber(os.numeroOS);
    const primeiroNome = os.nomeCliente.split(' ')[0] || 'Cliente';
    const totalFormatado = formatCurrency(os.valorTotal || 0);

    const itensDesc = os.orcamento && os.orcamento.filter(i => i.item).length > 0
      ? os.orcamento.filter(i => i.item).map(i => `• ${i.item} (${formatCurrency(i.valor)})`).join('\n')
      : '• Serviços especializados de bancada';

    switch (tipo) {
      case 'entrada':
        return `🔧 *CHIP7 INFORMÁTICA - AVISO DE ENTRADA DE EQUIPAMENTO*\n\n` +
          `Olá, *${primeiroNome}*! Tudo bem?\n\n` +
          `Confirmamos o recebimento do seu equipamento em nossa assistência técnica:\n` +
          `📋 *Ordem de Serviço:* Nº ${numOS}\n` +
          `💻 *Equipamento:* ${os.aparelho} ${os.marca} ${os.modelo}\n` +
          `🔍 *Defeito Relatado:* ${os.defeitos}\n` +
          `👤 *Atendente Responsável:* ${os.atendente}\n\n` +
          `Nosso laboratório já iniciou a análise técnica. Entraremos em contato assim que o laudo estiver concluído!\n\n` +
          `_Chip7 Informática - Qualidade e Confiança_`;

      case 'orcamento':
        return `📋 *CHIP7 INFORMÁTICA - ORÇAMENTO PRONTO*\n\n` +
          `Olá, *${primeiroNome}*!\n\n` +
          `O orçamento técnico do seu *${os.aparelho} ${os.marca}* (OS Nº ${numOS}) está pronto:\n\n` +
          `*Serviços e Peças Necessárias:*\n${itensDesc}\n\n` +
          `💰 *Valor Total:* *${totalFormatado}*\n` +
          `🛡️ *Garantia:* 90 dias conforme CDC.\n\n` +
          `Podemos autorizar o início dos serviços? Responda com *APROVADO* para prosseguirmos! 😉\n\n` +
          `_Chip7 Informática - Técnico: ${os.tecnico || os.atendente}_`;

      case 'pronto':
        return `🎉 *CHIP7 INFORMÁTICA - EQUIPAMENTO PRONTO PARA RETIRADA*\n\n` +
          `Olá, *${primeiroNome}*! Boas notícias!\n\n` +
          `Seu *${os.aparelho} ${os.marca} ${os.modelo}* (OS Nº ${numOS}) passou por todos os testes e já está *LIBERADO PARA RETIRADA*!\n\n` +
          `💵 *Valor:* ${totalFormatado}\n` +
          `📍 *Local:* Chip7 Informática\n` +
          `⏰ *Horário de Funcionamento:* Seg a Sex das 08h30 às 18h00\n\n` +
          `Aguardamos você. Tenha um ótimo dia! 🚀`;

      case 'personalizado':
        return customText || `Olá, ${primeiroNome}! Entramos em contato referente à sua OS Nº ${numOS} na Chip7 Informática.`;
      default:
        return '';
    }
  };

  useEffect(() => {
    setCustomText(generateMessage(template));
  }, [template, os]);

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    let clean = cleanPhone(targetPhone);
    // Add Brazil country code if not present
    if (clean.length === 10 || clean.length === 11) {
      clean = `55${clean}`;
    }
    const encoded = encodeURIComponent(customText);
    const url = `https://wa.me/${clean}?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border-2 border-green-600">
        {/* Header Verde WhatsApp */}
        <div className="bg-[#25D366] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 fill-white" />
            <h3 className="font-bold text-lg">Enviar Mensagem WhatsApp - OS #{formatOSNumber(os.numeroOS)}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-700 p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Seletor de Telefone */}
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <label className="block text-xs font-bold text-green-900 mb-1">
              Telefone de Destino do Cliente:
            </label>
            <div className="flex items-center gap-2">
              <select
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2.5 py-1 text-sm font-medium flex-1"
              >
                <option value={os.telefone}>Principal: {os.telefone}</option>
                {os.telefone2 && <option value={os.telefone2}>Secundário: {os.telefone2}</option>}
              </select>
              <input
                type="text"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                placeholder="Editar número..."
                className="bg-white border border-gray-300 rounded px-2.5 py-1 text-sm w-44 font-mono"
              />
            </div>
          </div>

          {/* Modelos de Mensagem */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">
              Modelos Prontos:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplate('entrada')}
                className={`px-3 py-2 text-xs font-semibold rounded border transition text-left ${
                  template === 'entrada'
                    ? 'bg-green-600 text-white border-green-700 shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
                }`}
              >
                1. Entrada da OS
              </button>
              <button
                type="button"
                onClick={() => setTemplate('orcamento')}
                className={`px-3 py-2 text-xs font-semibold rounded border transition text-left ${
                  template === 'orcamento'
                    ? 'bg-green-600 text-white border-green-700 shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
                }`}
              >
                2. Orçamento Pronto
              </button>
              <button
                type="button"
                onClick={() => setTemplate('pronto')}
                className={`px-3 py-2 text-xs font-semibold rounded border transition text-left ${
                  template === 'pronto'
                    ? 'bg-green-600 text-white border-green-700 shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
                }`}
              >
                3. Aparelho Liberado
              </button>
            </div>
          </div>

          {/* Editor da Mensagem */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-700 uppercase">
                Texto da Mensagem (Você pode editar diretamente):
              </label>
              <span className="text-[11px] text-gray-500">
                Suporta formatação do WhatsApp (*negrito*, _itálico_)
              </span>
            </div>
            <textarea
              rows={8}
              value={customText}
              onChange={(e) => {
                setCustomText(e.target.value);
                setTemplate('personalizado');
              }}
              className="w-full border-2 border-gray-300 rounded p-2.5 text-xs font-sans bg-gray-50 focus:bg-white focus:border-green-500 outline-none leading-relaxed"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold transition"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado para a Área de Transferência!' : 'Copiar Mensagem'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleOpenWhatsApp}
                className="flex items-center gap-1.5 px-5 py-2 rounded text-sm font-bold bg-[#25D366] hover:bg-green-600 text-white shadow transition cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Enviar pelo WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
