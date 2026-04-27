let fantasias = [];
let filtroAtual = {
    search: '',
    tamanho: '',
    genero: '',
    preco: '',
    vibe: null
};

document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    renderVibes();
    renderizarProdutos(); // Renderiza inicialmente

    // Event listeners para filtros
    setupFiltros();
});

async function carregarDados() {
    try {
        const res = await fetch('data/fantasias.json');
        fantasias = await res.json();
    } catch (e) {
        console.error("Erro ao carregar fantasias:", e);
    }
}

// ==================== VIBES ====================
function renderVibes() {
    const container = document.getElementById('vibes-grid');
    const vibes = [
        {id: 'impactar', emoji: '💀', text: 'IMPACTAR', color: '#ff00aa'},
        {id: 'divertir', emoji: '😀', text: 'DIVERTIR', color: '#ffd700'},
        {id: 'brilhar',  emoji: '⚡', text: 'BRILHAR',  color: '#00ffff'},
        {id: 'luxo',     emoji: '👑', text: 'LUXO',     color: '#9b00ff'}
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

// ==================== FILTROS ====================
function setupFiltros() {
    const searchInput = document.getElementById('search-input');
    const btnLimpar = document.getElementById('btn-limpar');

    // Busca em tempo real
    searchInput.addEventListener('input', () => {
        filtroAtual.search = searchInput.value.toLowerCase().trim();
        renderizarProdutos();
    });

    // Demais filtros
    ['filter-tamanho', 'filter-genero', 'filter-preco'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                filtroAtual.tamanho = document.getElementById('filter-tamanho').value;
                filtroAtual.genero = document.getElementById('filter-genero').value;
                filtroAtual.preco = document.getElementById('filter-preco').value;
                renderizarProdutos();
            });
        }
    });

    btnLimpar.addEventListener('click', limparFiltros);
}

function limparFiltros() {
    filtroAtual = { search: '', tamanho: '', genero: '', preco: '', vibe: null };
    
    document.getElementById('search-input').value = '';
    document.getElementById('filter-tamanho').value = '';
    document.getElementById('filter-genero').value = '';
    document.getElementById('filter-preco').value = '';
    
    document.querySelectorAll('.vibe-btn').forEach(b => b.classList.remove('active'));
    
    renderizarProdutos();
}

// ==================== RENDER PRODUTOS ====================
function renderizarProdutos() {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    let filtrados = fantasias;

    // Filtro por busca
    if (filtroAtual.search) {
        filtrados = filtrados.filter(f => 
            f.nome.toLowerCase().includes(filtroAtual.search)
        );
    }

    // Filtro por tamanho
    if (filtroAtual.tamanho) {
        filtrados = filtrados.filter(f => 
            f.tamanhos && f.tamanhos.includes(filtroAtual.tamanho)
        );
    }

    // Filtro por gênero (simplificado)
    if (filtroAtual.genero) {
        filtrados = filtrados.filter(f => f.genero === filtroAtual.genero);
    }

    // Filtro por preço
    if (filtroAtual.preco) {
        const max = parseInt(filtroAtual.preco);
        filtrados = filtrados.filter(f => f.preco <= max);
    }

    // Filtro por vibe (se quiser implementar por categoriaSlug depois)

    track.innerHTML = filtrados.map(f => `
        <div class="product-card" onclick="abrirModal('${f.id}')">
            <img src="${f.imagem}" alt="${f.nome}">
            <div class="product-info">
                <h3>${f.nome}</h3>
                <p class="price">R$ ${f.preco.toFixed(2).replace('.', ',')}</p>
                <small>${f.tamanhos ? f.tamanhos.join(' • ') : ''}</small>
            </div>
        </div>
    `).join('');
}

// ==================== MODAL ====================
function abrirModal(id) {
    const fantasia = fantasias.find(f => f.id === id);
    if (!fantasia) return;

    alert(`Você selecionou: ${fantasia.nome}\n\nPreço: R$ ${fantasia.preco}\n\n(Modal completo em breve)`);
}

// Função auxiliar para categorias
function filtrarCategoria(categoria) {
    alert(`Filtrando por categoria: ${categoria} (em breve)`);
}
