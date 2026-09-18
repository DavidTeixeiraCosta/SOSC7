/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { OrdemServico, Tecnico, ModalType } from './types';
import { ORDENS_INICIAIS, TECNICOS_PADRAO } from './data/initialData';
import { formatCurrency, formatDateBR, formatOSNumber } from './utils/formatters';
import { Chip7Logo } from './components/Chip7Logo';
import { PrintModal } from './components/PrintModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { NovaEditarOSModal } from './components/NovaEditarOSModal';
import { BuscarOSModal } from './components/BuscarOSModal';
import { ClienteHistoricoModal } from './components/ClienteHistoricoModal';
import { EstatisticasModal } from './components/EstatisticasModal';
import { BackupModal } from './components/BackupModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { Info, HelpCircle, Cloud } from 'lucide-react';
import { initAuth, getAccessToken } from './services/googleAuth';
import type { User } from 'firebase/auth';

const STORAGE_KEY = 'chip7_ordens_servico_db';
const TECNICOS_KEY = 'chip7_tecnicos_db';

export default function App() {
  // Google Drive state
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [isDriveConnected, setIsDriveConnected] = useState<boolean>(false);

  // Initialize Google Auth check
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setDriveUser(user);
        const hasToken = !!token || !!(await getAccessToken());
        setIsDriveConnected(hasToken);
      },
      () => {
        setDriveUser(null);
        setIsDriveConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Database state initialized from localStorage
  const [ordens, setOrdens] = useState<OrdemServico[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Erro ao ler ordens do localStorage', e);
      }
    }
    return ORDENS_INICIAIS;
  });

  const [tecnicos] = useState<Tecnico[]>(() => {
    const saved = localStorage.getItem(TECNICOS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Erro ao ler técnicos', e);
      }
    }
    return TECNICOS_PADRAO;
  });

  // Current active OS number
  const [currentNumeroOS, setCurrentNumeroOS] = useState<number>(() => {
    const ativas = (ordens || []).filter(o => !o.apagado);
    return ativas.length > 0 ? ativas[0].numeroOS : 1;
  });

  // Modal control
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordens));
  }, [ordens]);

  // Non-deleted orders
  const ordensAtivas = useMemo(() => {
    return ordens.filter(o => !o.apagado);
  }, [ordens]);

  // Current selected OS object
  const currentOS: OrdemServico | null = useMemo(() => {
    const found = ordens.find(o => o.numeroOS === currentNumeroOS && !o.apagado);
    if (found) return found;
    return ordensAtivas.length > 0 ? ordensAtivas[0] : null;
  }, [ordens, currentNumeroOS, ordensAtivas]);

  // Sync currentNumeroOS if current is null but there are active orders
  useEffect(() => {
    if (!currentOS && ordensAtivas.length > 0) {
      setCurrentNumeroOS(ordensAtivas[0].numeroOS);
    }
  }, [currentOS, ordensAtivas]);

  // Current attendant's signature color
  const atendenteAtual = useMemo(() => {
    if (!currentOS) return tecnicos[0];
    return tecnicos.find(t => t.nome.toLowerCase() === currentOS.atendente.toLowerCase()) || tecnicos[0];
  }, [currentOS, tecnicos]);

  // Navigation: Previous OS (< num, desc)
  const handleAnterior = () => {
    if (!currentOS) return;
    const sorted = [...ordensAtivas].sort((a, b) => b.numeroOS - a.numeroOS);
    const prev = sorted.find(o => o.numeroOS < currentOS.numeroOS);
    if (prev) {
      setCurrentNumeroOS(prev.numeroOS);
    } else {
      showNotification('Você já está na primeira Ordem de Serviço.');
    }
  };

  // Navigation: Next OS (> num, asc)
  const handleProximo = () => {
    if (!currentOS) return;
    const sorted = [...ordensAtivas].sort((a, b) => a.numeroOS - b.numeroOS);
    const next = sorted.find(o => o.numeroOS > currentOS.numeroOS);
    if (next) {
      setCurrentNumeroOS(next.numeroOS);
    } else {
      showNotification('Você já está na última Ordem de Serviço.');
    }
  };

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Soft Delete current OS
  const handleDeletar = () => {
    if (!currentOS) return;
    const confirmacao = window.confirm(
      `Deseja realmente deletar a Ordem de Serviço Nº ${formatOSNumber(currentOS.numeroOS)} (${currentOS.nomeCliente})?\n\nO número será preservado no banco (Soft Delete).`
    );

    if (confirmacao) {
      setOrdens(prev =>
        prev.map(os => (os.numeroOS === currentOS.numeroOS ? { ...os, apagado: true } : os))
      );
      showNotification(`OS Nº ${formatOSNumber(currentOS.numeroOS)} deletada com sucesso.`);

      // Navigate to next or previous available
      const restantes = ordensAtivas.filter(o => o.numeroOS !== currentOS.numeroOS);
      if (restantes.length > 0) {
        setCurrentNumeroOS(restantes[0].numeroOS);
      }
    }
  };

  // Save new or edited OS
  const handleSalvarOS = (osSalva: OrdemServico) => {
    const existe = ordens.some(o => o.numeroOS === osSalva.numeroOS);
    if (existe) {
      // Edit
      setOrdens(prev => prev.map(o => (o.numeroOS === osSalva.numeroOS ? osSalva : o)));
      showNotification(`OS Nº ${formatOSNumber(osSalva.numeroOS)} atualizada com sucesso!`);
    } else {
      // Create new
      setOrdens(prev => [osSalva, ...prev]);
      showNotification(`Nova OS Nº ${formatOSNumber(osSalva.numeroOS)} cadastrada com sucesso!`);
    }
    setCurrentNumeroOS(osSalva.numeroOS);
    setActiveModal(null);
  };

  // Next automatic OS Number
  const proximoNumero = useMemo(() => {
    if (ordens.length === 0) return 1;
    const max = Math.max(...ordens.map(o => o.numeroOS));
    return max + 1;
  }, [ordens]);

  // Restore backup
  const handleRestaurarBackup = (novasOrdens: OrdemServico[]) => {
    setOrdens(novasOrdens);
    const ativas = novasOrdens.filter(o => !o.apagado);
    if (ativas.length > 0) {
      setCurrentNumeroOS(ativas[0].numeroOS);
    }
  };

  // Restore defaults
  const handleRestaurarPadrao = () => {
    setOrdens(ORDENS_INICIAIS);
    setCurrentNumeroOS(ORDENS_INICIAIS[0].numeroOS);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f4ece6] text-black select-none text-[13px] font-sans">
      {/* Notificação Flutuante */}
      {feedbackMsg && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-2xl z-50 text-xs font-semibold flex items-center gap-2 border-l-4 border-orange-500 animate-fade-in no-print">
          <Info className="w-4 h-4 text-orange-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* CABEÇALHO LARANJA EXATO */}
      <header className="bg-[#ff6600] text-black px-4 py-2 text-center border-b-2 border-white relative shadow-sm flex items-center justify-between no-print">
        {/* Logo Esquerda */}
        <div className="flex items-center gap-3">
          <Chip7Logo size="md" />
        </div>

        {/* Título Central em Destaque */}
        <h1 className="font-['Impact',_sans-serif] tracking-widest text-2xl sm:text-3xl italic font-black text-black drop-shadow-[2px_2px_0px_white] uppercase">
          ORDENS DE SERVIÇO
        </h1>

        {/* Informações da Rede / Loja & Google Drive */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModal('googleDrive')}
            title={isDriveConnected ? `Google Drive Conectado: ${driveUser?.email || ''}` : 'Conectar ao Google Drive'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer border shadow-sm ${
              isDriveConnected
                ? 'bg-white hover:bg-green-50 text-green-800 border-green-600'
                : 'bg-white/90 hover:bg-white text-gray-900 border-black/20'
            }`}
          >
            <Cloud className={`w-3.5 h-3.5 ${isDriveConnected ? 'text-green-600' : 'text-gray-600'}`} />
            <span className="hidden md:inline">
              {isDriveConnected ? 'Drive Conectado' : 'Google Drive'}
            </span>
            {isDriveConnected && (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            )}
          </button>

          <div className="text-right hidden sm:block leading-tight">
            <span className="text-[11px] font-bold text-black bg-white/40 px-2 py-0.5 rounded border border-black/20">
              SISTEMA INTEGRADO V2.4
            </span>
            <p className="text-[10px] text-black/80 font-mono mt-0.5">ESTAÇÃO: CAIXA / PRINCIPAL</p>
          </div>
        </div>
      </header>

      {/* BARRA DE NAVEGAÇÃO DA OS */}
      <div className="bg-[#f4ece6] px-4 py-2.5 flex items-center justify-between border-b border-[#ff6600] no-print">
        <div className="flex items-center gap-2">
          <label className="text-base sm:text-lg font-bold text-gray-800">OrdemServiço:</label>
          <input
            type="text"
            id="numeroOS"
            readOnly
            value={currentOS ? formatOSNumber(currentOS.numeroOS) : '00000'}
            className="text-xl sm:text-2xl font-mono font-black text-center py-0.5 px-2 w-28 sm:w-32 bg-white border border-[#333] rounded shadow-inner text-gray-950"
          />

          <button
            id="btnAnt"
            onClick={handleAnterior}
            title="OS Anterior"
            className="bg-white hover:bg-orange-50 active:bg-orange-100 border border-[#333] rounded-full px-3.5 py-1 text-base cursor-pointer shadow-sm transition hover:scale-105 active:scale-95"
          >
            ⬅️
          </button>

          <button
            id="btnProx"
            onClick={handleProximo}
            title="Próxima OS"
            className="bg-white hover:bg-orange-50 active:bg-orange-100 border border-[#333] rounded-full px-3.5 py-1 text-base cursor-pointer shadow-sm transition hover:scale-105 active:scale-95"
          >
            ➡️
          </button>

          <span className="text-xs text-gray-500 ml-2 hidden md:inline">
            (Navegação sequencial de Ordens de Serviço)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-white/80 px-2.5 py-1 rounded border border-orange-300 text-xs">
            <span className="font-semibold text-gray-700">Atendente Atual:</span>
            <span className="font-bold text-gray-900">{currentOS?.atendente || 'Tália'}</span>
            <div
              className="w-3.5 h-3.5 rounded border border-black"
              style={{ backgroundColor: atendenteAtual?.cor || '#ff6600' }}
            />
          </div>
          <Chip7Logo size="sm" className="hidden sm:flex opacity-90" />
        </div>
      </div>

      {/* CONTAINER PRINCIPAL */}
      <div className="flex flex-1 overflow-hidden p-2.5 gap-2.5 no-print">
        {/* LADO ESQUERDO: Painel de Dados */}
        <div className="flex-[8] flex flex-col justify-between pr-2 overflow-y-auto">
          {currentOS ? (
            <div className="flex flex-col h-full justify-between">
              {/* SEÇÃO 1: Dados do Cliente */}
              <div className="border-b border-[#ff6600] pb-2.5">
                <div className="flex items-center mb-1.5 w-full">
                  <label className="w-24 text-xs font-bold text-gray-800 flex-shrink-0">Nome/Razão:</label>
                  <input
                    type="text"
                    id="nomeCliente"
                    readOnly
                    value={currentOS.nomeCliente}
                    className="flex-1 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] font-semibold text-gray-900 outline-none"
                  />
                </div>

                <div className="flex items-center mb-1.5 w-full gap-2">
                  <label className="w-24 text-xs font-bold text-gray-800 flex-shrink-0">Endereço:</label>
                  <input
                    type="text"
                    id="endereco"
                    readOnly
                    value={currentOS.endereco || ''}
                    className="flex-1 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] outline-none"
                  />
                  <label className="w-10 text-xs font-bold text-gray-800 text-right flex-shrink-0">CEP:</label>
                  <input
                    type="text"
                    id="cep"
                    readOnly
                    value={currentOS.cep || ''}
                    className="w-28 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] outline-none"
                  />
                </div>

                <div className="flex items-center mb-1.5 w-full gap-2">
                  <label className="w-24 text-xs font-bold text-gray-800 flex-shrink-0">Telefone:</label>
                  <input
                    type="text"
                    id="telefone"
                    readOnly
                    value={currentOS.telefone}
                    className="w-44 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] font-bold text-green-900 outline-none"
                  />
                  <input
                    type="text"
                    id="telefone2"
                    readOnly
                    value={currentOS.telefone2 || ''}
                    placeholder="Tel. Secundário"
                    className="w-44 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] outline-none"
                  />
                </div>

                <div className="flex items-center mb-1.5 w-full">
                  <label className="w-24 text-xs font-bold text-gray-800 flex-shrink-0">E-mail:</label>
                  <input
                    type="text"
                    id="email"
                    readOnly
                    value={currentOS.email || ''}
                    className="flex-1 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] outline-none"
                  />
                </div>

                <div className="flex items-center w-full">
                  <label className="w-24 text-xs font-bold text-gray-800 flex-shrink-0">CPF/CNPJ:</label>
                  <input
                    type="text"
                    id="cpfCnpj"
                    readOnly
                    value={currentOS.cpfCnpj || ''}
                    className="w-56 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] outline-none"
                  />
                </div>
              </div>

              {/* SEÇÃO 2: Dados do Aparelho & Orçamento */}
              <div className="border-b border-[#ff6600] py-2.5 flex-1 flex flex-col justify-between">
                {/* Linha Aparelho, Marca, Modelo, Nº Série */}
                <div className="grid grid-cols-12 gap-2 items-center mb-2">
                  <div className="col-span-3 flex items-center gap-1">
                    <label className="text-xs font-bold text-gray-800 flex-shrink-0">Aparelho:</label>
                    <input
                      type="text"
                      id="aparelho"
                      readOnly
                      value={currentOS.aparelho}
                      className="w-full px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] font-bold text-gray-900 outline-none"
                    />
                  </div>
                  <div className="col-span-3 flex items-center gap-1">
                    <label className="text-xs font-bold text-gray-800 flex-shrink-0">Marca:</label>
                    <input
                      type="text"
                      id="marca"
                      readOnly
                      value={currentOS.marca}
                      className="w-full px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] outline-none"
                    />
                  </div>
                  <div className="col-span-3 flex items-center gap-1">
                    <label className="text-xs font-bold text-gray-800 flex-shrink-0">Modelo:</label>
                    <input
                      type="text"
                      id="modelo"
                      readOnly
                      value={currentOS.modelo}
                      className="w-full px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] outline-none"
                    />
                  </div>
                  <div className="col-span-3 flex items-center gap-1">
                    <label className="text-xs font-bold text-gray-800 flex-shrink-0">Nº de Série:</label>
                    <input
                      type="text"
                      id="numeroSerie"
                      readOnly
                      value={currentOS.numeroSerie || ''}
                      className="w-full px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] outline-none"
                    />
                  </div>
                </div>

                {/* Split Layout: Acessórios & Orçamento (Esq) / Defeitos, Atendente & Observações (Dir) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {/* Coluna Esquerda */}
                  <div className="flex flex-col justify-between space-y-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">Acessórios:</label>
                      <textarea
                        id="acessorios"
                        readOnly
                        rows={2}
                        value={currentOS.acessorios || ''}
                        className="w-full px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] resize-none outline-none leading-tight"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-gray-800">Orçamento:</label>
                        <span className="text-[11px] font-bold text-orange-900 bg-orange-100 px-1.5 py-0.2 rounded">
                          Total: {formatCurrency(currentOS.valorTotal || 0)}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {/* Linha 1 */}
                        <input
                          type="text"
                          readOnly
                          value={currentOS.orcamento?.[0]?.item || ''}
                          placeholder="Serviço / Peça 1"
                          className="col-span-3 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] outline-none truncate"
                        />
                        <input
                          type="text"
                          readOnly
                          value={currentOS.orcamento?.[0]?.valor ? formatCurrency(currentOS.orcamento[0].valor) : ''}
                          placeholder="R$ 0,00"
                          className="col-span-1 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] text-right font-mono font-medium outline-none"
                        />

                        {/* Linha 2 */}
                        <input
                          type="text"
                          readOnly
                          value={currentOS.orcamento?.[1]?.item || ''}
                          placeholder="Serviço / Peça 2"
                          className="col-span-3 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] outline-none truncate"
                        />
                        <input
                          type="text"
                          readOnly
                          value={currentOS.orcamento?.[1]?.valor ? formatCurrency(currentOS.orcamento[1].valor) : ''}
                          placeholder="R$ 0,00"
                          className="col-span-1 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] text-right font-mono font-medium outline-none"
                        />

                        {/* Linha 3 */}
                        <input
                          type="text"
                          readOnly
                          value={currentOS.orcamento?.[2]?.item || ''}
                          placeholder="Serviço / Peça 3"
                          className="col-span-3 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] outline-none truncate"
                        />
                        <input
                          type="text"
                          readOnly
                          value={currentOS.orcamento?.[2]?.valor ? formatCurrency(currentOS.orcamento[2].valor) : ''}
                          placeholder="R$ 0,00"
                          className="col-span-1 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] text-right font-mono font-medium outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coluna Direita */}
                  <div className="flex flex-col justify-between space-y-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">Defeitos:</label>
                      <textarea
                        id="defeitos"
                        readOnly
                        rows={2}
                        value={currentOS.defeitos}
                        className="w-full px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] resize-none outline-none leading-tight font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-gray-800 flex-shrink-0">Atendente:</label>
                      <select
                        id="atendente"
                        disabled
                        value={currentOS.atendente}
                        className="flex-1 px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] font-bold text-gray-800 cursor-default opacity-100"
                      >
                        {tecnicos.map(t => (
                          <option key={t.id} value={t.nome}>{t.nome}</option>
                        ))}
                      </select>
                      {/* Cor do técnico idêntica à foto */}
                      <div
                        id="cor-tecnico"
                        className="w-5 h-5 border border-black rounded shadow-sm flex-shrink-0"
                        style={{ backgroundColor: atendenteAtual?.cor || '#ff6600' }}
                        title={`Cor registrada do atendente: ${currentOS.atendente}`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">Observações:</label>
                      <textarea
                        id="observacoes"
                        readOnly
                        rows={2}
                        value={currentOS.observacoes || currentOS.laudoTecnico || ''}
                        className="w-full px-2 py-1 text-xs border border-[#333] rounded bg-[#fafafa] resize-none outline-none leading-tight"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: Status Bar Inferior */}
              <div className="pt-2">
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  <div className="flex flex-col items-center">
                    <label className="text-[10px] font-bold text-gray-700 mb-0.5">Entrada:</label>
                    <input
                      type="text"
                      id="d_entrada"
                      readOnly
                      value={formatDateBR(currentOS.dataEntrada)}
                      className="w-full text-center text-[11px] py-0.5 border border-[#333] rounded bg-[#fafafa] font-mono"
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <label className="text-[10px] font-bold text-gray-700 mb-0.5">Pendência:</label>
                    <input
                      type="text"
                      id="d_pendencia"
                      readOnly
                      value={formatDateBR(currentOS.dataPendencia)}
                      className="w-full text-center text-[11px] py-0.5 border border-[#333] rounded bg-[#fafafa] font-mono"
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <label className="text-[10px] font-bold text-gray-700 mb-0.5">Aprovado:</label>
                    <input
                      type="text"
                      id="d_aprovado"
                      readOnly
                      value={formatDateBR(currentOS.dataAprovado)}
                      className="w-full text-center text-[11px] py-0.5 border border-[#333] rounded bg-[#fafafa] font-mono text-blue-900"
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <label className="text-[10px] font-bold text-gray-700 mb-0.5">Reprovado:</label>
                    <input
                      type="text"
                      id="d_reprovado"
                      readOnly
                      value={formatDateBR(currentOS.dataReprovado)}
                      className="w-full text-center text-[11px] py-0.5 border border-[#333] rounded bg-[#fafafa] font-mono text-red-700"
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <label className="text-[10px] font-bold text-gray-700 mb-0.5">Liberado:</label>
                    <input
                      type="text"
                      id="d_liberado"
                      readOnly
                      value={formatDateBR(currentOS.dataLiberado)}
                      className="w-full text-center text-[11px] py-0.5 border border-[#333] rounded bg-[#fafafa] font-mono text-green-900 font-bold"
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <label className="text-[10px] font-bold text-gray-700 mb-0.5">Retirado:</label>
                    <input
                      type="text"
                      id="d_retirado"
                      readOnly
                      value={formatDateBR(currentOS.dataRetirado)}
                      className="w-full text-center text-[11px] py-0.5 border border-[#333] rounded bg-[#fafafa] font-mono text-gray-600"
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <label className="text-[10px] font-bold text-gray-700 mb-0.5">Status:</label>
                    <input
                      type="text"
                      id="status"
                      readOnly
                      value={currentOS.status}
                      className="w-full text-center text-[11px] py-0.5 border border-[#333] rounded bg-white font-bold text-orange-900"
                    />
                  </div>

                  <div className="flex flex-col items-center">
                    <label className="text-[10px] font-bold text-gray-700 mb-0.5">Técnico:</label>
                    <input
                      type="text"
                      id="tecnico"
                      readOnly
                      value={currentOS.tecnico || currentOS.atendente}
                      className="w-full text-center text-[11px] py-0.5 border border-[#333] rounded bg-[#fafafa] font-bold truncate"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white/60 rounded border border-orange-300">
              <h3 className="text-lg font-bold text-gray-800">Nenhuma Ordem de Serviço Ativa</h3>
              <p className="text-xs text-gray-600 mt-1 mb-4">
                Clique no botão "📄 Nova OS" no menu lateral para iniciar um novo registro.
              </p>
              <button
                onClick={() => setActiveModal('nova')}
                className="bg-[#ff6600] hover:bg-orange-700 text-white font-bold px-4 py-2 rounded text-xs shadow cursor-pointer"
              >
                📄 Criar Nova OS
              </button>
            </div>
          )}
        </div>

        {/* LADO DIREITO: Painel de Botões Menu */}
        <div className="flex-[2] border-l border-[#ff6600] pl-2.5 flex flex-col justify-between bg-[#fffaf0] rounded-r p-1">
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveModal('nova')}
              className="w-full py-2.5 px-3 text-left bg-transparent border-0 border-b border-gray-300 hover:bg-[#ffead9] hover:text-[#ff6600] hover:font-bold text-gray-800 text-sm font-medium transition cursor-pointer flex items-center gap-2"
            >
              <span>📄</span> <span>Nova OS</span>
            </button>

            <button
              onClick={() => {
                if (!currentOS) {
                  showNotification('Selecione uma Ordem de Serviço primeiro.');
                  return;
                }
                setActiveModal('doCliente');
              }}
              className="w-full py-2.5 px-3 text-left bg-transparent border-0 border-b border-gray-300 hover:bg-[#ffead9] hover:text-[#ff6600] hover:font-bold text-gray-800 text-sm font-medium transition cursor-pointer flex items-center gap-2"
            >
              <span>👤</span> <span>Do cliente</span>
            </button>

            <button
              onClick={() => {
                if (!currentOS) {
                  showNotification('Selecione uma Ordem de Serviço primeiro.');
                  return;
                }
                setActiveModal('editar');
              }}
              className="w-full py-2.5 px-3 text-left bg-transparent border-0 border-b border-gray-300 hover:bg-[#ffead9] hover:text-[#ff6600] hover:font-bold text-gray-800 text-sm font-medium transition cursor-pointer flex items-center gap-2"
            >
              <span>✏️</span> <span>Editar</span>
            </button>

            <button
              onClick={handleDeletar}
              className="w-full py-2.5 px-3 text-left bg-transparent border-0 border-b border-gray-300 hover:bg-red-50 hover:text-red-600 hover:font-bold text-gray-800 text-sm font-medium transition cursor-pointer flex items-center gap-2"
            >
              <span>🗑️</span> <span>Deletar</span>
            </button>

            <button
              onClick={() => setActiveModal('buscar')}
              className="w-full py-2.5 px-3 text-left bg-transparent border-0 border-b border-gray-300 hover:bg-[#ffead9] hover:text-[#ff6600] hover:font-bold text-gray-800 text-sm font-medium transition cursor-pointer flex items-center gap-2"
            >
              <span>🔍</span> <span>Buscar</span>
            </button>

            <button
              onClick={() => {
                if (!currentOS) {
                  showNotification('Selecione uma Ordem de Serviço primeiro.');
                  return;
                }
                setActiveModal('imprimir');
              }}
              className="w-full py-2.5 px-3 text-left bg-transparent border-0 border-b border-gray-300 hover:bg-[#ffead9] hover:text-[#ff6600] hover:font-bold text-gray-800 text-sm font-medium transition cursor-pointer flex items-center gap-2"
            >
              <span>🖨️</span> <span>Imprimir</span>
            </button>

            <button
              onClick={() => {
                if (!currentOS) {
                  showNotification('Selecione uma Ordem de Serviço primeiro.');
                  return;
                }
                setActiveModal('whatsapp');
              }}
              className="w-full py-2.5 px-3 text-left bg-transparent border-0 border-b border-gray-300 hover:bg-green-50 hover:text-green-700 hover:font-bold text-gray-800 text-sm font-medium transition cursor-pointer flex items-center gap-2"
            >
              <span>💬</span> <span>WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveModal('estatisticas')}
              className="w-full py-2.5 px-3 text-left bg-transparent border-0 border-b border-gray-300 hover:bg-[#ffead9] hover:text-[#ff6600] hover:font-bold text-gray-800 text-sm font-medium transition cursor-pointer flex items-center gap-2"
            >
              <span>📊</span> <span>Estatística</span>
            </button>

            <button
              onClick={() => setActiveModal('backup')}
              className="w-full py-2.5 px-3 text-left bg-transparent border-0 border-b border-gray-300 hover:bg-[#ffead9] hover:text-[#ff6600] hover:font-bold text-gray-800 text-sm font-medium transition cursor-pointer flex items-center gap-2"
            >
              <span>💾</span> <span>Backup</span>
            </button>

            <button
              onClick={() => setActiveModal('googleDrive')}
              className="w-full py-2.5 px-3 text-left bg-transparent border-0 border-b border-gray-300 hover:bg-[#ffead9] hover:text-[#ff6600] hover:font-bold text-gray-800 text-sm font-medium transition cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>☁️</span> <span>Google Drive</span>
              </div>
              {isDriveConnected ? (
                <span className="w-2 h-2 rounded-full bg-green-500" title="Google Drive Conectado" />
              ) : (
                <span className="text-[10px] text-gray-400 font-mono">Nuvem</span>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                showNotification(`Sistema Chip7 Informática ativo. ${ordensAtivas.length} registros no banco.`);
              }}
              className="w-full py-2 px-3 text-left bg-transparent hover:bg-gray-200 text-gray-600 text-xs font-medium transition cursor-pointer flex items-center gap-2 rounded"
            >
              <span>🚪</span> <span>Sair / Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* RODAPÉ EXATO */}
      <footer className="bg-[#d3d3d3] px-4 py-2 flex flex-wrap justify-between items-center text-xs border-t border-gray-400 no-print">
        <span id="total-os" className="font-bold text-gray-800">
          {ordensAtivas.length} {ordensAtivas.length === 1 ? 'Ordem de Serviço Registrada' : 'Ordens de Serviço Registradas'}
        </span>
        <span className="text-gray-700 font-medium">
          ©Todos os direitos Reservados a David - Chip7 informática
        </span>
      </footer>

      {/* MODAIS DO SISTEMA */}
      {activeModal === 'imprimir' && currentOS && (
        <PrintModal os={currentOS} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'whatsapp' && currentOS && (
        <WhatsAppModal os={currentOS} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'nova' && (
        <NovaEditarOSModal
          modo="nova"
          proximoNumero={proximoNumero}
          tecnicos={tecnicos}
          onSalvar={handleSalvarOS}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'editar' && currentOS && (
        <NovaEditarOSModal
          modo="editar"
          osInicial={currentOS}
          proximoNumero={currentOS.numeroOS}
          tecnicos={tecnicos}
          onSalvar={handleSalvarOS}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'buscar' && (
        <BuscarOSModal
          ordens={ordens}
          tecnicos={tecnicos}
          onSelecionarOS={(num) => setCurrentNumeroOS(num)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'doCliente' && currentOS && (
        <ClienteHistoricoModal
          osAtual={currentOS}
          todasOrdens={ordens}
          onSelecionarOS={(num) => setCurrentNumeroOS(num)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'estatisticas' && (
        <EstatisticasModal
          ordens={ordens}
          tecnicos={tecnicos}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'backup' && (
        <BackupModal
          ordens={ordens}
          tecnicos={tecnicos}
          onRestaurarBackup={handleRestaurarBackup}
          onRestaurarPadrao={handleRestaurarPadrao}
          onOpenGoogleDrive={() => setActiveModal('googleDrive')}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'googleDrive' && (
        <GoogleDriveModal
          ordens={ordens}
          tecnicos={tecnicos}
          currentOS={currentOS}
          onRestaurarBackup={handleRestaurarBackup}
          onClose={() => setActiveModal(null)}
          onShowNotification={showNotification}
        />
      )}
    </div>
  );
}
