import React from 'react';
import { OrdemServico } from '../types';
import { formatCurrency, formatDateBR, formatOSNumber } from '../utils/formatters';
import { User, X, Laptop, Calendar, DollarSign, CheckCircle, Plus, Eye, Sparkles } from 'lucide-react';

interface ClienteHistoricoModalProps {
  osAtual: OrdemServico;
  todasOrdens: OrdemServico[];
  onSelecionarOS: (numeroOS: number) => void;
  onCriarNovaOSComDados: (dadosCopiados: OrdemServico) => void;
  onClose: () => void;
}

export const ClienteHistoricoModal: React.FC<ClienteHistoricoModalProps> = ({
  osAtual,
  todasOrdens,
  onSelecionarOS,
  onCriarNovaOSComDados,
  onClose
}) => {
  // Find all non-deleted orders for this client by matching name or phone or CPF
  const ordensCliente = todasOrdens.filter(os => {
    if (os.apagado) return false;
    const mesmoNome = os.nomeCliente.trim().toLowerCase() === osAtual.nomeCliente.trim().toLowerCase();
    const mesmoTel = os.telefone && os.telefone === osAtual.telefone;
    const mesmoCPF = os.cpfCnpj && osAtual.cpfCnpj && os.cpfCnpj === osAtual.cpfCnpj;
    return mesmoNome || mesmoTel || mesmoCPF;
  });

  const totalGasto = ordensCliente.reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);

  const handleCriarNovaComOS = (os: OrdemServico) => {
    onCriarNovaOSComDados(os);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden border-2 border-orange-500">
        {/* Header */}
        <div className="bg-[#ff6600] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <h3 className="font-bold text-lg">Histórico do Cliente: {osAtual.nomeCliente}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-700 p-1 rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Cliente */}
        <div className="p-4 bg-orange-50 border-b border-orange-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
            <div className="bg-white p-3 rounded border border-orange-200">
              <span className="text-gray-500 font-semibold block">Contato Principal:</span>
              <span className="font-bold text-gray-800 text-sm">{osAtual.telefone}</span>
              {osAtual.telefone2 && <span className="text-gray-500 block text-[11px]">{osAtual.telefone2}</span>}
              <span className="text-gray-500 block text-[11px]">{osAtual.email || 'Sem e-mail'}</span>
            </div>

            <div className="bg-white p-3 rounded border border-orange-200">
              <span className="text-gray-500 font-semibold block">Documento & Endereço:</span>
              <span className="font-bold text-gray-800">{osAtual.cpfCnpj || 'Não cadastrado'}</span>
              <span className="text-gray-600 block text-[11px] truncate">{osAtual.endereco || 'Sem endereço'}</span>
              <span className="text-gray-500 block text-[10px]">CEP: {osAtual.cep || 'S/N'}</span>
            </div>

            <div className="bg-white p-3 rounded border border-orange-200">
              <span className="text-gray-500 font-semibold block">Total em Serviços:</span>
              <span className="font-bold text-green-700 text-base">{formatCurrency(totalGasto)}</span>
              <span className="text-gray-600 block text-[11px] font-medium">
                {ordensCliente.length} {ordensCliente.length === 1 ? 'Ordem de Serviço' : 'Ordens de Serviço'}
              </span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded border border-orange-300 flex items-center justify-between text-xs text-orange-950 font-semibold">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>
                Clique em qualquer OS para <strong>criar uma Nova Ordem de Serviço</strong> copiando automaticamente os dados do cliente e do equipamento!
              </span>
            </div>
            <button
              onClick={() => handleCriarNovaComOS(osAtual)}
              className="bg-[#ff6600] hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded text-xs shadow transition flex items-center gap-1.5 flex-shrink-0 ml-3 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova OS (Equipamento Atual)</span>
            </button>
          </div>
        </div>

        {/* Lista de OS do Cliente */}
        <div className="p-4 overflow-y-auto max-h-[50vh] space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Ordens de Serviço registradas para este cliente:
            </h4>
            <span className="text-[11px] text-gray-500">
              {ordensCliente.length} registro(s) encontrado(s)
            </span>
          </div>

          {ordensCliente.map((os) => {
            const isAtual = os.numeroOS === osAtual.numeroOS;
            return (
              <div
                key={os.numeroOS}
                onClick={() => handleCriarNovaComOS(os)}
                className={`p-3 rounded-lg border-2 transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                  isAtual
                    ? 'border-orange-500 bg-orange-50/80 shadow-sm hover:bg-orange-100/70'
                    : 'border-gray-300 hover:border-orange-500 bg-white hover:bg-orange-50/50'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-orange-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded shadow-sm flex flex-col items-center">
                    <span className="text-[9px] uppercase opacity-80">OS</span>
                    <span>{formatOSNumber(os.numeroOS)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-900 group-hover:text-orange-700 transition">
                        {os.aparelho} • {os.marca} {os.modelo}
                      </span>
                      {isAtual && (
                        <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          ATUAL NA TELA
                        </span>
                      )}
                      {os.numeroSerie && (
                        <span className="text-[11px] text-gray-500 font-mono">
                          (S/N: {os.numeroSerie})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-1 mt-0.5">
                      <span className="font-semibold text-gray-900">Defeito:</span> {os.defeitos}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1 flex-wrap">
                      <span>Entrada: <strong>{formatDateBR(os.dataEntrada)}</strong></span>
                      <span>Atendente: {os.atendente}</span>
                      {os.tecnico && <span>Técnico: {os.tecnico}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      os.status === 'Liberado' ? 'bg-green-100 text-green-800' :
                      os.status === 'Retirado' ? 'bg-gray-200 text-gray-700' :
                      os.status === 'Aprovado' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {os.status}
                    </span>
                    <span className="font-mono font-bold text-sm text-gray-900">
                      {formatCurrency(os.valorTotal || 0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelecionarOS(os.numeroOS);
                        onClose();
                      }}
                      className="px-2 py-1 text-[11px] text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition flex items-center gap-1 cursor-pointer"
                      title="Apenas ver esta OS na tela principal"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Ver OS</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCriarNovaComOS(os);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#ff6600] hover:bg-orange-700 rounded shadow-sm transition flex items-center gap-1 cursor-pointer"
                      title="Criar nova Ordem de Serviço copiando cliente e aparelho"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Copiar p/ Nova OS</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-100 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Dica: você pode copiar dados de qualquer OS anterior para agilizar a entrada na bancada.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-semibold text-xs transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

