import React, { useState } from 'react';
import { OrdemServico } from '../types';
import { formatCurrency, formatDateBR, formatOSNumber } from '../utils/formatters';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface PrintModalProps {
  os: OrdemServico;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ os, onClose }) => {
  const [tipoVia, setTipoVia] = useState<'dupla' | 'cliente' | 'loja'>('dupla');

  const handlePrint = () => {
    window.print();
  };

  const renderViaContent = (tituloVia: string) => (
    <div className="border-2 border-black p-4 mb-6 bg-white text-black font-sans text-xs leading-tight">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white px-2 py-1 font-black text-lg tracking-wider">
            CHIP7
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide">CHIP7 INFORMÁTICA & ASSISTÊNCIA TÉCNICA</h2>
            <p className="text-[10px] text-gray-700">Manutenção de Notebooks, Desktops, Smartphones e Impressoras</p>
            <p className="text-[10px] text-gray-700">Responsável Técnico: David Teixeira | Tel / WhatsApp: (19) 99876-5432</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-bold uppercase bg-gray-200 px-2 py-0.5 border border-black inline-block mb-1">
            {tituloVia}
          </div>
          <div className="text-base font-black tracking-tight text-red-700">
            OS Nº {formatOSNumber(os.numeroOS)}
          </div>
          <div className="text-[10px]">Data: {formatDateBR(os.dataEntrada)}</div>
        </div>
      </div>

      {/* Dados do Cliente */}
      <div className="bg-gray-100 font-bold px-1.5 py-0.5 border border-black mb-1 text-[11px]">
        1. DADOS DO CLIENTE
      </div>
      <div className="grid grid-cols-12 gap-1 border border-black p-1.5 mb-2 text-[11px]">
        <div className="col-span-8">
          <span className="font-bold">Cliente:</span> {os.nomeCliente}
        </div>
        <div className="col-span-4">
          <span className="font-bold">CPF/CNPJ:</span> {os.cpfCnpj || 'Não informado'}
        </div>
        <div className="col-span-8">
          <span className="font-bold">Endereço:</span> {os.endereco || 'Não informado'} - CEP: {os.cep || 'S/N'}
        </div>
        <div className="col-span-4">
          <span className="font-bold">Telefone(s):</span> {os.telefone} {os.telefone2 ? ` / ${os.telefone2}` : ''}
        </div>
        <div className="col-span-12">
          <span className="font-bold">E-mail:</span> {os.email || 'Não informado'}
        </div>
      </div>

      {/* Dados do Aparelho */}
      <div className="bg-gray-100 font-bold px-1.5 py-0.5 border border-black mb-1 text-[11px]">
        2. DADOS DO EQUIPAMENTO
      </div>
      <div className="grid grid-cols-12 gap-1 border border-black p-1.5 mb-2 text-[11px]">
        <div className="col-span-3">
          <span className="font-bold">Aparelho:</span> {os.aparelho}
        </div>
        <div className="col-span-3">
          <span className="font-bold">Marca:</span> {os.marca}
        </div>
        <div className="col-span-3">
          <span className="font-bold">Modelo:</span> {os.modelo}
        </div>
        <div className="col-span-3">
          <span className="font-bold">Nº de Série:</span> {os.numeroSerie || 'S/N'}
        </div>
        {os.senhaAparelho && (
          <div className="col-span-12 font-bold text-red-700">
            Senha / Padrão de Desbloqueio: {os.senhaAparelho}
          </div>
        )}
        <div className="col-span-12">
          <span className="font-bold">Acessórios deixados:</span> {os.acessorios || 'Nenhum'}
        </div>
      </div>

      {/* Defeitos & Diagnóstico */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="bg-gray-100 font-bold px-1.5 py-0.5 border border-black text-[11px]">
            3. DEFEITO RECLAMADO / RELATADO
          </div>
          <div className="border border-black border-t-0 p-1.5 min-h-[50px] text-[11px]">
            {os.defeitos}
          </div>
        </div>
        <div>
          <div className="bg-gray-100 font-bold px-1.5 py-0.5 border border-black text-[11px]">
            4. LAUDO / OBSERVAÇÕES TÉCNICAS
          </div>
          <div className="border border-black border-t-0 p-1.5 min-h-[50px] text-[11px]">
            {os.laudoTecnico || os.observacoes || 'Em avaliação pela bancada técnica.'}
          </div>
        </div>
      </div>

      {/* Orçamento e Valores */}
      <div className="bg-gray-100 font-bold px-1.5 py-0.5 border border-black mb-1 text-[11px] flex justify-between">
        <span>5. DISCRIMINAÇÃO DOS SERVIÇOS E PEÇAS</span>
        <span>STATUS: {os.status.toUpperCase()}</span>
      </div>
      <table className="w-full border-collapse border border-black mb-2 text-[11px]">
        <thead>
          <tr className="bg-gray-50 border-b border-black">
            <th className="text-left p-1 border-r border-black w-8">Item</th>
            <th className="text-left p-1 border-r border-black">Descrição do Serviço / Peça</th>
            <th className="text-right p-1 w-28">Valor (R$)</th>
          </tr>
        </thead>
        <tbody>
          {os.orcamento && os.orcamento.filter(it => it.item || it.valor > 0).length > 0 ? (
            os.orcamento.filter(it => it.item || it.valor > 0).map((it, idx) => (
              <tr key={idx} className="border-b border-gray-300">
                <td className="p-1 border-r border-black text-center">{idx + 1}</td>
                <td className="p-1 border-r border-black">{it.item}</td>
                <td className="p-1 text-right">{formatCurrency(it.valor)}</td>
              </tr>
            ))
          ) : (
            <tr className="border-b border-gray-300">
              <td className="p-1 border-r border-black text-center">1</td>
              <td className="p-1 border-r border-black italic text-gray-500">Orçamento sob análise técnica prévia</td>
              <td className="p-1 text-right">A definir</td>
            </tr>
          )}
          <tr className="font-bold bg-gray-100 border-t border-black">
            <td colSpan={2} className="p-1 text-right border-r border-black uppercase">
              Valor Total do Orçamento:
            </td>
            <td className="p-1 text-right text-sm">{formatCurrency(os.valorTotal || 0)}</td>
          </tr>
        </tbody>
      </table>

      {/* Termos e Condições da Garantia */}
      <div className="border border-black p-1.5 mb-3 text-[9px] text-gray-800 leading-tight">
        <p className="font-bold mb-0.5">TERMOS DE GARANTIA E CONDIÇÕES DE ATENDIMENTO:</p>
        <p>
          1. Conforme Artigo 26 da Lei 8.078/90 (Código de Defesa do Consumidor), a garantia é de <strong>90 (noventa) dias</strong> sobre os serviços executados e componentes substituídos discriminados nesta Ordem de Serviço, contados a partir da data de retirada.
        </p>
        <p>
          2. A garantia não cobre danos decorrentes de mau uso, quedas, contato com líquidos, oscilação de energia elétrica, lacres violados ou intervenção de terceiros.
        </p>
        <p>
          3. O cliente declara estar ciente de que equipamentos prontos não retirados no prazo de 90 dias após notificação poderão ser doados para reciclagem para cobrir despesas de guarda e peças.
        </p>
      </div>

      {/* Assinaturas */}
      <div className="grid grid-cols-2 gap-8 pt-4">
        <div className="text-center">
          <div className="border-t border-black pt-1 font-semibold text-[10px]">
            {os.nomeCliente}
          </div>
          <div className="text-[9px] text-gray-600">Assinatura do Cliente / Responsável</div>
        </div>
        <div className="text-center">
          <div className="border-t border-black pt-1 font-semibold text-[10px]">
            CHIP7 INFORMÁTICA - Atendente: {os.atendente}
          </div>
          <div className="text-[9px] text-gray-600">Assinatura do Técnico Responsável</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Modal na tela (visível apenas na tela, oculto na impressão) */}
      <div id="modal-imprimir-wrapper" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border-2 border-orange-500">
          {/* Top Header */}
          <div className="bg-[#ff6600] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              <h3 className="font-bold text-lg">Visualização de Impressão / PDF - OS #{formatOSNumber(os.numeroOS)}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-orange-700 p-1 rounded transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Opções de Controle */}
          <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">Formato:</span>
              <button
                onClick={() => setTipoVia('dupla')}
                className={`px-3 py-1 text-xs rounded font-medium transition ${
                  tipoVia === 'dupla' ? 'bg-[#ff6600] text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                2 Vias (Cliente + Loja)
              </button>
              <button
                onClick={() => setTipoVia('cliente')}
                className={`px-3 py-1 text-xs rounded font-medium transition ${
                  tipoVia === 'cliente' ? 'bg-[#ff6600] text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Apenas Via do Cliente
              </button>
              <button
                onClick={() => setTipoVia('loja')}
                className={`px-3 py-1 text-xs rounded font-medium transition ${
                  tipoVia === 'loja' ? 'bg-[#ff6600] text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Apenas Via da Loja/Bancada
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="bg-[#2e7d32] hover:bg-green-700 text-white font-bold px-4 py-1.5 rounded flex items-center gap-1.5 text-sm shadow transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Salvar em PDF
              </button>
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-3 py-1.5 rounded text-sm transition"
              >
                Fechar
              </button>
            </div>
          </div>

          {/* Área de Preview da folha */}
          <div className="p-6 overflow-y-auto bg-gray-200 flex justify-center">
            <div className="bg-white shadow-lg p-6 max-w-3xl w-full border border-gray-300">
              {(tipoVia === 'dupla' || tipoVia === 'cliente') && renderViaContent('VIA DO CLIENTE')}
              {tipoVia === 'dupla' && (
                <div className="border-t-2 border-dashed border-gray-500 my-4 text-center relative">
                  <span className="bg-white px-2 text-[10px] text-gray-500 relative -top-2">
                    - - - - - - - - - - - - - - - CORTE AQUI - - - - - - - - - - - - - - -
                  </span>
                </div>
              )}
              {(tipoVia === 'dupla' || tipoVia === 'loja') && renderViaContent('VIA DA LOJA / BANCADA')}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo puro enviado diretamente para a impressora (@media print) */}
      <div className="print-only">
        {(tipoVia === 'dupla' || tipoVia === 'cliente') && renderViaContent('VIA DO CLIENTE')}
        {tipoVia === 'dupla' && (
          <div className="border-t-2 border-dashed border-gray-600 my-3 text-center relative">
            <span className="bg-white px-2 text-[9px] text-gray-500 relative -top-2">
              - - - - - - - - - - - - - - - CORTE AQUI - - - - - - - - - - - - - - -
            </span>
          </div>
        )}
        {(tipoVia === 'dupla' || tipoVia === 'loja') && renderViaContent('VIA DA LOJA / BANCADA')}
      </div>
    </>
  );
};
