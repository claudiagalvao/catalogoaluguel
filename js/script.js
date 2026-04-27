let fantasias = [];
let acessorios = [];
let filtroAtual = { search: '', tamanho: '', genero: '', preco: '', vibe: null };
let produtoAtual = null;
let acessoriosSelecionados = [];

document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    renderVibes();
    renderizarProdutos();
    setupFiltros();
});

async function carregarDados() {
    try {
        const [fData, aData] = await Promise.all([
            fetch('data/fantasias.json').then(r => r.json()),
            fetch('data/acessorios.json').then(r => r.json())
        ]);
        fantasias = fData;
        acessorios = aData;
    } catch (e) { console.error(e); }
}

// VIBES
function renderVibes() {
    const container = document.getElementById('vibes-grid');
    const vibes = [
        {id:'impactar', emoji:'💀', text:'IMPACTAR', color:'#ff00aa'},
        {id:'divertir', emoji:'😀', text:'DIVERTIR', color:'#ffd700'},
        {id:'brilhar',  emoji:'⚡', text:'BRILHAR',  color:'#00ffff'},
        {id:'luxo',     emoji:'👑', text:'LUXO',     color:'#9b00ff'}
    ];

    container.innerHTML = vibes.map(v => `
        <button class="vibe-btn" style="border-color:${v.color}" data-vibe="${v.id}">
            ${v.emoji} ${v.text}
        </button>
    `).join('');

    container.querySelectorAll('.vibe-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.vibe-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtroAtual.vibe = btn.dataset.vibe;
            renderizarProdutos();
        });
    });
}

// FILTROS
function setupFiltros() {
    document.getElementById('search-input').addEventListener('input', () => {
        filtroAtual.search = document.getElementById('search-input').value.toLowerCase().trim();
        renderizarProdutos();
    });

    ['filter-tamanho', 'filter-genero', 'filter-preco'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            filtroAtual.tamanho = document.getElementById('filter-tamanho').value;
            filtroAtual.genero = document.getElementById('filter-genero').value;
            filtroAtual.preco = document.getElementById('filter-preco').value;
            renderizarProdutos();
        });
    });

    document.getElementById('btn-limpar').addEventListener('click', limparFiltros);
}

function limparFiltros() {
    filtroAtual = { search: '', tamanho: '', genero: '', preco: '', vibe: null };
    document.getElementById('search-input').value = '';
    document.querySelectorAll('select').forEach(s => s.value = '');
    document.querySelectorAll('.vibe-btn').forEach(b => b.classList.remove('active'));
    renderizarProdutos();
}

// RENDER PRODUTOS
function renderizarProdutos() {
    const track = document.getElementById('carousel-track');
    let filtrados = fantasias;

    if (filtroAtual.search) {
        filtrados = filtrados.filter(f => f.nome.toLowerCase().includes(filtroAtual.search));
    }
    if (filtroAtual.tamanho) {
        filtrados = filtrados.filter(f => f.tamanhos.includes(filtroAtual.tamanho));
    }
    if (filtroAtual.genero) {
        filtrados = filtrados.filter(f => f.genero === filtroAtual.genero);
    }
    if (filtroAtual.preco) {
        const max = parseInt(filtroAtual.preco);
        filtrados = filtrados.filter(f => f.preco <= max);
    }

    track.innerHTML = filtrados.map(f => `
        <div class="product-card" onclick="abrirModal('${f.id}')">
            <img src="${f.imagem}" alt="${f.nome}">
            <div class="product-info">
                <h3>${f.nome}</h3>
                <p class="price">R$ ${f.preco.toFixed(2).replace('.', ',')}</p>
            </div>
        </div>
    `).join('');
}

// MODAL + UPSELL + DESCONTO
function abrirModal(id) {
    produtoAtual = fantasias.find(f => f.id === id);
    if (!produtoAtual) return;

    acessoriosSelecionados = [];

    document.getElementById('modal-image').innerHTML = `<img src="${produtoAtual.imagem}" style="width:100%;border-radius:12px;">`;
    document.getElementById('modal-nome').textContent = produtoAtual.nome;
    document.getElementById('modal-preco').innerHTML = `R$ <strong>${produtoAtual.preco.toFixed(2).replace('.', ',')}</strong>`;
    document.getElementById('modal-descricao').textContent = produtoAtual.descricao || "Fantasia premium de alta qualidade.";

    renderUpsell();
    document.getElementById('modal').style.display = 'flex';
}

function renderUpsell() {
    const container = document.getElementById('upsell-list');
    container.innerHTML = acessorios.map(acc => `
        <label class="upsell-item">
            <input type="checkbox" onchange="toggleAcessorio('${acc.id}')">
            <img src="${acc.imagem}" alt="${acc.nome}">
            <div><strong>${acc.nome}</strong><br>R$ ${acc.preco.toFixed(2).replace('.', ',')}</div>
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
    let desconto = qtd >= 3 ? 0.10 : qtd === 2 ? 0.08 : qtd === 1 ? 0.05 : 0;

    const valorAcc = acessoriosSelecionados.reduce((sum, id) => {
        const acc = acessorios.find(a => a.id === id);
        return sum + (acc ? acc.preco : 0);
    }, 0);

    const economia = valorAcc * desconto;
    const total = produtoAtual.preco + valorAcc - economia;

    document.getElementById('discount-text').innerHTML = `🔥 Você economiza <strong>R$ ${economia.toFixed(2).replace('.', ',')}</strong> (${(desconto*100).toFixed(0)}%)`;
    document.getElementById('total-final').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}

function enviarWhatsApp() {
    const acessoriosNomes = acessoriosSelecionados.map(id => {
        const acc = acessorios.find(a => a.id === id);
        return acc ? acc.nome : '';
    }).filter(Boolean).join(', ');

    const msg = `*Quero este look!*\nFantasia: ${produtoAtual.nome}\nAcessórios: ${acessoriosNomes || 'Nenhum'}\nTotal: ${document.getElementById('total-final').textContent}\n\nCrazy Fantasy 🔥`;
    
    window.open(`https://wa.me/5519992850208?text=${encodeURIComponent(msg)}`, '_blank');
}
