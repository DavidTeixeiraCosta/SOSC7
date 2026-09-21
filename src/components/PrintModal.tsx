import React from 'react';
import { OrdemServico } from '../types';
import { formatCurrency, formatDateBR, formatOSNumber } from '../utils/formatters';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import { Chip7Logo } from './Chip7Logo';

interface PrintModalProps {
  os: OrdemServico;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ os, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const renderA4Document = () => (
    <div className="bg-white text-black font-sans text-xs leading-normal p-6 border-2 border-black max-w-[210mm] mx-auto min-h-[280mm] flex flex-col justify-between box-border">
      {/* 1. CABEÇALHO DA EMPRESA E IDENTIFICAÇÃO DA OS */}
      <div>
        <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-3">
          <div className="flex items-center gap-3">
            <Chip7Logo size="md" />
            <div>
              <h1 className="font-black text-base tracking-wide text-black uppercase">
                CHIP7 INFORMÁTICA & ASSISTÊNCIA TÉCNICA
              </h1>
              <p className="text-[11px] text-gray-800 font-medium">
                Manutenção Especializada de Notebooks, Computadores, Smartphones e Impressoras
              </p>
              <p className="text-[10px] text-gray-700">
                David Teixeira • WhatsApp / Telefone: <strong>(19) 99876-5432</strong> • E-mail: contato@chip7informatica.com.br
              </p>
              <p className="text-[10px] text-gray-600">
                Rua do Comércio, 1500 - Centro - Piracicaba / SP • CEP: 13400-000
              </p>
            </div>
          </div>

          <div className="text-right border-2 border-black p-2 bg-gray-50 rounded min-w-[170px]">
            <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              ORDEM DE SERVIÇO
            </div>
            <div className="text-2xl font-mono font-black text-red-700 leading-tight">
              Nº {formatOSNumber(os.numeroOS)}
            </div>
            <div className="text-[10px] font-semibold text-gray-800 mt-0.5">
              Entrada: <strong>{formatDateBR(os.dataEntrada)}</strong>
            </div>
            <div className="text-[10px] font-bold uppercase mt-1 px-1.5 py-0.5 bg-black text-white text-center rounded">
              STATUS: {os.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* 2. DADOS DO CLIENTE */}
        <div className="mb-3">
          <div className="bg-gray-200 font-bold px-2 py-1 border border-black text-[11px] uppercase tracking-wide flex justify-between items-center">
            <span>1. DADOS DO CLIENTE</span>
            <span className="text-[10px] font-normal text-gray-700 font-mono">REGISTRO #{formatOSNumber(os.numeroOS)}</span>
          </div>
          <div className="border border-t-0 border-black p-2 bg-white space-y-1.5 text-[11px]">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-8">
                <span className="font-bold text-gray-900">Nome / Razão Social:</span>{' '}
                <span className="font-semibold text-black uppercase">{os.nomeCliente}</span>
              </div>
              <div className="col-span-4">
                <span className="font-bold text-gray-900">CPF / CNPJ:</span>{' '}
                <span className="font-mono">{os.cpfCnpj || 'Não Informado'}</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-8">
                <span className="font-bold text-gray-900">Endereço Completo:</span>{' '}
                <span>{os.endereco || 'Não Informado'}</span>
              </div>
              <div className="col-span-4">
                <span className="font-bold text-gray-900">CEP:</span>{' '}
                <span className="font-mono">{os.cep || 'S/N'}</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4">
                <span className="font-bold text-gray-900">Telefone Principal:</span>{' '}
                <span className="font-bold text-black">{os.telefone}</span>
              </div>
              <div className="col-span-4">
                <span className="font-bold text-gray-900">Telefone Secundário:</span>{' '}
                <span>{os.telefone2 || 'Não Informado'}</span>
              </div>
              <div className="col-span-4">
                <span className="font-bold text-gray-900">E-mail:</span>{' '}
                <span className="truncate">{os.email || 'Não Informado'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. DADOS DO EQUIPAMENTO */}
        <div className="mb-3">
          <div className="bg-gray-200 font-bold px-2 py-1 border border-black text-[11px] uppercase tracking-wide">
            2. DADOS DO EQUIPAMENTO
          </div>
          <div className="border border-t-0 border-black p-2 bg-white space-y-1.5 text-[11px]">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-3">
                <span className="font-bold text-gray-900">Aparelho:</span>{' '}
                <span className="font-semibold uppercase">{os.aparelho}</span>
              </div>
              <div className="col-span-3">
                <span className="font-bold text-gray-900">Marca:</span>{' '}
                <span className="font-semibold uppercase">{os.marca}</span>
              </div>
              <div className="col-span-3">
                <span className="font-bold text-gray-900">Modelo:</span>{' '}
                <span className="font-semibold">{os.modelo}</span>
              </div>
              <div className="col-span-3">
                <span className="font-bold text-gray-900">Nº de Série:</span>{' '}
                <span className="font-mono">{os.numeroSerie || 'Não Informado'}</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2 pt-1 border-t border-gray-200">
              <div className="col-span-5">
                <span className="font-bold text-red-800">Senha / Padrão de Desbloqueio:</span>{' '}
                <span className="font-mono font-bold bg-yellow-100 px-1.5 py-0.5 border border-yellow-400 rounded text-red-900">
                  {os.senhaAparelho || 'NÃO POSSUI'}
                </span>
              </div>
              <div className="col-span-7">
                <span className="font-bold text-gray-900">Acessórios Deixados com o Aparelho:</span>{' '}
                <span>{os.acessorios || 'Nenhum acessório entregue'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. DEFEITO RECLAMADO & LAUDO TÉCNICO */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="bg-gray-200 font-bold px-2 py-1 border border-black text-[11px] uppercase tracking-wide">
              3. DEFEITO RECLAMADO PELO CLIENTE
            </div>
            <div className="border border-t-0 border-black p-2 min-h-[70px] bg-white text-[11px] leading-relaxed">
              {os.defeitos}
            </div>
          </div>

          <div>
            <div className="bg-gray-200 font-bold px-2 py-1 border border-black text-[11px] uppercase tracking-wide">
              4. LAUDO / DIAGNÓSTICO TÉCNICO DE BANCADA
            </div>
            <div className="border border-t-0 border-black p-2 min-h-[70px] bg-white text-[11px] leading-relaxed">
              {os.laudoTecnico || os.observacoes || 'Equipamento recepcionado para análise técnica, abertura e medições de bancada.'}
            </div>
          </div>
        </div>

        {/* 5. DISCRIMINAÇÃO DOS SERVIÇOS E PEÇAS / ORÇAMENTO */}
        <div className="mb-3">
          <div className="bg-gray-200 font-bold px-2 py-1 border border-black text-[11px] uppercase tracking-wide flex justify-between items-center">
            <span>5. DISCRIMINAÇÃO DOS SERVIÇOS EXECUTADOS & PEÇAS UTILIZADAS</span>
            <span className="text-[10px] font-normal text-gray-700">VALORES EM MOEDA NACIONAL (R$)</span>
          </div>
          <table className="w-full border-collapse border border-t-0 border-black text-[11px]">
            <thead>
              <tr className="bg-gray-100 border-b border-black font-bold">
                <th className="text-center p-1.5 border-r border-black w-10">Item</th>
                <th className="text-left p-1.5 border-r border-black">Descrição Detalhada do Serviço / Peça Aplicada</th>
                <th className="text-right p-1.5 w-32">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {os.orcamento && os.orcamento.filter(it => it.item || it.valor > 0).length > 0 ? (
                os.orcamento.filter(it => it.item || it.valor > 0).map((it, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="p-1.5 border-r border-black text-center font-mono">{idx + 1}</td>
                    <td className="p-1.5 border-r border-black font-medium">{it.item}</td>
                    <td className="p-1.5 text-right font-mono">{formatCurrency(it.valor)}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-gray-300">
                  <td className="p-1.5 border-r border-black text-center font-mono">1</td>
                  <td className="p-1.5 border-r border-black italic text-gray-600">
                    Orçamento sob avaliação e aprovação prévia do cliente
                  </td>
                  <td className="p-1.5 text-right font-mono text-gray-500">A definir</td>
                </tr>
              )}
              <tr className="font-black bg-gray-100 border-t-2 border-black text-xs">
                <td colSpan={2} className="p-2 text-right border-r border-black uppercase tracking-wider">
                  VALOR TOTAL DA ORDEM DE SERVIÇO:
                </td>
                <td className="p-2 text-right text-sm font-mono text-black">
                  {formatCurrency(os.valorTotal || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 6. DADOS DO ATENDIMENTO & DATAS */}
        <div className="grid grid-cols-12 gap-2 border border-black p-2 bg-gray-50 mb-3 text-[10px]">
          <div className="col-span-3">
            <span className="font-bold text-gray-800">Atendente Responsável:</span>{' '}
            <span className="font-semibold">{os.atendente}</span>
          </div>
          <div className="col-span-3">
            <span className="font-bold text-gray-800">Técnico Encarregado:</span>{' '}
            <span className="font-semibold">{os.tecnico || 'Bancada Geral'}</span>
          </div>
          <div className="col-span-3">
            <span className="font-bold text-gray-800">Data de Entrada:</span>{' '}
            <span>{formatDateBR(os.dataEntrada)}</span>
          </div>
          <div className="col-span-3">
            <span className="font-bold text-gray-800">Data de Saída / Liberação:</span>{' '}
            <span>{os.dataLiberado ? formatDateBR(os.dataLiberado) : os.dataRetirado ? formatDateBR(os.dataRetirado) : 'Em Aberto'}</span>
          </div>
        </div>

        {/* 7. TERMOS DE GARANTIA E CONDIÇÕES LEGAIS */}
        <div className="border border-black p-2 bg-white text-[9.5px] text-gray-900 leading-tight space-y-1 mb-4">
          <p className="font-bold uppercase tracking-wider text-[10px] border-b border-gray-300 pb-0.5">
            CONDIÇÕES GERAIS DE PRESTAÇÃO DE SERVIÇOS E TERMO DE GARANTIA:
          </p>
          <p>
            <strong>1. Prazo Legal de Garantia:</strong> Conforme Artigo 26, inciso II da Lei Federal nº 8.078/1990 (Código de Defesa do Consumidor), é concedida garantia legal de <strong>90 (noventa) dias</strong> corridos, exclusivamente sobre os serviços técnicos executados e componentes substituídos discriminados expressamente nesta Ordem de Serviço, contados a partir da data efetiva da retirada do equipamento.
          </p>
          <p>
            <strong>2. Exclusões de Garantia:</strong> A garantia perderá total validade em caso de constatação de mau uso, quedas, choques mecânicos, contato com umidade ou líquidos, sobretensão ou descargas elétricas, vírus/malwares, instalação indevida de softwares pelo usuário, selos/lacres de garantia violados ou qualquer intervenção efetuada por terceiros não autorizados.
          </p>
          <p>
            <strong>3. Responsabilidade de Dados / Backups:</strong> A empresa NÃO se responsabiliza por perdas de dados, fotos, programas ou arquivos armazenados no equipamento. É dever exclusivo do cliente possuir cópias de segurança (backups) de suas informações prévias ao envio para manutenção.
          </p>
          <p>
            <strong>4. Prazo Máximo de Retirada:</strong> Equipamentos orçados, reparados ou com laudo concluído que não forem retirados no prazo máximo de <strong>90 (noventa) dias</strong> após comunicação formal (por ligação, WhatsApp ou e-mail), serão considerados abandonados para fins de ressarcimento de custos de peças e guarda, nos termos da legislação civil vigente.
          </p>
        </div>
      </div>

      {/* 8. ASSINATURAS E RESPONSABILIDADES (PARTE INFERIOR DA FOLHA A4) */}
      <div className="pt-2 border-t-2 border-black">
        <div className="text-[10px] text-center text-gray-700 italic mb-4">
          Declaro que li e concordo plenamente com as condições e valores descritos nesta Ordem de Serviço, conferindo os dados e equipamentos aqui listados.
        </div>
        <div className="grid grid-cols-2 gap-10 px-4">
          <div className="text-center">
            <div className="border-t-2 border-black pt-1">
              <p className="font-bold text-xs uppercase text-black">{os.nomeCliente}</p>
              <p className="text-[10px] text-gray-600">Assinatura do Cliente / Responsável</p>
              <p className="text-[9px] text-gray-500 font-mono">CPF: {os.cpfCnpj || '_______________________'}</p>
            </div>
          </div>

          <div className="text-center">
            <div className="border-t-2 border-black pt-1">
              <p className="font-bold text-xs uppercase text-black">CHIP7 INFORMÁTICA & ASSISTÊNCIA</p>
              <p className="text-[10px] text-gray-600">Responsável Técnico / Atendente: {os.atendente}</p>
              <p className="text-[9px] text-gray-500">Piracicaba / SP • Sistema Chip7 OS v2.4</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Modal de Pré-visualização na Tela (no-print) */}
      <div id="modal-imprimir-wrapper" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-5 no-print overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[96vh] flex flex-col overflow-hidden border-2 border-orange-500">
          {/* Header Superior */}
          <div className="bg-[#ff6600] text-white px-5 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              <h3 className="font-bold text-base sm:text-lg">
                Impressão de Ordem de Serviço (Folha A4 Completa) • OS #{formatOSNumber(os.numeroOS)}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-orange-700 p-1.5 rounded transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de Ações Rápidas */}
          <div className="bg-orange-50 border-b border-orange-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-orange-300 font-bold text-orange-950">
                📄 Formato Oficial: 1 Folha A4 Completa
              </span>
              <span className="hidden sm:inline text-gray-500">
                (Pronto para impressoras térmicas, jato de tinta, laser ou salvar em PDF)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="bg-[#2e7d32] hover:bg-green-700 text-white font-bold px-5 py-2 rounded flex items-center gap-2 text-sm shadow transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar PDF</span>
              </button>
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded text-sm transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>

          {/* Área de Visualização com Estilo Folha de Papel A4 Real */}
          <div className="p-4 sm:p-6 overflow-y-auto bg-gray-300 flex justify-center items-start">
            <div className="shadow-2xl bg-white w-full max-w-[210mm] border border-gray-400">
              {renderA4Document()}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Renderizado Somente para a Impressora / PDF (@media print) */}
      <div className="print-only">
        {renderA4Document()}
      </div>
    </>
  );
};

