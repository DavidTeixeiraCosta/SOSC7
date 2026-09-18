import React, { useState, useEffect, useCallback } from 'react';
import { OrdemServico, Tecnico } from '../types';
import {
  googleSignIn,
  googleSignOut,
  getAccessToken,
  initAuth
} from '../services/googleAuth';
import {
  listDriveBackupFiles,
  uploadFileToDrive,
  downloadFileContent,
  deleteDriveFile,
  DriveFileItem
} from '../services/googleDrive';
import { formatOSNumber, formatDateBR, formatCurrency } from '../utils/formatters';
import {
  Cloud,
  CloudUpload,
  RefreshCw,
  X,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Trash2,
  ExternalLink,
  DownloadCloud,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface GoogleDriveModalProps {
  ordens: OrdemServico[];
  tecnicos: Tecnico[];
  currentOS: OrdemServico | null;
  onRestaurarBackup: (novasOrdens: OrdemServico[]) => void;
  onClose: () => void;
  onShowNotification: (msg: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  ordens,
  tecnicos,
  currentOS,
  onRestaurarBackup,
  onClose,
  onShowNotification
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [actionFileId, setActionFileId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const loadFiles = useCallback(async () => {
    try {
      setIsLoadingFiles(true);
      const items = await listDriveBackupFiles();
      setFiles(items);
    } catch (err: any) {
      console.error('Erro ao listar arquivos do Drive:', err);
      showMsg('error', err.message || 'Erro ao carregar arquivos do Google Drive.');
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      async (authUser, token) => {
        setUser(authUser);
        if (token) {
          setHasToken(true);
          loadFiles();
        } else {
          // Check if token in memory
          const memToken = await getAccessToken();
          if (memToken) {
            setHasToken(true);
            loadFiles();
          } else {
            setHasToken(false);
          }
        }
        setIsLoadingAuth(false);
      },
      () => {
        setUser(null);
        setHasToken(false);
        setFiles([]);
        setIsLoadingAuth(false);
      }
    );

    return () => unsubscribe();
  }, [loadFiles]);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setHasToken(true);
        showMsg('success', `Conectado com sucesso como ${res.user.email}!`);
        onShowNotification('Google Drive conectado!');
        await loadFiles();
      }
    } catch (err: any) {
      console.error('Erro no login Google:', err);
      showMsg('error', err.message || 'Falha ao conectar com o Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setHasToken(false);
      setFiles([]);
      showMsg('success', 'Desconectado do Google Drive.');
      onShowNotification('Google Drive desconectado.');
    } catch (err: any) {
      showMsg('error', 'Erro ao desconectar.');
    }
  };

  // Upload full database backup
  const handleBackupCompleto = async () => {
    try {
      setIsUploading(true);
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `backup_chip7_os_${dateStr}.json`;

      const dataBackup = {
        sistema: 'SISTEMA_CHIP7',
        versao: '2.4',
        dataExportacao: now.toISOString(),
        totalRegistros: ordens.length,
        tecnicos,
        ordens
      };

      await uploadFileToDrive(
        fileName,
        JSON.stringify(dataBackup, null, 2),
        'application/json',
        `Backup completo do Sistema Chip7 com ${ordens.length} Ordens de Serviço`
      );

      showMsg('success', `Backup salvo no Google Drive com sucesso (${fileName})!`);
      onShowNotification('Backup salvo no Google Drive!');
      await loadFiles();
    } catch (err: any) {
      console.error('Erro ao enviar backup:', err);
      showMsg('error', err.message || 'Erro ao enviar backup para o Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  // Upload current single OS document
  const handleSalvarOSAtual = async () => {
    if (!currentOS) {
      showMsg('error', 'Nenhuma Ordem de Serviço selecionada no momento.');
      return;
    }

    try {
      setIsUploading(true);
      const osNum = formatOSNumber(currentOS.numeroOS);
      const clientSanitized = currentOS.nomeCliente.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
      const fileName = `OS_${osNum}_${clientSanitized}.txt`;

      const content = `=====================================================
CHIP7 INFORMÁTICA - ORDEM DE SERVIÇO Nº ${osNum}
=====================================================
Data de Entrada: ${formatDateBR(currentOS.dataEntrada)}
Status Atual:    ${currentOS.status}
Atendente:       ${currentOS.atendente}
Técnico:         ${currentOS.tecnico || currentOS.atendente}

DADOS DO CLIENTE:
-----------------------------------------------------
Nome:     ${currentOS.nomeCliente}
Telefone: ${currentOS.telefone} ${currentOS.telefone2 ? ` / ${currentOS.telefone2}` : ''}
E-mail:   ${currentOS.email || 'Não informado'}
CPF/CNPJ: ${currentOS.cpfCnpj || 'Não informado'}
Endereço: ${currentOS.endereco || 'Não informado'} - CEP: ${currentOS.cep || 'N/I'}

EQUIPAMENTO:
-----------------------------------------------------
Aparelho:    ${currentOS.aparelho}
Marca:       ${currentOS.marca}
Modelo:      ${currentOS.modelo}
Nº de Série: ${currentOS.numeroSerie || 'N/I'}
Senha:       ${currentOS.senhaAparelho || 'Nenhuma'}
Acessórios:  ${currentOS.acessorios || 'Nenhum'}

DIAGNÓSTICO & LAUDO:
-----------------------------------------------------
Defeitos Relatados:
${currentOS.defeitos}

Observações:
${currentOS.observacoes || 'Nenhuma'}

Laudo Técnico:
${currentOS.laudoTecnico || 'Em análise técnica'}

ORÇAMENTO / ITENS:
-----------------------------------------------------
${(currentOS.orcamento || [])
  .map((item, idx) => `${idx + 1}. ${item.item.padEnd(35)} - ${formatCurrency(item.valor)}`)
  .join('\n')}

VALOR TOTAL: ${formatCurrency(currentOS.valorTotal || 0)}

STATUS / DATAS:
-----------------------------------------------------
Entrada:    ${formatDateBR(currentOS.dataEntrada)}
Pendência:  ${formatDateBR(currentOS.dataPendencia)}
Aprovado:   ${formatDateBR(currentOS.dataAprovado)}
Reprovado:  ${formatDateBR(currentOS.dataReprovado)}
Liberado:   ${formatDateBR(currentOS.dataLiberado)}
Retirado:   ${formatDateBR(currentOS.dataRetirado)}

=====================================================
Documento gerado automaticamente pelo Sistema Chip7
=====================================================`;

      await uploadFileToDrive(
        fileName,
        content,
        'text/plain',
        `Ordem de Serviço Nº ${osNum} - ${currentOS.nomeCliente}`
      );

      showMsg('success', `Documento da OS Nº ${osNum} salvo no Google Drive!`);
      onShowNotification(`OS Nº ${osNum} salva no Google Drive!`);
      await loadFiles();
    } catch (err: any) {
      console.error('Erro ao salvar OS:', err);
      showMsg('error', err.message || 'Erro ao salvar documento da OS no Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  // Restore backup from Drive file
  const handleRestaurarDoDrive = async (file: DriveFileItem) => {
    const confirmRestore = window.confirm(
      `ATENÇÃO: Deseja restaurar a base de dados a partir do arquivo "${file.name}" do Google Drive?\n\nOs dados atuais na aplicação serão substituídos pelo conteúdo deste backup.`
    );
    if (!confirmRestore) return;

    try {
      setActionFileId(file.id);
      const content = await downloadFileContent(file.id);
      const parsed = JSON.parse(content);

      let ordensImportadas: OrdemServico[] = [];
      if (Array.isArray(parsed)) {
        ordensImportadas = parsed;
      } else if (parsed.ordens && Array.isArray(parsed.ordens)) {
        ordensImportadas = parsed.ordens;
      } else {
        throw new Error('O formato do arquivo selecionado não contém ordens de serviço válidas.');
      }

      if (ordensImportadas.length === 0) {
        throw new Error('Nenhuma ordem de serviço encontrada neste backup.');
      }

      onRestaurarBackup(ordensImportadas);
      showMsg('success', `Sucesso! ${ordensImportadas.length} Ordens de Serviço restauradas do Google Drive!`);
      onShowNotification(`${ordensImportadas.length} OS restauradas do Drive!`);
    } catch (err: any) {
      console.error('Erro ao restaurar:', err);
      showMsg('error', `Falha ao restaurar: ${err.message || 'Arquivo inválido'}`);
    } finally {
      setActionFileId(null);
    }
  };

  // Delete file from Drive - with explicit confirmation
  const handleExcluirDoDrive = async (file: DriveFileItem) => {
    const confirmDelete = window.confirm(
      `CONFIRMAÇÃO NECESSÁRIA:\n\nTem certeza que deseja excluir o arquivo "${file.name}" do seu Google Drive?\n\nEsta ação removerá o arquivo permanentemente da nuvem.`
    );
    if (!confirmDelete) return;

    try {
      setActionFileId(file.id);
      await deleteDriveFile(file.id);
      showMsg('success', `Arquivo "${file.name}" excluído do Google Drive.`);
      setFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (err: any) {
      console.error('Erro ao excluir:', err);
      showMsg('error', err.message || 'Erro ao excluir arquivo do Google Drive.');
    } finally {
      setActionFileId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border-2 border-orange-500 max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#ff6600] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cloud className="w-6 h-6 text-white" />
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Google Drive - Backups & Sincronização
              </h3>
              <p className="text-[11px] text-white/90">
                Armazenamento em nuvem oficial para a Chip7 Informática
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-700 p-1.5 rounded transition cursor-pointer"
            title="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {feedback && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b ${
              feedback.type === 'success'
                ? 'bg-green-100 text-green-800 border-green-300'
                : 'bg-red-100 text-red-800 border-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-green-700" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-700" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Section 1: Authentication Card */}
          <div className="border border-gray-300 rounded-lg p-3 sm:p-4 bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {isLoadingAuth ? (
              <div className="flex items-center gap-2 text-gray-600 py-1">
                <RefreshCw className="w-4 h-4 animate-spin text-orange-600" />
                <span>Verificando conexão com Google Drive...</span>
              </div>
            ) : user && hasToken ? (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'G'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 text-sm">
                      {user.displayName || 'Usuário Google'}
                    </span>
                    <span className="bg-green-100 text-green-800 border border-green-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      Conectado
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px]">{user.email}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                    <FolderOpen className="w-3 h-3 text-orange-600" />
                    Pasta na nuvem: <span className="font-mono font-semibold text-gray-700">Chip7_OS_Backups</span>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-orange-600" />
                  Conectar Conta Google Drive
                </h4>
                <p className="text-gray-600 text-[11px] mt-0.5 max-w-md">
                  Faça login com sua conta Google com permissão para salvar e recuperar cópias de segurança das Ordens de Serviço diretamente no seu Google Drive.
                </p>
              </div>
            )}

            {/* Auth Action Button */}
            <div>
              {user && hasToken ? (
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded text-xs transition cursor-pointer"
                >
                  Desconectar
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 border border-gray-300 rounded shadow-sm hover:shadow transition text-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSigningIn ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-orange-600" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                  )}
                  <span>Conectar com Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Upload Actions (available when signed in) */}
          {user && hasToken && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Backup Completo Card */}
              <div className="border border-orange-200 rounded-lg p-3 bg-orange-50/50 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 text-orange-900">
                    <CloudUpload className="w-4 h-4 text-orange-600" />
                    Backup Completo ({ordens.length} OS)
                  </h4>
                  <p className="text-gray-600 text-[11px] mt-1 leading-relaxed">
                    Gera um arquivo JSON completo com todas as {ordens.length} Ordens de Serviço e lista de técnicos e salva diretamente na sua pasta do Google Drive.
                  </p>
                </div>
                <button
                  onClick={handleBackupCompleto}
                  disabled={isUploading}
                  className="mt-3 bg-[#ff6600] hover:bg-orange-700 text-white font-bold px-3.5 py-2 rounded text-xs shadow transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isUploading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CloudUpload className="w-4 h-4" />
                  )}
                  <span>Salvar Backup no Google Drive</span>
                </button>
              </div>

              {/* Salvar OS Atual Card */}
              <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/50 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 text-blue-900">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Salvar OS Atual no Drive
                  </h4>
                  <p className="text-gray-600 text-[11px] mt-1 leading-relaxed">
                    {currentOS ? (
                      <>
                        Envia a <strong className="text-gray-800">OS Nº {formatOSNumber(currentOS.numeroOS)}</strong> ({currentOS.nomeCliente}) como documento individual de texto para o Drive.
                      </>
                    ) : (
                      'Selecione uma Ordem de Serviço na tela inicial para enviar um documento individual.'
                    )}
                  </p>
                </div>
                <button
                  onClick={handleSalvarOSAtual}
                  disabled={isUploading || !currentOS}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded text-xs shadow transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isUploading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>Salvar OS Nº {currentOS ? formatOSNumber(currentOS.numeroOS) : '00000'} no Drive</span>
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Files Stored in Google Drive */}
          {user && hasToken && (
            <div className="border border-gray-200 rounded-lg p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-orange-600" />
                    Arquivos Salvos no Google Drive
                  </h4>
                  <span className="text-[11px] text-gray-500">({files.length} encontrados)</span>
                </div>
                <button
                  onClick={loadFiles}
                  disabled={isLoadingFiles}
                  className="text-gray-600 hover:text-orange-600 font-semibold flex items-center gap-1 text-[11px] p-1 rounded hover:bg-orange-50 transition cursor-pointer"
                  title="Atualizar lista de arquivos"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </button>
              </div>

              {isLoadingFiles ? (
                <div className="py-8 flex flex-col items-center justify-center text-gray-500 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                  <span className="text-xs">Consultando Google Drive...</span>
                </div>
              ) : files.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 rounded border border-dashed border-gray-300">
                  <Cloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700">Nenhum arquivo encontrado na pasta Chip7_OS_Backups</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Clique em "Salvar Backup no Google Drive" acima para criar sua primeira cópia de segurança na nuvem.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto border border-gray-200 rounded">
                  {files.map(file => {
                    const isBackupJson = file.name.endsWith('.json') || file.name.includes('backup');
                    const isCurrentAction = actionFileId === file.id;

                    return (
                      <div
                        key={file.id}
                        className="p-2.5 flex items-center justify-between hover:bg-orange-50/40 transition gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isBackupJson ? (
                            <div className="w-8 h-8 rounded bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                              JSON
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                              TXT
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-xs truncate max-w-[280px] sm:max-w-md">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-gray-500 flex items-center gap-2">
                              <span>
                                {file.modifiedTime
                                  ? new Date(file.modifiedTime).toLocaleString('pt-BR')
                                  : 'Data recente'}
                              </span>
                              {file.size && (
                                <span>• {(parseInt(file.size, 10) / 1024).toFixed(1)} KB</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Abrir no Google Drive"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          {isBackupJson && (
                            <button
                              onClick={() => handleRestaurarDoDrive(file)}
                              disabled={isCurrentAction}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-sm transition cursor-pointer disabled:opacity-50"
                              title="Restaurar base a partir deste backup"
                            >
                              {isCurrentAction ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <DownloadCloud className="w-3 h-3" />
                              )}
                              <span>Restaurar</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleExcluirDoDrive(file)}
                            disabled={isCurrentAction}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer disabled:opacity-50"
                            title="Excluir arquivo do Google Drive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-100 border-t border-gray-200 flex justify-between items-center text-xs">
          <span className="text-gray-500 text-[11px]">
            {user && hasToken
              ? 'Conectado via Google OAuth API com segurança'
              : 'Faça login para habilitar a sincronização na nuvem'}
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
