import React from 'react';
import { OrdemServico, Tecnico } from '../types';
import { formatCurrency } from '../utils/formatters';
import { BarChart3, X, TrendingUp, Users, CheckCircle2, Clock, DollarSign } from 'lucide-react';

interface EstatisticasModalProps {
  ordens: OrdemServico[];
  tecnicos: Tecnico[];
  onClose: () => void;
}

export const EstatisticasModal: React.FC<EstatisticasModalProps> = ({
  ordens,
  tecnicos,
  onClose
}) => {
  const ativas = ordens.filter(os => !os.apagado);
  const totalOS = ativas.length;

  const faturamentoTotal = ativas.reduce((acc, curr) => {
    // Only count approved, released, or picked up
    if (['Aprovado', 'Liberado', 'Retirado'].includes(curr.status)) {
      return acc + (curr.valorTotal || 0);
    }
    return acc;
  }, 0);

  const faturamentoPrevisto = ativas.reduce((acc, curr) => acc + (curr.valorTotal || 0), 0);
  const ticketMedio = totalOS > 0 ? faturamentoTotal / (ativas.filter(o => ['Aprovado', 'Liberado', 'Retirado'].includes(o.status)).length || 1) : 0;

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  ativas.forEach(os => {
    statusCounts[os.status] = (statusCounts[os.status] || 0) + 1;
  });

  const statusList = [
    { label: 'Entrada', color: '#ff9800' },
    { label: 'Em Análise', color: '#00bcd4' },
    { label: 'Aprovado', color: '#2196f3' },
    { label: 'Aguardando Peça', color: '#9c27b0' },
    { label: 'Liberado', color: '#4caf50' },
    { label: 'Retirado', color: '#607d8b' },
    { label: 'Reprovado', color: '#f44336' }
  ];

  // Technician breakdown
  const tecStats: Record<string, { count: number; total: number }> = {};
  ativas.forEach(os => {
    const tecNome = os.atendente || 'Outros';
    if (!tecStats[tecNome]) {
      tecStats[tecNome] = { count: 0, total: 0 };
    }
    tecStats[tecNome].count += 1;
    tecStats[tecNome].total += os.valorTotal || 0;
  });

  // Aparelhos breakdown
  const aparelhoCounts: Record<string, number> = {};
  ativas.forEach(os => {
    const ap = os.aparelho.trim() || 'Outro';
    aparelhoCounts[ap] = (aparelhoCounts[ap] || 0) + 1;
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden border-2 border-orange-500 my-4">
        {/* Header */}
        <div className="bg-[#ff6600] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <h3 className="font-bold text-lg">Estatísticas e Métricas - Chip7 Informática</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-700 p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[80vh] space-y-5 text-xs">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg shadow-sm">
              <span className="text-gray-600 font-semibold block text-[11px]">Total de OS Registradas</span>
              <div className="text-2xl font-black text-orange-600 mt-1">{totalOS}</div>
              <span className="text-[10px] text-gray-500">Na base ativa do sistema</span>
            </div>

            <div className="bg-green-50 border border-green-200 p-3 rounded-lg shadow-sm">
              <span className="text-gray-600 font-semibold block text-[11px]">Faturamento Realizado</span>
              <div className="text-2xl font-black text-green-700 mt-1 font-mono">
                {formatCurrency(faturamentoTotal)}
              </div>
              <span className="text-[10px] text-gray-500">OS Aprovadas e Entregues</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg shadow-sm">
              <span className="text-gray-600 font-semibold block text-[11px]">Faturamento Projetado</span>
              <div className="text-2xl font-black text-blue-700 mt-1 font-mono">
                {formatCurrency(faturamentoPrevisto)}
              </div>
              <span className="text-[10px] text-gray-500">Total com orçamentos abertos</span>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg shadow-sm">
              <span className="text-gray-600 font-semibold block text-[11px]">Ticket Médio por OS</span>
              <div className="text-2xl font-black text-purple-700 mt-1 font-mono">
                {formatCurrency(ticketMedio)}
              </div>
              <span className="text-[10px] text-gray-500">Média de valor por serviço</span>
            </div>
          </div>

          {/* Gráfico de Barras: Distribuição por Status */}
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h4 className="font-bold text-gray-800 text-sm mb-3 uppercase flex items-center justify-between">
              <span>Distribuição por Status Atual</span>
              <span className="text-xs text-gray-500 font-normal">{totalOS} Ordens no total</span>
            </h4>

            <div className="space-y-2.5">
              {statusList.map(s => {
                const count = statusCounts[s.label] || 0;
                const percent = totalOS > 0 ? Math.round((count / totalOS) * 100) : 0;

                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="w-32 font-semibold text-gray-700 truncate">{s.label}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: s.color
                        }}
                      />
                    </div>
                    <span className="w-16 text-right font-mono font-bold text-gray-800">
                      {count} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duas Colunas: Técnicos e Tipos de Aparelho */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Técnicos / Atendentes */}
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <h4 className="font-bold text-gray-800 text-sm mb-3 uppercase">
                👨‍🔧 Desempenho por Atendente / Técnico
              </h4>
              <div className="space-y-3">
                {Object.entries(tecStats).map(([nome, stat]) => {
                  const tecInfo = tecnicos.find(t => t.nome === nome);
                  return (
                    <div key={nome} className="bg-white p-2.5 rounded border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-black flex-shrink-0"
                          style={{ backgroundColor: tecInfo?.cor || '#ff6600' }}
                        />
                        <div>
                          <div className="font-bold text-gray-900">{nome}</div>
                          <div className="text-[10px] text-gray-500">{tecInfo?.cargo || 'Equipe Chip7'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-gray-800 block">
                          {stat.count} {stat.count === 1 ? 'OS' : 'OSs'}
                        </span>
                        <span className="text-[10px] text-green-700 font-semibold font-mono">
                          {formatCurrency(stat.total)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tipos de Aparelhos */}
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <h4 className="font-bold text-gray-800 text-sm mb-3 uppercase">
                💻 Categorias de Aparelhos Atendidos
              </h4>
              <div className="space-y-2">
                {Object.entries(aparelhoCounts).map(([ap, count]) => {
                  const percent = totalOS > 0 ? Math.round((count / totalOS) * 100) : 0;
                  return (
                    <div key={ap} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
                      <span className="font-medium text-gray-800">{ap}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-orange-600">{count} un</span>
                        <span className="text-gray-400 text-[10px]">({percent}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
