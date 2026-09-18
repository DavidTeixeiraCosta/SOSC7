import React from 'react';
import { OrdemServico } from '../types';
import { formatCurrency, formatDateBR, formatOSNumber } from '../utils/formatters';
import { User, X, Laptop, Calendar, DollarSign, CheckCircle } from 'lucide-react';

interface ClienteHistoricoModalProps {
  osAtual: OrdemServico;
  todasOrdens: OrdemServico[];
  onSelecionarOS: (numeroOS: number) => void;
  onClose: () => void;
}

export const ClienteHistoricoModal: React.FC<ClienteHistoricoModalProps> = ({
  osAtual,
  todasOrdens,
  onSelecionarOS,
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
            className="text-white hover:bg-orange-700 p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Cliente */}
        <div className="p-4 bg-orange-50 border-b border-orange-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
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
        </div>

        {/* Lista de OS do Cliente */}
        <div className="p-4 overflow-y-auto max-h-[50vh] space-y-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Todas as Ordens de Serviço deste Cliente:
          </h4>

          {ordensCliente.map((os) => {
            const isAtual = os.numeroOS === osAtual.numeroOS;
            return (
              <div
                key={os.numeroOS}
                onClick={() => {
                  onSelecionarOS(os.numeroOS);
                  onClose();
                }}
                className={`p-3 rounded-lg border transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isAtual
                    ? 'border-orange-500 bg-orange-100/50 shadow-sm'
                    : 'border-gray-300 hover:border-orange-400 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-orange-500 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                    OS {formatOSNumber(os.numeroOS)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">
                        {os.aparelho} {os.marca} {os.modelo}
                      </span>
                      {isAtual && (
                        <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          ATUAL NA TELA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                      <span className="font-semibold">Defeito:</span> {os.defeitos}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                      <span>Entrada: {formatDateBR(os.dataEntrada)}</span>
                      <span>Atendente: {os.atendente}</span>
                      {os.tecnico && <span>Técnico: {os.tecnico}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    os.status === 'Liberado' ? 'bg-green-100 text-green-800' :
                    os.status === 'Retirado' ? 'bg-gray-200 text-gray-700' :
                    os.status === 'Aprovado' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {os.status}
                  </span>
                  <span className="font-mono font-bold text-sm text-gray-800">
                    {formatCurrency(os.valorTotal || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-100 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-semibold text-xs transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
