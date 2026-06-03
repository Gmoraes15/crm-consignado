import { useState, useEffect, useMemo } from "react";

const STORAGE_KEY = "crm_consignado_data";

const STATUS_CONFIG = {
  "Novo Lead":            { color: "#1D9E75", bg: "#E1F5EE", label: "Novo Lead" },
  "Interessado":          { color: "#185FA5", bg: "#E6F1FB", label: "Interessado" },
  "Em análise":           { color: "#BA7517", bg: "#FAEEDA", label: "Em análise" },
  "Aguardando documentos":{ color: "#854F0B", bg: "#FAEEDA", label: "Aguard. docs" },
  "Aprovado":             { color: "#3B6D11", bg: "#EAF3DE", label: "Aprovado" },
  "Contrato fechado":     { color: "#0F6E56", bg: "#E1F5EE", label: "Contrato" },
  "Perdido":              { color: "#A32D2D", bg: "#FCEBEB", label: "Perdido" },
};

const TIPO_BENEFICIO = ["Aposentado", "Pensionista", "BPC/LOAS", "Servidor", "Outro"];
const BANCOS = ["Caixa Econômica", "Banco do Brasil", "Bradesco", "Itaú", "Santander", "BMG", "Safra", "Pan", "Outro"];

const DEMO_CLIENTS = [
  { id: 1, nome: "Maria Aparecida Silva", cpf: "123.456.789-00", telefone: "(15) 99801-2345", whatsapp: "(15) 99801-2345", cidade: "Sorocaba", nascimento: "1952-03-14", tipoBeneficio: "Aposentada", numeroBeneficio: "1234567890", bancoPagador: "Caixa Econômica", valorBeneficio: 2100, status: "Interessado", historico: [{ data: "2026-05-10", texto: "Ligado. Cliente informou interesse em simular empréstimo. Retornar em 15 dias." }, { data: "2026-04-20", texto: "Primeiro contato. Cliente demonstrou interesse mas pediu para ligar depois." }], retorno: "2026-06-10", criadoEm: "2026-04-20" },
  { id: 2, nome: "João Batista Ferreira", cpf: "987.654.321-00", telefone: "(15) 99702-3456", whatsapp: "(15) 99702-3456", cidade: "Votorantim", nascimento: "1948-07-22", tipoBeneficio: "Aposentado", numeroBeneficio: "", bancoPagador: "Banco do Brasil", valorBeneficio: 1800, status: "Em análise", historico: [{ data: "2026-05-28", texto: "Documentos enviados via WhatsApp. Aguardando análise de crédito." }], retorno: "2026-06-05", criadoEm: "2026-05-15" },
  { id: 3, nome: "Ana Lucia Rodrigues", cpf: "456.789.123-00", telefone: "(15) 99603-4567", whatsapp: "(15) 99603-4567", cidade: "Itu", nascimento: "1960-11-05", tipoBeneficio: "Pensionista", numeroBeneficio: "9876543210", bancoPagador: "Bradesco", valorBeneficio: 1412, status: "Contrato fechado", historico: [{ data: "2026-05-20", texto: "Contrato assinado! R$ 8.000 em 60 meses. Cliente muito satisfeita." }, { data: "2026-05-12", texto: "Aprovação confirmada. Agendado para assinatura do contrato." }], retorno: null, criadoEm: "2026-04-30" },
  { id: 4, nome: "José Carlos Mendes", cpf: "321.654.987-00", telefone: "(15) 99504-5678", whatsapp: "(15) 99504-5678", cidade: "Sorocaba", nascimento: "1955-01-18", tipoBeneficio: "Aposentado", numeroBeneficio: "", bancoPagador: "BMG", valorBeneficio: 3200, status: "Novo Lead", historico: [], retorno: "2026-06-15", criadoEm: "2026-06-01" },
  { id: 5, nome: "Francisca Oliveira Santos", cpf: "654.321.987-00", telefone: "(15) 99405-6789", whatsapp: "(15) 99405-6789", cidade: "Salto", nascimento: "1942-09-30", tipoBeneficio: "Pensionista", numeroBeneficio: "5432167890", bancoPagador: "Itaú", valorBeneficio: 1600, status: "Perdido", historico: [{ data: "2026-03-10", texto: "Cliente informou que já fechou com outro escritório. Encerrado." }], retorno: null, criadoEm: "2026-01-15" },
  { id: 6, nome: "Benedito Alves Costa", cpf: "789.123.456-00", telefone: "(15) 99306-7890", whatsapp: "(15) 99306-7890", cidade: "Porto Feliz", nascimento: "1950-04-12", tipoBeneficio: "BPC/LOAS", numeroBeneficio: "", bancoPagador: "Caixa Econômica", valorBeneficio: 1412, status: "Aguardando documentos", historico: [{ data: "2026-05-25", texto: "Ligado. Cliente ainda buscando documentos. Retornar em 7 dias." }], retorno: "2026-06-03", criadoEm: "2026-05-18" },
  { id: 7, nome: "Tereza Lima Carvalho", cpf: "147.258.369-00", telefone: "(15) 99207-8901", whatsapp: "(15) 99207-8901", cidade: "Votorantim", nascimento: "1957-06-28", tipoBeneficio: "Servidor", numeroBeneficio: "1122334455", bancoPagador: "Santander", valorBeneficio: 4500, status: "Aprovado", historico: [{ data: "2026-05-29", texto: "Aprovado R$ 15.000. Aguardando confirmação do cliente para assinar." }], retorno: "2026-06-04", criadoEm: "2026-05-20" },
  { id: 8, nome: "Raimundo Pereira Neto", cpf: "963.852.741-00", telefone: "(15) 99108-9012", whatsapp: "(15) 99108-9012", cidade: "Sorocaba", nascimento: "1944-12-03", tipoBeneficio: "Aposentado", numeroBeneficio: "", bancoPagador: "Caixa Econômica", valorBeneficio: 2200, status: "Interessado", historico: [{ data: "2026-02-10", texto: "Primeiro contato. Interessado mas sem urgência." }], retorno: null, criadoEm: "2026-02-10" },
];

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function daysSince(iso) {
  if (!iso) return 9999;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / 86400000);
}

