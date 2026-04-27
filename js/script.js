// js/script.js
let fantasias = [];
let acessorios = [];
let filtroAtual = { vibe: null, search: '', tamanho: '', genero: '', preco: '', estilo: '' };

document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    renderizarVibes();
    renderizarMaisPedidas();
    setupFiltros();
    setupCarousel();
});

// Carregar JSONs
async function carregarDados() {
    const [fData, aData] = await Promise.all([
        fetch('data/fantasias.json').then(r => r.json()),
        fetch('data/acessorios.json').then(r => r.json())
    ]);
    fantasias = fData;
    acessorios = aData;
}

// ==================== VIBES ====================
const vibes = [
    { id: 'impactar', nome: 'IMPACTAR', emoji: '💀', cor: '#ff00aa' },
    { id: 'divertir', nome: 'DIVERTIR', emoji: '😀', cor: '#ffd700' },
    { id: 'brilhar', nome: 'BRILHAR', emoji: '⚡', cor: '#00f0ff' },
    { id: 'luxo', nome: 'LUXO', emoji: '👑', cor: '#9b00ff' }
];

function renderizarVibes() {
    const container = document.getElementById('vibes-grid');
    container.innerHTML = vibes.map(v => `
        <button class="vibe-btn" style="border-color:${v.cor}" data-vibe="${v.id}">
            ${v.emoji} ${v.nome}
        </button>
    `).join('');

    container.querySelectorAll('.vibe-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.vibe-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtroAtual.vibe = btn.dataset.vibe;
            filtrarProdutos();
        });
    });
}

// ==================== MAIS PEDIDAS ====================
function renderizarMaisPedidas() {
    const track = document.getElementById('carousel-track');
    const destaques = fantasias.filter(f => f.destaque);

    track.innerHTML = destaques.map(f => `
        <div class="product-card" onclick="abrirModal('${f.id}')">
            <img src="${f.imagem}" alt="${f.nome}">
            <h3>${f.nome}</h3>
            <div class="price">R$ ${f.preco.toFixed(2).replace('.', ',')}</div>
        </div>
    `).join('');
}

function setupCarousel() {
    const track = document.getElementById('carousel-track');
    const prev = document.getElementById('prev-btn');
    const next = document.getElementById('next-btn');

    prev.addEventListener('click', () => track.scrollBy({ left: -300, behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: 300, behavior: 'smooth' }));
}

// ==================== FILTROS ====================
function setupFiltros() {
    const inputs = ['search-input', 'filter-tamanho', 'filter-genero', 'filter-preco', 'filter-estilo'];
    
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => {
            filtroAtual.search = document.getElementById('search-input').value.toLowerCase();
            filtroAtual.tamanho = document.getElementById('filter-tamanho').value;
            filtroAtual.genero = document.getElementById('filter-genero').value;
            filtroAtual.preco = document.getElementById('filter-preco').value;
            filtroAtual.estilo = document.getElementById('filter-estilo').value;
            filtrarProdutos();
        });
    });

    document.getElementById('btn-limpar-filtros').addEventListener('click', limparFiltros);
}

function filtrarProdutos() {
    // Implementação completa de filtro combinado (pode ser expandida)
    console.log('Filtro aplicado:', filtroAtual);
    // Aqui você pode renderizar uma seção "Resultados" se quiser
}

// ==================== MODAL ====================
let produtoAtual = null;
let acessoriosSelecionados = [];

function abrirModal(id) {
    produtoAtual = fantasias.find(f => f.id === id);
    if (!produtoAtual) return;

    acessoriosSelecionados = [];
    
    document.getElementById('modal-image').innerHTML = `<img src="${produtoAtual.imagem}" style="width:100%; border-radius:16px;">`;
    document.getElementById('modal-nome').textContent = produtoAtual.nome;
    document.getElementById('modal-descricao').textContent = produtoAtual.descricao || "Fantasia premium de alta qualidade.";
    document.getElementById('modal-preco').innerHTML = `R$ <strong>${produtoAtual.preco.toFixed(2).replace('.', ',')}</strong>`;

    // Tamanhos
    const tamanhosHTML = produtoAtual.tamanhos.map(t => `<span class="tag">${t}</span>`).join('');
    document.getElementById('modal-tamanhos-list').innerHTML = tamanhosHTML;

    // Upsell
    renderizarUpsell();

    document.getElementById('modal').style.display = 'flex';
}

function renderizarUpsell() {
    const container = document.getElementById('upsell-list');
    container.innerHTML = acessorios.map(acc => `
        <div class="upsell-item">
            <input type="checkbox" id="acc-${acc.id}" onchange="toggleAcessorio('${acc.id}')">
            <img src="${acc.imagem}" alt="${acc.nome}">
            <div>
                <strong>${acc.nome}</strong><br>
                <small>R$ ${acc.preco.toFixed(2).replace('.', ',')}</small>
            </div>
        </div>
    `).join('');
}

function toggleAcessorio(id) {
    const checked = document.getElementById(`acc-${id}`).checked;
    if (checked) acessoriosSelecionados.push(id);
    else acessoriosSelecionados = acessoriosSelecionados.filter(a => a !== id);
    
    calcularDesconto();
}

function calcularDesconto() {
    const qtd = acessoriosSelecionados.length;
    let desconto = 0;
    if (qtd === 1) desconto = 0.05;
    if (qtd === 2) desconto = 0.08;
    if (qtd >= 3) desconto = 0.10;

    const valorAcessorios = acessoriosSelecionados.reduce((sum, id) => {
        const acc = acessorios.find(a => a.id === id);
        return sum + (acc ? acc.preco : 0);
    }, 0);

    const economia = valorAcessorios * desconto;
    const total = produtoAtual.preco + valorAcessorios - economia;

    document.getElementById('discount-text').innerHTML = 
        `🔥 Você economiza <strong>R$ ${economia.toFixed(2).replace('.', ',')}</strong> (${(desconto*100).toFixed(0)}%)`;

    document.getElementById('total-final').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}

// ==================== WHATSAPP ====================
function enviarWhatsApp() {
    if (!produtoAtual) return;

    const acessoriosNomes = acessoriosSelecionados.map(id => {
        const acc = acessorios.find(a => a.id === id);
        return acc ? acc.nome : '';
    }).filter(Boolean).join(', ');

    const mensagem = encodeURIComponent(
        `*Quero este look!*\n\n` +
        `Fantasia: ${produtoAtual.nome}\n` +
        `Acessórios: ${acessoriosNomes || 'Nenhum'}\n` +
        `Total: R$ ${document.getElementById('total-final').textContent || produtoAtual.preco}\n\n` +
        `Vou alugar pela Crazy Fantasy! 🔥`
    );

    window.open(`https://wa.me/5519992850208?text=${mensagem}`, '_blank');
}

function limparFiltros() {
    filtroAtual = { vibe: null, search: '', tamanho: '', genero: '', preco: '', estilo: '' };
    document.querySelectorAll('select').forEach(s => s.value = '');
    document.getElementById('search-input').value = '';
    document.querySelectorAll('.vibe-btn').forEach(b => b.classList.remove('active'));
}
