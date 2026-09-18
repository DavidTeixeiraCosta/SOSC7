import React, { useState, useMemo } from 'react';
import { OrdemServico, Tecnico } from '../types';
import { formatCurrency, formatDateBR, formatOSNumber } from '../utils/formatters';
import { Search, X, ChevronRight, Filter } from 'lucide-react';

interface BuscarOSModalProps {
  ordens: OrdemServico[];
  tecnicos: Tecnico[];
  onSelecionarOS: (numeroOS: number) => void;
  onClose: () => void;
}

export const BuscarOSModal: React.FC<BuscarOSModalProps> = ({
  ordens,
  tecnicos,
  onSelecionarOS,
  onClose
}) => {
  const [termo, setTermo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroAtendente, setFiltroAtendente] = useState<string>('todos');

  const ordensFiltradas = useMemo(() => {
    return ordens.filter(os => {
      if (os.apagado) return false;

      if (filtroStatus !== 'todos' && os.status !== filtroStatus) return false;
      if (filtroAtendente !== 'todos' && os.atendente !== filtroAtendente) return false;

      if (!termo.trim()) return true;

      const busca = termo.toLowerCase().trim();
      const numMatch = formatOSNumber(os.numeroOS).includes(busca) || String(os.numeroOS) === busca;
      const nomeMatch = os.nomeCliente.toLowerCase().includes(busca);
      const telMatch = os.telefone.includes(busca) || (os.telefone2 && os.telefone2.includes(busca));
      const aparelhoMatch = os.aparelho.toLowerCase().includes(busca) ||
        os.marca.toLowerCase().includes(busca) ||
        os.modelo.toLowerCase().includes(busca);
      const serieMatch = os.numeroSerie && os.numeroSerie.toLowerCase().includes(busca);
      const cpfMatch = os.cpfCnpj && os.cpfCnpj.includes(busca);

      return numMatch || nomeMatch || telMatch || aparelhoMatch || serieMatch || cpfMatch;
    });
  }, [ordens, termo, filtroStatus, filtroAtendente]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden border-2 border-orange-500">
        {/* Header */}
        <div className="bg-[#ff6600] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            <h3 className="font-bold text-lg">Buscar Ordens de Serviço</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-700 p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="p-4 bg-orange-50/50 border-b border-orange-200 space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Digite o Nº da OS, Nome do Cliente, Telefone, Aparelho ou Nº de Série..."
              className="w-full pl-10 pr-4 py-2 border-2 border-orange-300 rounded-lg text-sm bg-white focus:border-orange-500 outline-none shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar por:</span>
            </div>

            <div className="flex items-center gap-1">
              <label className="text-gray-600">Status:</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value="todos">Todos os Status</option>
                <option value="Entrada">Entrada</option>
                <option value="Em Análise">Em Análise</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Reprovado">Reprovado</option>
                <option value="Aguardando Peça">Aguardando Peça</option>
                <option value="Liberado">Liberado</option>
                <option value="Retirado">Retirado</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <label className="text-gray-600">Atendente:</label>
              <select
                value={filtroAtendente}
                onChange={(e) => setFiltroAtendente(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value="todos">Todos os Atendentes</option>
                {tecnicos.map(t => (
                  <option key={t.id} value={t.nome}>{t.nome}</option>
                ))}
              </select>
            </div>

            <span className="ml-auto text-gray-500 font-medium">
              {ordensFiltradas.length} {ordensFiltradas.length === 1 ? 'registro encontrado' : 'registros encontrados'}
            </span>
          </div>
        </div>

        {/* Tabela de Resultados */}
        <div className="overflow-y-auto max-h-[60vh] p-2">
          {ordensFiltradas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-base font-semibold">Nenhuma Ordem de Serviço encontrada.</p>
              <p className="text-xs mt-1">Verifique os termos de busca ou ajuste os filtros.</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase sticky top-0 border-b border-gray-300">
                <tr>
                  <th className="p-2 w-16 text-center">OS Nº</th>
                  <th className="p-2">Cliente</th>
                  <th className="p-2">Telefone</th>
                  <th className="p-2">Aparelho / Modelo</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Atendente</th>
                  <th className="p-2 text-right">Valor</th>
                  <th className="p-2 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ordensFiltradas.map((os) => {
                  const tec = tecnicos.find(t => t.nome === os.atendente);
                  return (
                    <tr
                      key={os.numeroOS}
                      onClick={() => {
                        onSelecionarOS(os.numeroOS);
                        onClose();
                      }}
                      className="hover:bg-orange-100/60 cursor-pointer transition"
                    >
                      <td className="p-2 font-mono font-bold text-center text-orange-950">
                        {formatOSNumber(os.numeroOS)}
                      </td>
                      <td className="p-2 font-semibold text-gray-900">{os.nomeCliente}</td>
                      <td className="p-2 text-gray-600">{os.telefone}</td>
                      <td className="p-2">
                        <div className="font-medium text-gray-800">{os.aparelho} {os.marca}</div>
                        <div className="text-[11px] text-gray-500">{os.modelo}</div>
                      </td>
                      <td className="p-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          os.status === 'Liberado' ? 'bg-green-100 text-green-800 border border-green-300' :
                          os.status === 'Aprovado' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          os.status === 'Retirado' ? 'bg-gray-200 text-gray-700 border border-gray-400' :
                          os.status === 'Reprovado' ? 'bg-red-100 text-red-800 border border-red-300' :
                          os.status === 'Aguardando Peça' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                          'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {os.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-3 h-3 rounded-full border border-black flex-shrink-0"
                            style={{ backgroundColor: tec?.cor || '#ff6600' }}
                          />
                          <span>{os.atendente}</span>
                        </div>
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-gray-800">
                        {formatCurrency(os.valorTotal || 0)}
                      </td>
                      <td className="p-2 text-center text-gray-400 hover:text-orange-600">
                        <ChevronRight className="w-4 h-4" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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