function initials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = ["#1D9E75","#185FA5","#BA7517","#993556","#534AB7","#0F6E56","#854F0B","#3B6D11"];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function CRMConsignado() {
  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEMO_CLIENTS;
    } catch { return DEMO_CLIENTS; }
  });

  const [view, setView] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [noteText, setNoteText] = useState("");
  const [newRetorno, setNewRetorno] = useState("");
  const [showRetornoModal, setShowRetornoModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    nome: "", cpf: "", telefone: "", whatsapp: "", cidade: "",
    nascimento: "", tipoBeneficio: "Aposentado", numeroBeneficio: "",
    bancoPagador: "Caixa Econômica", valorBeneficio: "", status: "Novo Lead", retorno: ""
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(clients)); } catch {}
  }, [clients]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const hoje = today();
  const retornosHoje = clients.filter(c => c.retorno === hoje).length;
  const semContato90 = clients.filter(c => {
    const lastContact = c.historico.length > 0 ? c.historico[0].data : c.criadoEm;
    return daysSince(lastContact) >= 90 && c.status !== "Perdido" && c.status !== "Contrato fechado";
  });
  const contratosMes = clients.filter(c => {
    if (c.status !== "Contrato fechado") return false;
    if (!c.historico.length) return false;
    const last = c.historico[0].data;
    const now = new Date();
    const d = new Date(last);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const novoLeads = clients.filter(c => c.status === "Novo Lead").length;

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const q = searchQ.toLowerCase();
      const matchSearch = !q || c.nome.toLowerCase().includes(q) || c.cpf.includes(q) || c.cidade.toLowerCase().includes(q) || c.telefone.includes(q);
      const matchStatus = filterStatus === "Todos" || c.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [clients, searchQ, filterStatus]);

  function saveClient(data) {
    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...editingClient, ...data } : c));
      showToast("Cliente atualizado com sucesso!");
    } else {
      const novo = { ...data, id: Date.now(), historico: [], criadoEm: today() };
      setClients(prev => [novo, ...prev]);
      showToast("Cliente cadastrado com sucesso!");
    }
    setShowForm(false);
    setEditingClient(null);
    resetForm();
  }

  function resetForm() {
    setFormData({ nome: "", cpf: "", telefone: "", whatsapp: "", cidade: "", nascimento: "", tipoBeneficio: "Aposentado", numeroBeneficio: "", bancoPagador: "Caixa Econômica", valorBeneficio: "", status: "Novo Lead", retorno: "" });
  }

  function openEdit(client) {
    setEditingClient(client);
    setFormData({
      nome: client.nome, cpf: client.cpf, telefone: client.telefone,
      whatsapp: client.whatsapp, cidade: client.cidade, nascimento: client.nascimento,
      tipoBeneficio: client.tipoBeneficio, numeroBeneficio: client.numeroBeneficio,
      bancoPagador: client.bancoPagador, valorBeneficio: client.valorBeneficio,
      status: client.status, retorno: client.retorno || ""
    });
    setShowForm(true);
  }

  function addNote(clientId, text) {
    if (!text || !text.trim()) return;
    const nota = { data: today(), texto: text.trim() };
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, historico: [nota, ...c.historico] } : c));
    setSelectedClient(prev => prev ? { ...prev, historico: [nota, ...prev.historico] } : prev);
    showToast("Anotação salva!");
  }

  function setRetorno(clientId, data) {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, retorno: data } : c));
    setSelectedClient(prev => prev ? { ...prev, retorno: data } : prev);
    setShowRetornoModal(false);
    showToast("Retorno agendado para " + formatDate(data));
  }

  function updateStatus(clientId, status) {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, status } : c));
    setSelectedClient(prev => prev ? { ...prev, status } : prev);
    showToast("Status atualizado!");
  }

  function deleteClient(clientId) {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    setClients(prev => prev.filter(c => c.id !== clientId));
    setSelectedClient(null);
    showToast("Cliente removido.", "info");
  }

  function openWhatsApp(phone) {
    const n = phone.replace(/\D/g, "");
    const num = n.length === 11 ? "55" + n : n;
    window.open(`https://wa.me/${num}`, "_blank");
  }

  const sc = selectedClient ? clients.find(c => c.id === selectedClient.id) || selectedClient : null;

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-sans); }
    .app { display: flex; height: 100vh; background: var(--color-background-tertiary); overflow: hidden; }
    .sidebar { width: 220px; background: var(--color-background-primary); border-right: 0.5px solid var(--color-border-tertiary); display: flex; flex-direction: column; flex-shrink: 0; }
    .sidebar-logo { padding: 20px 16px 14px; border-bottom: 0.5px solid var(--color-border-tertiary); }
    .sidebar-logo h1 { font-size: 15px; font-weight: 500; color: var(--color-text-primary); line-height: 1.3; }
    .sidebar-logo p { font-size: 11px; color: var(--color-text-secondary); margin-top: 2px; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 16px; font-size: 13px; color: var(--color-text-secondary); cursor: pointer; border: none; border-bottom: 0.5px solid var(--color-border-tertiary); background: none; width: 100%; text-align: left; border-radius: 0; transition: background 0.15s; }
    .nav-item:hover { background: var(--color-background-secondary); color: var(--color-text-primary); }
    .nav-item.active { background: var(--color-background-secondary); color: var(--color-text-primary); font-weight: 500; border-left: 3px solid #1D9E75; padding-left: 13px; }
    .nav-item i { font-size: 17px; }
    .nav-badge { margin-left: auto; background: #E24B4A; color: #fff; font-size: 10px; font-weight: 500; border-radius: 10px; padding: 1px 6px; }
    .nav-section { font-size: 10px; color: var(--color-text-secondary); padding: 14px 16px 4px; letter-spacing: 0.08em; text-transform: uppercase; }
    .main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
    .topbar { background: var(--color-background-primary); border-bottom: 0.5px solid var(--color-border-tertiary); padding: 12px 24px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .topbar h2 { font-size: 16px; font-weight: 500; color: var(--color-text-primary); flex: 1; }
    .search-wrap { position: relative; }
    .search-wrap i { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--color-text-secondary); font-size: 16px; pointer-events: none; }
    .search-wrap input { padding-left: 34px; width: 220px; }
    select { font-size: 13px; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; font-size: 13px; border-radius: var(--border-radius-md); border: 0.5px solid var(--color-border-secondary); background: var(--color-background-primary); color: var(--color-text-primary); cursor: pointer; font-family: var(--font-sans); transition: background 0.15s; white-space: nowrap; }
    .btn:hover { background: var(--color-background-secondary); }
    .btn-primary { background: #1D9E75; color: #fff; border-color: #1D9E75; }
    .btn-primary:hover { background: #0F6E56; }
    .btn-sm { padding: 5px 10px; font-size: 12px; }
    .btn-danger { background: #FCEBEB; color: #A32D2D; border-color: #F7C1C1; font-weight: 500; }
    .btn-danger:hover { background: #F7C1C1; }
    .content { padding: 20px 24px; flex: 1; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .metric-card { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: 16px 20px; position: relative; overflow: hidden; }
    .metric-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #1D9E75; }
    .metric-card .label { font-size: 11px; color: var(--color-text-secondary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; display: flex; align-items: center; gap: 6px; }
    .metric-card .value { font-size: 32px; font-weight: 500; color: var(--color-text-primary); line-height: 1; }
    .metric-card .sub { font-size: 11px; color: var(--color-text-secondary); margin-top: 6px; }
    .card { background: var(--color-background-primary); border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-lg); padding: 16px 20px; margin-bottom: 16px; }
    .card h3 { font-size: 14px; font-weight: 500; margin-bottom: 12px; color: var(--color-text-primary); }
    .client-table { width: 100%; border-collapse: collapse; }
    .client-table th { font-size: 11px; color: var(--color-text-secondary); text-align: left; padding: 8px 12px; border-bottom: 0.5px solid var(--color-border-tertiary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; background: var(--color-background-secondary); }
    .client-table td { font-size: 13px; padding: 10px 12px; border-bottom: 0.5px solid var(--color-border-tertiary); color: var(--color-text-primary); vertical-align: middle; }
    .client-table tr:hover td { background: var(--color-background-secondary); cursor: pointer; }
    .client-table tr:last-child td { border-bottom: none; }
    .status-badge { display: inline-block; padding: 3px 9px; border-radius: 10px; font-size: 11px; font-weight: 500; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 500; color: #fff; flex-shrink: 0; }
    .client-name-cell { display: flex; align-items: center; gap: 10px; }
    .detail-panel { width: 380px; background: var(--color-background-primary); border-left: 0.5px solid var(--color-border-tertiary); display: flex; flex-direction: column; flex-shrink: 0; overflow-y: auto; }
    .detail-header { padding: 16px 20px; border-bottom: 0.5px solid var(--color-border-tertiary); display: flex; align-items: center; gap: 12px; }
    .detail-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 500; color: #fff; flex-shrink: 0; }
    .detail-body { padding: 16px 20px; flex: 1; }
    .info-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 7px 0; border-bottom: 0.5px solid var(--color-border-tertiary); }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 12px; color: var(--color-text-secondary); flex-shrink: 0; margin-right: 8px; }
    .info-val { font-size: 13px; color: var(--color-text-primary); text-align: right; }
    .section-title { font-size: 11px; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.07em; font-weight: 500; margin: 16px 0 8px; }
    .note-item { padding: 10px 0; border-bottom: 0.5px solid var(--color-border-tertiary); }
    .note-item:last-child { border-bottom: none; }
    .note-date { font-size: 11px; color: var(--color-text-secondary); margin-bottom: 3px; font-weight: 500; }
    .note-text { font-size: 13px; color: var(--color-text-primary); line-height: 1.5; }
    .note-input { width: 100%; min-height: 70px; resize: vertical; font-size: 13px; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(2px); }
    .modal { background: var(--color-background-primary); border-radius: var(--border-radius-lg); width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; border: 0.5px solid var(--color-border-tertiary); box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
    .modal-header { padding: 18px 20px 14px; border-bottom: 0.5px solid var(--color-border-tertiary); display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { font-size: 16px; font-weight: 500; }
    .modal-body { padding: 20px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group.full { grid-column: 1 / -1; }
    .form-group label { font-size: 12px; color: var(--color-text-secondary); font-weight: 500; }
    .form-group input, .form-group select { font-size: 13px; }
    .retorno-modal { max-width: 320px; }
    .retorno-opts { display: flex; flex-direction: column; gap: 8px; }
    .retorno-opt { padding: 10px 14px; border: 0.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md); cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 10px; background: var(--color-background-primary); transition: background 0.15s; }
    .retorno-opt:hover { background: var(--color-background-secondary); }
    .toast { position: fixed; bottom: 24px; right: 24px; z-index: 999; padding: 10px 18px; border-radius: var(--border-radius-md); font-size: 13px; font-weight: 500; box-shadow: 0 2px 12px rgba(0,0,0,0.1); animation: slideUp 0.2s ease; }
    .toast.success { background: #EAF3DE; color: #3B6D11; border: 0.5px solid #C0DD97; }
    .toast.info { background: #E6F1FB; color: #185FA5; border: 0.5px solid #B5D4F4; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .retorno-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; background: #FAEEDA; color: #BA7517; padding: 2px 8px; border-radius: 10px; }
    .retorno-late { background: #FCEBEB; color: #A32D2D; }
    .empty-state { text-align: center; padding: 48px 24px; color: var(--color-text-secondary); font-size: 13px; }
    .empty-state i { font-size: 36px; display: block; margin-bottom: 10px; opacity: 0.5; }
    .wpp-btn { background: #25D366; color: #fff; border-color: #25D366; }
    .wpp-btn:hover { background: #1da851; }
    .alert-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: var(--border-radius-md); background: var(--color-background-secondary); margin-bottom: 8px; }
    .alert-row:last-child { margin-bottom: 0; }
    .chips-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
    .chip { padding: 6px 14px; border-radius: var(--border-radius-md); font-size: 12px; font-weight: 500; border: 0.5px solid var(--color-border-secondary); cursor: pointer; background: var(--color-background-primary); color: var(--color-text-secondary); transition: all 0.15s; display: flex; align-items: center; gap: 5px; }
    .chip:hover { background: var(--color-background-secondary); color: var(--color-text-primary); border-color: var(--color-border-primary); }
    .chip.active { background: #1D9E75; color: #fff; border-color: #1D9E75; }
    .detail-section { border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md); padding: 12px 14px; margin-bottom: 10px; }
    .detail-section-title { font-size: 11px; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.07em; font-weight: 500; margin-bottom: 10px; display: flex; align-items: center; gap: 5px; }
    .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .retorno-alert { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: var(--border-radius-md); background: #FAEEDA; border: 0.5px solid #FAC775; margin-bottom: 12px; }
    .retorno-alert i { color: #BA7517; font-size: 16px; }
    .retorno-alert span { font-size: 13px; color: #854F0B; font-weight: 500; }
  `;

  function Dashboard() {
    return (
      <div className="content">
        {retornosHoje > 0 && (
          <div className="retorno-alert">
            <i className="ti ti-bell" aria-hidden="true"></i>
            <span>Você tem {retornosHoje} retorno{retornosHoje > 1 ? "s" : ""} agendado{retornosHoje > 1 ? "s" : ""} para hoje!</span>
            <button className="btn btn-sm" style={{ marginLeft: "auto" }} onClick={() => setView("retornos")}>Ver agora</button>
          </div>
        )}
        <div className="grid-4">
          <div className="metric-card">
            <div className="label"><i className="ti ti-users" aria-hidden="true"></i> Clientes totais</div>
            <div className="value">{clients.length}</div>
            <div className="sub">na carteira</div>
          </div>
          <div className="metric-card" style={{ "--accent": "#1D9E75" }}>
            <div className="label"><i className="ti ti-user-plus" aria-hidden="true"></i> Novos leads</div>
            <div className="value" style={{ color: "#1D9E75" }}>{novoLeads}</div>
            <div className="sub">aguardando contato</div>
          </div>
          <div className="metric-card">
            <div className="label"><i className="ti ti-calendar-event" aria-hidden="true"></i> Retornos hoje</div>
            <div className="value" style={{ color: retornosHoje > 0 ? "#BA7517" : undefined }}>{retornosHoje}</div>
            <div className="sub">{retornosHoje > 0 ? "atenção necessária" : "nenhum agendado"}</div>
          </div>
          <div className="metric-card">
            <div className="label"><i className="ti ti-clock-off" aria-hidden="true"></i> Sem contato 90 dias</div>
            <div className="value" style={{ color: semContato90.length > 0 ? "#A32D2D" : undefined }}>{semContato90.length}</div>
            <div className="sub">clientes esquecidos</div>
          </div>
        </div>
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="metric-card" style={{ gridColumn: "span 1" }}>
            <div className="label"><i className="ti ti-file-check" aria-hidden="true"></i> Contratos este mês</div>
            <div className="value" style={{ color: "#0F6E56" }}>{contratosMes}</div>
            <div className="sub">fechados no mês</div>
          </div>
          <div className="metric-card">
            <div className="label"><i className="ti ti-chart-pie" aria-hidden="true"></i> Taxa de conversão</div>
            <div className="value" style={{ color: "#185FA5" }}>{clients.length ? Math.round(clients.filter(c => c.status === "Contrato fechado").length / clients.length * 100) : 0}%</div>
            <div className="sub">leads → contratos</div>
          </div>
          <div className="metric-card">
            <div className="label"><i className="ti ti-hourglass" aria-hidden="true"></i> Em andamento</div>
            <div className="value">{clients.filter(c => !["Contrato fechado","Perdido"].includes(c.status)).length}</div>
            <div className="sub">em negociação</div>
          </div>
          <div className="metric-card">
            <div className="label"><i className="ti ti-trophy" aria-hidden="true"></i> Contratos totais</div>
            <div className="value" style={{ color: "#0F6E56" }}>{clients.filter(c => c.status === "Contrato fechado").length}</div>
            <div className="sub">histórico geral</div>
          </div>
        </div>
        <div className="dash-grid">
          <div className="card">
            <h3>Distribuição por status</h3>
            {Object.keys(STATUS_CONFIG).map(s => {
              const cnt = clients.filter(c => c.status === s).length;
              const pct = clients.length ? Math.round(cnt / clients.length * 100) : 0;
              const cfg = STATUS_CONFIG[s];
              return (
                <div key={s} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                    <span style={{ color: "var(--color-text-secondary)" }}>{s}</span>
                    <span style={{ fontWeight: 500 }}>{cnt}</span>
                  </div>
                  <div style={{ height: 5, background: "var(--color-background-secondary)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: cfg.color, borderRadius: 3 }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card">
            <h3>Retornos agendados</h3>
            {clients.filter(c => c.retorno).sort((a, b) => a.retorno.localeCompare(b.retorno)).slice(0, 6).map(c => (
              <div key={c.id} className="alert-row" style={{ cursor: "pointer" }} onClick={() => { setSelectedClient(c); setView("clientes"); }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.nome.split(" ").slice(0, 2).join(" ")}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{c.status}</div>
                </div>
                <span className={`retorno-tag ${c.retorno < hoje ? "retorno-late" : ""}`}>
                  <i className="ti ti-calendar" style={{ fontSize: 11 }} aria-hidden="true"></i>
                  {formatDate(c.retorno)}
                </span>
              </div>
            ))}
            {!clients.filter(c => c.retorno).length && <div className="empty-state" style={{ padding: 20 }}><i className="ti ti-calendar-off" aria-hidden="true"></i>Nenhum retorno agendado</div>}
          </div>
        </div>
      </div>
    );
  }

  function ClientList() {
    return (
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
          <div className="chips-row">
            {["Todos", ...Object.keys(STATUS_CONFIG)].map(s => (
              <button key={s} className={`chip ${filterStatus === s ? "active" : ""}`} onClick={() => setFilterStatus(s)}>{s}</button>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {filteredClients.length === 0 ? (
              <div className="empty-state"><i className="ti ti-users" aria-hidden="true"></i>Nenhum cliente encontrado</div>
            ) : (
              <table className="client-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Cidade</th>
                    <th>Tipo</th>
                    <th>Benefício</th>
                    <th>Status</th>
                    <th>Retorno</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(c => {
                    const cfg = STATUS_CONFIG[c.status];
                    const late = c.retorno && c.retorno < hoje;
                    return (
                      <tr key={c.id} onClick={() => setSelectedClient(c)} style={{ background: sc?.id === c.id ? "var(--color-background-secondary)" : undefined }}>
                        <td>
                          <div className="client-name-cell">
                            <div className="avatar" style={{ background: avatarColor(c.nome) }}>{initials(c.nome)}</div>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: 13 }}>{c.nome}</div>
                              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{c.telefone}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{c.cidade}</td>
                        <td style={{ fontSize: 12 }}>{c.tipoBeneficio}</td>
                        <td style={{ fontSize: 13, fontWeight: 500 }}>{c.valorBeneficio ? `R$ ${Number(c.valorBeneficio).toLocaleString("pt-BR")}` : "—"}</td>
                        <td><span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span></td>
                        <td>
                          {c.retorno ? (
                            <span className={`retorno-tag ${late ? "retorno-late" : ""}`}>
                              {late && <i className="ti ti-alert-circle" style={{ fontSize: 11 }} aria-hidden="true"></i>}
                              {formatDate(c.retorno)}
                            </span>
                          ) : <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {sc && <ClientDetail client={sc} />}
      </div>
    );
  }

  function ClientDetail({ client: c }) {
    const cfg = STATUS_CONFIG[c.status];
    const [localNote, setLocalNote] = useState("");
    return (
      <div className="detail-panel">
        <div className="detail-header">
          <div className="detail-avatar" style={{ background: avatarColor(c.nome) }}>{initials(c.nome)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{c.nome}</div>
            <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>{c.status}</span>
          </div>
          <button className="btn btn-sm" style={{ padding: "5px 8px" }} onClick={() => setSelectedClient(null)}><i className="ti ti-x" aria-hidden="true"></i></button>
        </div>
        <div className="detail-body">
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            <button className="btn btn-sm wpp-btn" onClick={() => openWhatsApp(c.whatsapp)}><i className="ti ti-brand-whatsapp" aria-hidden="true"></i> WhatsApp</button>
            <button className="btn btn-sm" onClick={() => openEdit(c)}><i className="ti ti-edit" aria-hidden="true"></i> Editar</button>
            <button className="btn btn-sm btn-danger" onClick={() => deleteClient(c.id)}><i className="ti ti-trash" aria-hidden="true"></i> Excluir</button>
          </div>

          <div className="detail-section">
            <div className="detail-section-title"><i className="ti ti-flag" aria-hidden="true"></i> Status</div>
            <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)} style={{ width: "100%", fontSize: 13 }}>
              {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="detail-section">
            <div className="detail-section-title"><i className="ti ti-calendar" aria-hidden="true"></i> Retorno agendado</div>
            {c.retorno ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`retorno-tag ${c.retorno < hoje ? "retorno-late" : ""}`} style={{ fontSize: 13, padding: "5px 12px" }}>
                  <i className="ti ti-calendar-check" style={{ fontSize: 13 }} aria-hidden="true"></i>
                  {formatDate(c.retorno)}
                </span>
                <button className="btn btn-sm" onClick={() => setShowRetornoModal(c.id)}><i className="ti ti-edit" aria-hidden="true"></i></button>
                <button className="btn btn-sm btn-danger" onClick={() => { setClients(prev => prev.map(x => x.id === c.id ? { ...x, retorno: null } : x)); setSelectedClient(prev => prev ? { ...prev, retorno: null } : prev); showToast("Retorno removido."); }} style={{ padding: "5px 8px" }}><i className="ti ti-x" aria-hidden="true"></i></button>
              </div>
            ) : (
              <button className="btn btn-sm" onClick={() => setShowRetornoModal(c.id)}><i className="ti ti-calendar-plus" aria-hidden="true"></i> Agendar retorno</button>
            )}
          </div>

          <div className="detail-section">
            <div className="detail-section-title"><i className="ti ti-user" aria-hidden="true"></i> Dados pessoais</div>
            {[
              ["CPF", c.cpf], ["Telefone", c.telefone], ["WhatsApp", c.whatsapp],
              ["Cidade", c.cidade], ["Nascimento", formatDate(c.nascimento)],
            ].map(([l, v]) => (
              <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-val">{v || "—"}</span></div>
            ))}
          </div>

          <div className="detail-section">
            <div className="detail-section-title"><i className="ti ti-id-badge" aria-hidden="true"></i> Benefício</div>
            {[
              ["Tipo", c.tipoBeneficio], ["Nº Benefício", c.numeroBeneficio || "—"],
              ["Banco pagador", c.bancoPagador], ["Valor", c.valorBeneficio ? `R$ ${Number(c.valorBeneficio).toLocaleString("pt-BR")}` : "—"],
            ].map(([l, v]) => (
              <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-val">{v}</span></div>
            ))}
          </div>

          <div className="detail-section">
            <div className="detail-section-title"><i className="ti ti-pencil" aria-hidden="true"></i> Nova anotação</div>
            <textarea className="note-input" placeholder="Digite o que aconteceu na ligação..." value={localNote} onChange={e => setLocalNote(e.target.value)} />
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8, width: "100%" }} onClick={() => { if (!localNote.trim()) return; addNote(c.id, localNote); setLocalNote(""); }}>
              <i className="ti ti-device-floppy" aria-hidden="true"></i> Salvar anotação
            </button>
          </div>

          <div className="detail-section">
            <div className="detail-section-title"><i className="ti ti-history" aria-hidden="true"></i> Histórico ({c.historico.length})</div>
            {c.historico.length === 0 && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", padding: "8px 0" }}>Nenhuma anotação ainda.</div>}
            {c.historico.map((h, i) => (
              <div key={i} className="note-item">
                <div className="note-date">{formatDate(h.data)}</div>
                <div className="note-text">{h.texto}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function Esquecidos() {
    return (
      <div className="content">
        <div className="card" style={{ background: "#FCEBEB", border: "0.5px solid #F7C1C1", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 20, color: "#A32D2D" }} aria-hidden="true"></i>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#A32D2D" }}>{semContato90.length} clientes sem contato há mais de 90 dias</div>
              <div style={{ fontSize: 12, color: "#993556", marginTop: 2 }}>Entre em contato agora — esses clientes podem estar prestes a fechar com a concorrência.</div>
            </div>
          </div>
        </div>
        {semContato90.length === 0 ? (
          <div className="empty-state card"><i className="ti ti-circle-check" aria-hidden="true"></i>Ótimo! Nenhum cliente esquecido.</div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <table className="client-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Cidade</th>
                  <th>Status</th>
                  <th>Último contato</th>
                  <th>Dias sem contato</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {semContato90.map(c => {
                  const lastDate = c.historico.length > 0 ? c.historico[0].data : c.criadoEm;
                  const dias = daysSince(lastDate);
                  const cfg = STATUS_CONFIG[c.status];
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="client-name-cell">
                          <div className="avatar" style={{ background: avatarColor(c.nome) }}>{initials(c.nome)}</div>
                          <span style={{ fontWeight: 500 }}>{c.nome}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{c.cidade}</td>
                      <td><span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span></td>
                      <td style={{ fontSize: 12 }}>{formatDate(lastDate)}</td>
                      <td>
                        <span style={{ fontWeight: 500, color: dias > 180 ? "#A32D2D" : "#BA7517" }}>{dias} dias</span>
                      </td>
                      <td>
                        <button className="btn btn-sm wpp-btn" onClick={() => openWhatsApp(c.whatsapp)}>
                          <i className="ti ti-brand-whatsapp" aria-hidden="true"></i> Contatar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function Retornos() {
    const retornos = clients.filter(c => c.retorno).sort((a, b) => a.retorno.localeCompare(b.retorno));
    const vencidos = retornos.filter(c => c.retorno < hoje);
    const deHoje = retornos.filter(c => c.retorno === hoje);
    const proximos = retornos.filter(c => c.retorno > hoje);

    function Section({ title, items, color }) {
      if (!items.length) return null;
      return (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title} ({items.length})</div>
          <div className="card" style={{ padding: 0 }}>
            <table className="client-table">
              <thead><tr><th>Cliente</th><th>Status</th><th>Retorno</th><th>Ação</th></tr></thead>
              <tbody>
                {items.map(c => {
                  const cfg = STATUS_CONFIG[c.status];
                  return (
                    <tr key={c.id} onClick={() => { setSelectedClient(c); setView("clientes"); }}>
                      <td>
                        <div className="client-name-cell">
                          <div className="avatar" style={{ background: avatarColor(c.nome) }}>{initials(c.nome)}</div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{c.nome.split(" ").slice(0, 2).join(" ")}</div>
                            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{c.telefone}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span></td>
                      <td><span style={{ fontWeight: 500, color }}>{formatDate(c.retorno)}</span></td>
                      <td>
                        <button className="btn btn-sm wpp-btn" onClick={e => { e.stopPropagation(); openWhatsApp(c.whatsapp); }}>
                          <i className="ti ti-brand-whatsapp" aria-hidden="true"></i> WhatsApp
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    return (
      <div className="content">
        <Section title="Vencidos" items={vencidos} color="#A32D2D" />
        <Section title="Hoje" items={deHoje} color="#BA7517" />
        <Section title="Próximos" items={proximos} color="#1D9E75" />
        {!retornos.length && <div className="empty-state card"><i className="ti ti-calendar-off" aria-hidden="true"></i>Nenhum retorno agendado.</div>}
      </div>
    );
  }

  function ClientForm() {
    const [local, setLocal] = useState(formData);
    function handle(e) { const { name, value } = e.target; setLocal(p => ({ ...p, [name]: value })); }
    return (
      <div className="overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
        <div className="modal">
          <div className="modal-header">
            <h3>{editingClient ? "Editar cliente" : "Novo cliente"}</h3>
            <button className="btn btn-sm" onClick={() => { setShowForm(false); setEditingClient(null); resetForm(); }}><i className="ti ti-x" aria-hidden="true"></i></button>
          </div>
          <div className="modal-body">
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Dados pessoais</div>
            <div className="form-grid">
              <div className="form-group full"><label>Nome completo *</label><input name="nome" value={local.nome} onChange={handle} placeholder="Maria Aparecida Silva" /></div>
              <div className="form-group"><label>CPF</label><input name="cpf" value={local.cpf} onChange={handle} placeholder="123.456.789-00" /></div>
              <div className="form-group"><label>Data de nascimento</label><input name="nascimento" type="date" value={local.nascimento} onChange={handle} /></div>
              <div className="form-group"><label>Telefone</label><input name="telefone" value={local.telefone} onChange={handle} placeholder="(15) 99900-0000" /></div>
              <div className="form-group"><label>WhatsApp</label><input name="whatsapp" value={local.whatsapp} onChange={handle} placeholder="(15) 99900-0000" /></div>
              <div className="form-group full"><label>Cidade</label><input name="cidade" value={local.cidade} onChange={handle} placeholder="Sorocaba" /></div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", margin: "16px 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Benefício</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Tipo de benefício</label>
                <select name="tipoBeneficio" value={local.tipoBeneficio} onChange={handle}>
                  {TIPO_BENEFICIO.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Número do benefício</label><input name="numeroBeneficio" value={local.numeroBeneficio} onChange={handle} placeholder="Opcional" /></div>
              <div className="form-group">
                <label>Banco pagador</label>
                <select name="bancoPagador" value={local.bancoPagador} onChange={handle}>
                  {BANCOS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Valor do benefício (R$)</label><input name="valorBeneficio" type="number" value={local.valorBeneficio} onChange={handle} placeholder="1412" /></div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", margin: "16px 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Comercial</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={local.status} onChange={handle}>
                  {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Data de retorno</label><input name="retorno" type="date" value={local.retorno} onChange={handle} /></div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => { setShowForm(false); setEditingClient(null); resetForm(); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => { if (!local.nome.trim()) return alert("Nome é obrigatório."); saveClient(local); }}>
                <i className="ti ti-device-floppy" aria-hidden="true"></i>
                {editingClient ? "Salvar alterações" : "Cadastrar cliente"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function RetornoModal({ clientId }) {
    const [custom, setCustom] = useState("");
    return (
      <div className="overlay" onClick={e => e.target === e.currentTarget && setShowRetornoModal(false)}>
        <div className="modal retorno-modal">
          <div className="modal-header">
            <h3>Agendar retorno</h3>
            <button className="btn btn-sm" onClick={() => setShowRetornoModal(false)}><i className="ti ti-x" aria-hidden="true"></i></button>
          </div>
          <div className="modal-body">
            <div className="retorno-opts">
              {[["Amanhã", 1, "ti-calendar"], ["Em 7 dias", 7, "ti-calendar-week"], ["Em 30 dias", 30, "ti-calendar-month"], ["Em 90 dias", 90, "ti-calendar-time"]].map(([label, days, icon]) => (
                <button key={label} className="retorno-opt" onClick={() => setRetorno(clientId, addDays(days))}>
                  <i className={`ti ${icon}`} aria-hidden="true"></i>
                  {label} — <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>{formatDate(addDays(days))}</span>
                </button>
              ))}
              <div className="form-group" style={{ marginTop: 8 }}>
                <label>Data específica</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="date" value={custom} onChange={e => setCustom(e.target.value)} />
                  <button className="btn btn-primary btn-sm" onClick={() => custom && setRetorno(clientId, custom)}>OK</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const viewTitle = { dashboard: "Dashboard", clientes: "Clientes", esquecidos: "Clientes esquecidos", retornos: "Agenda de retornos" };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>CRM Consignado</h1>
            <p>Empréstimo para aposentados</p>
          </div>
          <nav style={{ flex: 1, paddingTop: 8 }}>
            <div className="nav-section">Menu</div>
            {[
              { id: "dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
              { id: "clientes", icon: "ti-users", label: "Clientes" },
              { id: "retornos", icon: "ti-calendar", label: "Retornos", badge: retornosHoje || null },
              { id: "esquecidos", icon: "ti-user-question", label: "Esquecidos", badge: semContato90.length || null },
            ].map(({ id, icon, label, badge }) => (
              <button key={id} className={`nav-item ${view === id ? "active" : ""}`} onClick={() => setView(id)}>
                <i className={`ti ${icon}`} aria-hidden="true"></i>
                {label}
                {badge ? <span className="nav-badge">{badge}</span> : null}
              </button>
            ))}
          </nav>
          <div style={{ padding: "12px 16px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{clients.length} clientes na carteira</div>
          </div>
        </aside>

        <div className="main">
          <div className="topbar">
            <h2>{viewTitle[view]}</h2>
            {(view === "clientes") && (
              <div className="search-wrap">
                <i className="ti ti-search" aria-hidden="true"></i>
                <input placeholder="Buscar cliente..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              </div>
            )}
            <button className="btn btn-primary" onClick={() => { setEditingClient(null); resetForm(); setShowForm(true); }}>
              <i className="ti ti-plus" aria-hidden="true"></i> Novo cliente
            </button>
          </div>

          {view === "dashboard" && <Dashboard />}
          {view === "clientes" && <ClientList />}
          {view === "esquecidos" && <Esquecidos />}
          {view === "retornos" && <Retornos />}
        </div>
      </div>

      {showForm && <ClientForm />}
      {showRetornoModal && <RetornoModal clientId={showRetornoModal} />}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
