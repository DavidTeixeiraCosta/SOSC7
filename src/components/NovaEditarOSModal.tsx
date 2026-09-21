import React, { useState, useEffect } from 'react';
import { ItemOrcamento, OrdemServico, Tecnico } from '../types';
import { formatCurrency, formatOSNumber } from '../utils/formatters';
import { X, Save, Plus, Trash2, ShieldAlert, Sparkles } from 'lucide-react';

interface NovaEditarOSModalProps {
  modo: 'nova' | 'editar';
  osInicial?: OrdemServico | null;
  proximoNumero: number;
  tecnicos: Tecnico[];
  onSalvar: (os: OrdemServico) => void;
  onClose: () => void;
}

export const NovaEditarOSModal: React.FC<NovaEditarOSModalProps> = ({
  modo,
  osInicial,
  proximoNumero,
  tecnicos,
  onSalvar,
  onClose
}) => {
  const hoje = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState<OrdemServico>(() => {
    if (modo === 'editar' && osInicial) {
      return { ...osInicial };
    }
    if (modo === 'nova' && osInicial) {
      return {
        numeroOS: proximoNumero,
        nomeCliente: osInicial.nomeCliente || '',
        endereco: osInicial.endereco || '',
        cep: osInicial.cep || '',
        telefone: osInicial.telefone || '',
        telefone2: osInicial.telefone2 || '',
        email: osInicial.email || '',
        cpfCnpj: osInicial.cpfCnpj || '',
        aparelho: osInicial.aparelho || '',
        marca: osInicial.marca || '',
        modelo: osInicial.modelo || '',
        numeroSerie: osInicial.numeroSerie || '',
        senhaAparelho: osInicial.senhaAparelho || '',
        acessorios: osInicial.acessorios || '',
        defeitos: '',
        observacoes: '',
        laudoTecnico: '',
        orcamento: [
          { item: '', valor: 0 },
          { item: '', valor: 0 },
          { item: '', valor: 0 }
        ],
        valorTotal: 0,
        atendente: osInicial.atendente || tecnicos[0]?.nome || 'Tália',
        tecnico: osInicial.tecnico || tecnicos[1]?.nome || 'Henrique',
        dataEntrada: hoje,
        dataPendencia: '',
        dataAprovado: '',
        dataReprovado: '',
        dataLiberado: '',
        dataRetirado: '',
        status: 'Entrada',
        apagado: false
      };
    }
    return {
      numeroOS: proximoNumero,
      nomeCliente: '',
      endereco: '',
      cep: '',
      telefone: '',
      telefone2: '',
      email: '',
      cpfCnpj: '',
      aparelho: '',
      marca: '',
      modelo: '',
      numeroSerie: '',
      senhaAparelho: '',
      acessorios: '',
      defeitos: '',
      observacoes: '',
      laudoTecnico: '',
      orcamento: [
        { item: '', valor: 0 },
        { item: '', valor: 0 },
        { item: '', valor: 0 }
      ],
      valorTotal: 0,
      atendente: tecnicos[0]?.nome || 'Tália',
      tecnico: tecnicos[1]?.nome || 'Henrique',
      dataEntrada: hoje,
      dataPendencia: '',
      dataAprovado: '',
      dataReprovado: '',
      dataLiberado: '',
      dataRetirado: '',
      status: 'Entrada',
      apagado: false
    };
  });

  // Calculate total automatically
  const calcularTotal = (itens: ItemOrcamento[]) => {
    const total = itens.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    return Math.round(total * 100) / 100;
  };

  const handleOrcamentoChange = (index: number, field: 'item' | 'valor', value: string) => {
    const novosItens = [...(form.orcamento || [])];
    if (!novosItens[index]) {
      novosItens[index] = { item: '', valor: 0 };
    }

    if (field === 'item') {
      novosItens[index].item = value;
    } else {
      const numVal = parseFloat(value.replace(',', '.')) || 0;
      novosItens[index].valor = numVal;
    }

    const novoTotal = calcularTotal(novosItens);
    setForm(prev => ({
      ...prev,
      orcamento: novosItens,
      valorTotal: novoTotal
    }));
  };

  const adicionarLinhaOrcamento = () => {
    setForm(prev => ({
      ...prev,
      orcamento: [...(prev.orcamento || []), { item: '', valor: 0 }]
    }));
  };

  const removerLinhaOrcamento = (index: number) => {
    const novosItens = (form.orcamento || []).filter((_, idx) => idx !== index);
    const novoTotal = calcularTotal(novosItens);
    setForm(prev => ({
      ...prev,
      orcamento: novosItens,
      valorTotal: novoTotal
    }));
  };

  const handleChange = (field: keyof OrdemServico, val: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: val };
      
      // Auto-update date when status changes
      if (field === 'status') {
        if (val === 'Aprovado' && !updated.dataAprovado) updated.dataAprovado = hoje;
        if (val === 'Reprovado' && !updated.dataReprovado) updated.dataReprovado = hoje;
        if (val === 'Liberado' && !updated.dataLiberado) updated.dataLiberado = hoje;
        if (val === 'Retirado' && !updated.dataRetirado) updated.dataRetirado = hoje;
      }
      return updated;
    });
  };

  const atendenteSelecionado = tecnicos.find(t => t.nome === form.atendente) || tecnicos[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nomeCliente.trim()) {
      alert('Por favor, informe o Nome do Cliente!');
      return;
    }
    if (!form.telefone.trim()) {
      alert('Por favor, informe o Telefone do Cliente!');
      return;
    }
    if (!form.aparelho.trim()) {
      alert('Por favor, informe o Tipo de Aparelho!');
      return;
    }
    onSalvar(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden border-2 border-orange-500 my-4">
        {/* Header */}
        <div className="bg-[#ff6600] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg tracking-wide">
              {modo === 'nova' ? 'NOVA ORDEM DE SERVIÇO' : `EDITANDO ORDEM DE SERVIÇO Nº ${formatOSNumber(form.numeroOS)}`}
            </h3>
            <span className="bg-black/20 text-white px-2 py-0.5 rounded text-xs font-mono font-bold">
              OS: {formatOSNumber(form.numeroOS)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-700 p-1 rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {modo === 'nova' && osInicial && (
          <div className="bg-green-50 border-b border-green-300 px-5 py-2.5 flex items-center gap-2 text-xs text-green-900 font-semibold">
            <Sparkles className="w-4 h-4 text-green-700 flex-shrink-0" />
            <span>
              <strong>Dados do Cliente e Equipamento copiados com sucesso</strong> da OS #{formatOSNumber(osInicial.numeroOS)}! Basta preencher o defeito reclamado e clicar em Gravar OS.
            </span>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto max-h-[80vh] space-y-4 text-xs">
          {/* Seção 1: Dados do Cliente */}
          <div className="border border-orange-300 rounded p-3 bg-orange-50/40">
            <h4 className="font-bold text-orange-900 border-b border-orange-200 pb-1 mb-2 text-xs uppercase flex items-center gap-1.5">
              <span>👤 1. Identificação do Cliente</span>
            </h4>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-12 md:col-span-7">
                <label className="block font-semibold mb-1">Nome / Razão Social *</label>
                <input
                  type="text"
                  required
                  value={form.nomeCliente}
                  onChange={(e) => handleChange('nomeCliente', e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full border border-gray-400 rounded px-2.5 py-1.5 bg-white font-medium focus:border-orange-500 outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-5">
                <label className="block font-semibold mb-1">CPF / CNPJ</label>
                <input
                  type="text"
                  value={form.cpfCnpj || ''}
                  onChange={(e) => handleChange('cpfCnpj', e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full border border-gray-400 rounded px-2.5 py-1.5 bg-white focus:border-orange-500 outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-8">
                <label className="block font-semibold mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={form.endereco || ''}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  placeholder="Rua, Número, Bairro, Cidade"
                  className="w-full border border-gray-400 rounded px-2.5 py-1.5 bg-white focus:border-orange-500 outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="block font-semibold mb-1">CEP</label>
                <input
                  type="text"
                  value={form.cep || ''}
                  onChange={(e) => handleChange('cep', e.target.value)}
                  placeholder="13400-000"
                  className="w-full border border-gray-400 rounded px-2.5 py-1.5 bg-white focus:border-orange-500 outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="block font-semibold mb-1">Telefone Principal (WhatsApp) *</label>
                <input
                  type="text"
                  required
                  value={form.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  placeholder="(19) 90000-0000"
                  className="w-full border border-gray-400 rounded px-2.5 py-1.5 bg-white font-medium focus:border-orange-500 outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="block font-semibold mb-1">Telefone 2 / Recado</label>
                <input
                  type="text"
                  value={form.telefone2 || ''}
                  onChange={(e) => handleChange('telefone2', e.target.value)}
                  placeholder="(19) 3000-0000"
                  className="w-full border border-gray-400 rounded px-2.5 py-1.5 bg-white focus:border-orange-500 outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="block font-semibold mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full border border-gray-400 rounded px-2.5 py-1.5 bg-white focus:border-orange-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Dados do Equipamento */}
          <div className="border border-orange-300 rounded p-3 bg-orange-50/40">
            <h4 className="font-bold text-orange-900 border-b border-orange-200 pb-1 mb-2 text-xs uppercase flex items-center gap-1.5">
              <span>💻 2. Dados do Equipamento</span>
            </h4>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6 md:col-span-3">
                <label className="block font-semibold mb-1">Aparelho *</label>
                <input
                  type="text"
                  required
                  value={form.aparelho}
                  onChange={(e) => handleChange('aparelho', e.target.value)}
                  placeholder="Notebook, PC, iPhone..."
                  className="w-full border border-gray-400 rounded px-2.5 py-1.5 bg-white font-medium focus:border-orange-500 outline-none"
                />
              </div>

              <div className="col-span-6 md:col-span-3">
                <label className="block font-semibold mb-1">Marca</label>
                <input
                  type="text"
                  value={form.marca}
                  onChange={(e) => handleChange('marca', e.target.value)}
                  placeholder="Dell, Samsung, Apple..."
                  className="w-full border border-gray-400 rounded px-2.5 py-1.5 bg-white focus:border-orange-500 outline-none"
                />
              </div>

              <div className="col-span-6 md:col-span-3">
                <label className="block font-semibold mb-1">Modelo</label>
                <input
                  type="text"
                  value={form.modelo}
                  onChange={(e) => handleChange('modelo', e.target.value)}
                  placeholder="Inspiron 15, Galaxy S21..."
                  className="w-full border border-gray-400 rounded px-2.5 py-1.5 bg-white focus:border-orange-500 outline-none"
                />
              </div>

              <div className="col-span-6 md:col-span-3">
                <label className="block font-semibold mb-1">Nº de Série</label>
                <input
                  type="text"
                  value={form.numeroSerie || ''}
                  onChange={(e) => handleChange('numeroSerie', e.target.value)}
                  placeholder="Serial ou IMEI"
                  className="w-full border border-gray-400 rounded px-2.5 py-1.5 bg-white focus:border-orange-500 outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="block font-semibold mb-1 text-red-700">Senha / Padrão do Aparelho</label>
                <input
                  type="text"
                  value={form.senhaAparelho || ''}
                  onChange={(e) => handleChange('senhaAparelho', e.target.value)}
                  placeholder="PIN, senha ou desenho"
                  className="w-full border border-red-300 rounded px-2.5 py-1.5 bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="col-span-12 md:col-span-8">
                <label className="block font-semibold mb-1">Acessórios Deixados com o Equipamento</label>
                <input
                  type="text"
                  value={form.acessorios || ''}
                  onChange={(e) => handleChange('acessorios', e.target.value)}
                  placeholder="Carregador, capa, cabo de força, mouse..."
                  className="w-full border border-gray-400 rounded px-2.5 py-1.5 bg-white focus:border-orange-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Diagnóstico e Orçamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Lado Esquerdo: Defeitos & Orçamento */}
            <div className="space-y-3">
              <div className="border border-orange-300 rounded p-3 bg-orange-50/40">
                <h4 className="font-bold text-orange-900 border-b border-orange-200 pb-1 mb-2 text-xs uppercase">
                  🔍 3. Defeito Reclamado pelo Cliente
                </h4>
                <textarea
                  rows={3}
                  required
                  value={form.defeitos}
                  onChange={(e) => handleChange('defeitos', e.target.value)}
                  placeholder="Descreva exatamente o que o cliente relatou..."
                  className="w-full border border-gray-400 rounded p-2 bg-white focus:border-orange-500 outline-none leading-normal"
                />
              </div>

              {/* Orçamento Grid */}
              <div className="border border-orange-300 rounded p-3 bg-orange-50/40">
                <div className="flex justify-between items-center border-b border-orange-200 pb-1 mb-2">
                  <h4 className="font-bold text-orange-900 text-xs uppercase">
                    💰 4. Orçamento (Serviços e Peças)
                  </h4>
                  <button
                    type="button"
                    onClick={adicionarLinhaOrcamento}
                    className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white px-2 py-0.5 rounded text-[11px] font-bold"
                  >
                    <Plus className="w-3 h-3" /> Adicionar Item
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(form.orcamento || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold w-4 text-center">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder="Descrição do serviço ou peça..."
                        value={item.item}
                        onChange={(e) => handleOrcamentoChange(idx, 'item', e.target.value)}
                        className="flex-1 border border-gray-400 rounded px-2 py-1 bg-white focus:border-orange-500 outline-none"
                      />
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-gray-500 font-semibold">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={item.valor || ''}
                          onChange={(e) => handleOrcamentoChange(idx, 'valor', e.target.value)}
                          className="w-full border border-gray-400 rounded px-2 py-1 bg-white text-right font-medium focus:border-orange-500 outline-none"
                        />
                      </div>
                      {(form.orcamento || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerLinhaOrcamento(idx)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-2 border-t border-orange-300 flex justify-between items-center font-bold text-sm bg-orange-100/70 px-3 py-1.5 rounded">
                  <span className="uppercase text-orange-950">Valor Total:</span>
                  <span className="text-base text-orange-900 font-mono">
                    {formatCurrency(form.valorTotal || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Lado Direito: Atendente/Cor, Observações e Laudo */}
            <div className="space-y-3">
              <div className="border border-orange-300 rounded p-3 bg-orange-50/40">
                <h4 className="font-bold text-orange-900 border-b border-orange-200 pb-1 mb-2 text-xs uppercase">
                  👨‍🔧 5. Responsáveis e Atendimento
                </h4>

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <label className="block font-semibold mb-1">Atendente:</label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={form.atendente}
                        onChange={(e) => handleChange('atendente', e.target.value)}
                        className="w-full border border-gray-400 rounded px-2 py-1.5 bg-white font-medium focus:border-orange-500 outline-none"
                      >
                        {tecnicos.map(t => (
                          <option key={t.id} value={t.nome}>{t.nome} ({t.cargo})</option>
                        ))}
                      </select>
                      {/* Cor do atendente/técnico como na foto */}
                      <div
                        className="w-6 h-6 rounded border-2 border-black flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: atendenteSelecionado?.cor || '#ff6600' }}
                        title={`Cor de ${atendenteSelecionado?.nome}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Técnico de Bancada:</label>
                    <select
                      value={form.tecnico || ''}
                      onChange={(e) => handleChange('tecnico', e.target.value)}
                      className="w-full border border-gray-400 rounded px-2 py-1.5 bg-white font-medium focus:border-orange-500 outline-none"
                    >
                      <option value="">Não definido</option>
                      {tecnicos.map(t => (
                        <option key={t.id} value={t.nome}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block font-semibold mb-1">Status Geral da OS:</label>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full border-2 border-orange-400 rounded px-2.5 py-1.5 bg-white font-bold text-sm focus:border-orange-600 outline-none"
                  >
                    <option value="Entrada">Entrada (Aguardando Análise)</option>
                    <option value="Em Análise">Em Análise Técnica</option>
                    <option value="Aprovado">Aprovado (Em Execução)</option>
                    <option value="Reprovado">Reprovado pelo Cliente</option>
                    <option value="Aguardando Peça">Aguardando Peça / Encomenda</option>
                    <option value="Liberado">Liberado (Pronto para Retirada)</option>
                    <option value="Retirado">Retirado / Finalizado</option>
                  </select>
                </div>
              </div>

              {/* Laudo e Observações */}
              <div className="border border-orange-300 rounded p-3 bg-orange-50/40">
                <h4 className="font-bold text-orange-900 border-b border-orange-200 pb-1 mb-2 text-xs uppercase">
                  📝 6. Observações & Laudo Técnico
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block font-semibold mb-0.5">Observações Internas:</label>
                    <textarea
                      rows={2}
                      value={form.observacoes || ''}
                      onChange={(e) => handleChange('observacoes', e.target.value)}
                      placeholder="Detalhes internos, urgência, particularidades..."
                      className="w-full border border-gray-400 rounded p-1.5 bg-white focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-0.5">Laudo Técnico Oficial:</label>
                    <textarea
                      rows={2}
                      value={form.laudoTecnico || ''}
                      onChange={(e) => handleChange('laudoTecnico', e.target.value)}
                      placeholder="Diagnóstico técnico para a impressão / cliente..."
                      className="w-full border border-gray-400 rounded p-1.5 bg-white focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 4: Datas de Controle */}
          <div className="border border-gray-300 rounded p-3 bg-gray-50">
            <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-1 mb-2 text-xs uppercase">
              📅 7. Linha do Tempo / Datas
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
              <div>
                <label className="block font-medium mb-1">Entrada:</label>
                <input
                  type="date"
                  value={form.dataEntrada}
                  onChange={(e) => handleChange('dataEntrada', e.target.value)}
                  className="w-full border border-gray-300 rounded px-1.5 py-1 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Pendência:</label>
                <input
                  type="date"
                  value={form.dataPendencia || ''}
                  onChange={(e) => handleChange('dataPendencia', e.target.value)}
                  className="w-full border border-gray-300 rounded px-1.5 py-1 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Aprovado:</label>
                <input
                  type="date"
                  value={form.dataAprovado || ''}
                  onChange={(e) => handleChange('dataAprovado', e.target.value)}
                  className="w-full border border-gray-300 rounded px-1.5 py-1 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Reprovado:</label>
                <input
                  type="date"
                  value={form.dataReprovado || ''}
                  onChange={(e) => handleChange('dataReprovado', e.target.value)}
                  className="w-full border border-gray-300 rounded px-1.5 py-1 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Liberado:</label>
                <input
                  type="date"
                  value={form.dataLiberado || ''}
                  onChange={(e) => handleChange('dataLiberado', e.target.value)}
                  className="w-full border border-gray-300 rounded px-1.5 py-1 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Retirado:</label>
                <input
                  type="date"
                  value={form.dataRetirado || ''}
                  onChange={(e) => handleChange('dataRetirado', e.target.value)}
                  className="w-full border border-gray-300 rounded px-1.5 py-1 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-300">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#ff6600] hover:bg-orange-700 text-white font-bold px-6 py-2 rounded text-sm shadow transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {modo === 'nova' ? 'Gravar Nova OS' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
