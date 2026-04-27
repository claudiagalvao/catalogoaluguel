// js/script.js
let fantasias = [];
let acessorios = [];
let produtoAtual = null;
let acessoriosSelecionados = [];

document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    renderVibes();
    renderMaisPedidas();
    setupEventListeners();
});

async function carregarDados() {
    try {
        const [fData, aData] = await Promise.all([
            fetch('data/fantasias.json').then(res => res.json()),
            fetch('data/acessorios.json').then(res => res.json())
        ]);
        fantasias = fData;
        acessorios = aData;
    } catch (e) {
        console.error("Erro ao carregar JSON", e);
    }
}

// ==================== VIBES ====================
function renderVibes() {
    const vibesContainer = document.getElementById('vibes');
    const vibes = [
        { id: 'impactar', text: 'IMPACTAR', emoji: '💀', color: '#ff00aa' },
        { id: 'divertir', text: 'DIVERTIR', emoji: '😀', color: '#ffd700' },
        { id: 'brilhar', text: 'BRILHAR', emoji: '⚡', color: '#00ffff' },
        { id: 'luxo',    text: 'LUXO',    emoji: '👑', color: '#9b00ff' }
    ];

    vibesContainer.innerHTML = vibes.map(v => `
        <button class="vibe-btn" data-vibe="${v.id}" style="border-color:${v.color}">
            ${v.emoji} ${v.text}
        </button>
    `).join('');

    vibesContainer.querySelectorAll('.vibe-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.vibe-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtrarPorVibe(btn.dataset.vibe);
        });
    });
}

// ==================== MAIS PEDIDAS ====================
function renderMaisPedidas() {
    const carousel = document.getElementById('carousel');
    const destaques = fantasias.filter(f => f.destaque === true);

    carousel.innerHTML = destaques.map(fantasia => `
        <div class="product-card" onclick="abrirModal('${fantasia.id}')">
            <img src="${fantasia.imagem}" alt="${fantasia.nome}">
            <div class="product-info">
                <h3>${fantasia.nome}</h3>
                <p class="price">R$ ${fantasia.preco.toFixed(2).replace('.', ',')}</p>
                <small>${fantasia.tamanhos.join(' • ')}</small>
            </div>
        </div>
    `).join('');
}

// ==================== MODAL ====================
function abrirModal(id) {
    produtoAtual = fantasias.find(f => f.id === id);
    if (!produtoAtual) return;

    acessoriosSelecionados = [];

    document.getElementById('modal-image').innerHTML = `<img src="${produtoAtual.imagem}" alt="${produtoAtual.nome}">`;
    document.getElementById('modal-nome').textContent = produtoAtual.nome;
    document.getElementById('modal-preco').innerHTML = `R$ <strong>${produtoAtual.preco.toFixed(2).replace('.', ',')}</strong>`;
    document.getElementById('modal-descricao').textContent = produtoAtual.descricao || "Fantasia premium para causar impacto!";

    // Tamanhos
    document.getElementById('modal-tamanhos').innerHTML = produtoAtual.tamanhos.map(t => 
        `<span class="size-tag">${t}</span>`).join('');

    renderUpsell();
    document.getElementById('modal').style.display = 'flex';
}

function renderUpsell() {
    const container = document.getElementById('upsell-list');
    container.innerHTML = acessorios.map(acc => `
        <label class="upsell-item">
            <input type="checkbox" onchange="toggleAcessorio('${acc.id}')">
            <img src="${acc.imagem}" alt="${acc.nome}">
            <div>
                <strong>${acc.nome}</strong><br>
                <span>R$ ${acc.preco.toFixed(2).replace('.', ',')}</span>
            </div>
        </label>
    `).join('');
}

function toggleAcessorio(id) {
    if (acessoriosSelecionados.includes(id)) {
        acessoriosSelecionados = acessoriosSelecionados.filter(a => a !== id);
    } else {
        acessoriosSelecionados.push(id);
    }
    calcularDesconto();
}

function calcularDesconto() {
    const qtd = acessoriosSelecionados.length;
    let descontoPercent = qtd >= 3 ? 0.10 : qtd === 2 ? 0.08 : qtd === 1 ? 0.05 : 0;

    const valorAcessorios = acessoriosSelecionados.reduce((total, id) => {
        const acc = acessorios.find(a => a.id === id);
        return total + (acc ? acc.preco : 0);
    }, 0);

    const descontoValor = valorAcessorios * descontoPercent;
    const total = produtoAtual.preco + valorAcessorios - descontoValor;

    document.getElementById('discount-text').innerHTML = 
        `🔥 Você economiza <strong>R$ ${descontoValor.toFixed(2).replace('.', ',')}</strong> (${(descontoPercent*100).toFixed(0)}%)`;

    document.getElementById('total-final').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}

function enviarWhatsApp() {
    if (!produtoAtual) return;

    const acessoriosStr = acessoriosSelecionados.map(id => {
        const acc = acessorios.find(a => a.id === id);
        return acc ? acc.nome : '';
    }).filter(Boolean).join(', ');

    const mensagem = `*Quero este look!*\n\n` +
        `Fantasia: ${produtoAtual.nome}\n` +
        `Acessórios: ${acessoriosStr || 'Nenhum'}\n` +
        `Total: ${document.getElementById('total-final').textContent}\n\n` +
        `Vou alugar pela Crazy Fantasy! 🔥`;

    window.open(`https://wa.me/5519992850208?text=${encodeURIComponent(mensagem)}`, '_blank');
}

// ==================== FILTROS ====================
function setupEventListeners() {
    document.getElementById('limpar').addEventListener('click', () => {
        document.querySelectorAll('select').forEach(s => s.value = '');
        document.getElementById('search').value = '';
        document.querySelectorAll('.vibe-btn').forEach(b => b.classList.remove('active'));
    });

    // Busca em tempo real
    document.getElementById('search').addEventListener('input', filtrarProdutos);
}

function filtrarPorVibe(vibe) {
    console.log('Filtrando por vibe:', vibe);
    // Pode expandir para filtrar produtos
}

function filtrarProdutos() {
    console.log('Busca:', document.getElementById('search').value);
}

// ==================== CATEGORIAS ====================
function filtrarCategoria(categoria) {
    alert(`Filtrando por: ${categoria} (em breve)`);
}
