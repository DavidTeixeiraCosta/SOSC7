import React, { useRef, useState } from 'react';
import { OrdemServico, Tecnico } from '../types';
import { Download, Upload, RefreshCw, X, ShieldCheck, AlertTriangle, Cloud } from 'lucide-react';

interface BackupModalProps {
  ordens: OrdemServico[];
  tecnicos: Tecnico[];
  onRestaurarBackup: (novasOrdens: OrdemServico[]) => void;
  onRestaurarPadrao: () => void;
  onOpenGoogleDrive?: () => void;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  ordens,
  tecnicos,
  onRestaurarBackup,
  onRestaurarPadrao,
  onOpenGoogleDrive,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');
  const [mensagemErro, setMensagemErro] = useState<string>('');

  const handleExportarJSON = () => {
    try {
      const dataBackup = {
        sistema: 'SISTEMA_CHIP7',
        versao: '2.0',
        dataExportacao: new Date().toISOString(),
        totalRegistros: ordens.length,
        tecnicos: tecnicos,
        ordens: ordens
      };

      const jsonStr = JSON.stringify(dataBackup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dataFormatada = new Date().toISOString().split('T')[0];
      link.download = `backup_chip7_os_${dataFormatada}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setMensagemSucesso('Backup exportado com sucesso! Arquivo JSON baixado.');
      setTimeout(() => setMensagemSucesso(''), 4000);
    } catch (err) {
      setMensagemErro('Erro ao gerar arquivo de backup.');
      setTimeout(() => setMensagemErro(''), 4000);
    }
  };

  const handleImportarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const conteudo = evt.target?.result as string;
        const parsed = JSON.parse(conteudo);

        let ordensImportadas: OrdemServico[] = [];
        if (Array.isArray(parsed)) {
          ordensImportadas = parsed;
        } else if (parsed.ordens && Array.isArray(parsed.ordens)) {
          ordensImportadas = parsed.ordens;
        } else {
          throw new Error('Formato do arquivo inválido');
        }

        if (ordensImportadas.length === 0) {
          throw new Error('Nenhuma ordem de serviço encontrada no arquivo.');
        }

        if (window.confirm(`Deseja importar ${ordensImportadas.length} ordens de serviço? Isso substituirá a base atual.`)) {
          onRestaurarBackup(ordensImportadas);
          setMensagemSucesso(`${ordensImportadas.length} Ordens de Serviço importadas com sucesso!`);
          setTimeout(() => setMensagemSucesso(''), 4000);
        }
      } catch (err: any) {
        setMensagemErro(`Falha ao importar: ${err.message || 'Arquivo JSON inválido'}`);
        setTimeout(() => setMensagemErro(''), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full flex flex-col overflow-hidden border-2 border-orange-500">
        {/* Header */}
        <div className="bg-[#ff6600] text-white px-5 py-3 flex items-center justify-between">
          <h3 className="font-bold text-lg">Cópia de Segurança & Backup de Dados</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-700 p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {mensagemSucesso && (
            <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <span>{mensagemSucesso}</span>
            </div>
          )}

          {mensagemErro && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{mensagemErro}</span>
            </div>
          )}

          <p className="text-gray-700 leading-relaxed">
            Faça backups regulares para garantir a segurança dos dados da Chip7 Informática e permitir a restauração em outras máquinas ou após manutenção.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {/* Google Drive Nuvem */}
            {onOpenGoogleDrive && (
              <div className="border-2 border-orange-300 rounded p-4 bg-orange-50/70 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5 text-orange-900">
                    <Cloud className="w-4 h-4 text-orange-600" />
                    Google Drive (Backup & Sincronização em Nuvem)
                  </h4>
                  <p className="text-gray-600 text-[11px] mt-0.5">
                    Conecte sua conta Google para salvar e restaurar backups diretamente da nuvem com segurança.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenGoogleDrive();
                  }}
                  className="bg-[#ff6600] hover:bg-orange-700 text-white font-bold px-4 py-2 rounded text-xs shadow transition cursor-pointer flex-shrink-0 ml-3 flex items-center gap-1.5"
                >
                  <Cloud className="w-4 h-4" />
                  <span>Acessar Drive</span>
                </button>
              </div>
            )}

            {/* Exportar */}
            <div className="border border-gray-300 rounded p-4 bg-gray-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-orange-600" />
                  Exportar Backup Completo (JSON)
                </h4>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  Baixa um arquivo com todas as {ordens.length} Ordens de Serviço cadastradas.
                </p>
              </div>
              <button
                onClick={handleExportarJSON}
                className="bg-[#ff6600] hover:bg-orange-700 text-white font-bold px-4 py-2 rounded text-xs shadow transition cursor-pointer flex-shrink-0 ml-3"
              >
                Baixar Backup
              </button>
            </div>

            {/* Importar */}
            <div className="border border-gray-300 rounded p-4 bg-gray-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Restaurar de Arquivo JSON
                </h4>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  Carregue um arquivo salvo anteriormente para recuperar seus dados.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleImportarArquivo}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded text-xs shadow transition cursor-pointer flex-shrink-0 ml-3"
                >
                  Selecionar Arquivo
                </button>
              </div>
            </div>

            {/* Restaurar Padrão */}
            <div className="border border-gray-300 rounded p-4 bg-gray-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                  Restaurar Exemplos Originais
                </h4>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  Carrega a base inicial da Chip7 com exemplos de OS para testes.
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja recarregar os dados iniciais de demonstração da Chip7?')) {
                    onRestaurarPadrao();
                    setMensagemSucesso('Dados iniciais restaurados com sucesso!');
                    setTimeout(() => setMensagemSucesso(''), 4000);
                  }
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded text-xs transition flex-shrink-0 ml-3 cursor-pointer"
              >
                Restaurar
              </button>
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
