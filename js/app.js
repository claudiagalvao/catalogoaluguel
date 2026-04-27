let dbFantasias = [];
let dbAcessorios = [];
let filtrosAtivos = { vibe: '', busca: '', categoria: '' };

async function carregarDados() {
    try {
        const [resF, resA] = await Promise.all([
            fetch('data/fantasias.json'),
            fetch('data/acessorios.json')
        ]);
        dbFantasias = await resF.json();
        dbAcessorios = await resA.json();
        
        renderizarProdutos(dbFantasias.filter(f => f.destaque));
        configurarFiltros();
    } catch (err) {
        console.error("Erro ao carregar banco de dados:", err);
    }
}

function renderizarProdutos(lista) {
    const container = document.getElementById('destaquesContainer');
    if (!container) return;
    
    container.innerHTML = lista.map(item => `
        <div class="card-fantasia" onclick="abrirDetalhes(${item.id})">
            <div class="thumb" style="background-image: url('assets/images/products/${item.imagem}')"></div>
            <div style="padding: 15px;">
                <h3 style="font-size: 1.1rem; margin-bottom: 5px;">${item.nome}</h3>
                <p style="color: var(--neon-pink); font-weight: bold;">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                <p style="font-size: 0.8rem; color: #888;">3x de R$ ${(item.preco/3).toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

function configurarFiltros() {
    // Busca Instantânea
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        filtrosAtivos.busca = e.target.value.toLowerCase();
        aplicarFiltros();
    });

    // Filtro por Vibe
    document.querySelectorAll('.vibe-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.vibe-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtrosAtivos.vibe = btn.dataset.vibe;
            aplicarFiltros();
        });
    });
}

function aplicarFiltros() {
    let filtrados = dbFantasias;

    if (filtrosAtivos.vibe) {
        filtrados = filtrados.filter(f => f.vibe === filtrosAtivos.vibe);
    }
    if (filtrosAtivos.busca) {
        filtrados = filtrados.filter(f => 
            f.nome.toLowerCase().includes(filtrosAtivos.busca) || 
            f.tags.some(t => t.includes(filtrosAtivos.busca))
        );
    }

    renderizarProdutos(filtrados);
}

// Lógica do Modal e WhatsApp
function abrirDetalhes(id) {
    const p = dbFantasias.find(f => f.id === id);
    const modal = document.getElementById('productModal');
    const modalBody = modal.querySelector('.modal-body');

    modalBody.innerHTML = `
        <div style="display: flex; gap: 30px; flex-wrap: wrap;">
            <img src="assets/images/products/${p.imagem}" style="width: 300px; border-radius: 10px;">
            <div style="flex: 1;">
                <h2>${p.nome}</h2>
                <p style="margin: 15px 0;">${p.descricao}</p>
                <p style="font-size: 1.5rem; color: var(--neon-pink);">R$ ${p.preco.toFixed(2)}</p>
                
                <div style="margin-top: 20px;">
                    <h4>🔥 COMPLETE SEU LOOK (Desconto Progressivo!)</h4>
                    <div id="listaAcessorios" style="margin-top: 10px;">
                        ${dbAcessorios.map(a => `
                            <label style="display: block; margin-bottom: 10px; cursor:pointer;">
                                <input type="checkbox" class="acc-check" data-id="${a.id}" data-preco="${a.preco}" data-nome="${a.nome}"> 
                                ${a.nome} (+ R$ ${a.preco.toFixed(2)})
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div id="areaTotal" style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 10px;">
                    <p>Total: <span id="valorTotal">R$ ${p.preco.toFixed(2)}</span></p>
                    <small id="textoEconomia" style="color: var(--neon-blue);"></small>
                </div>

                <button onclick="gerarLinkZap('${p.nome}', ${p.preco})" class="vibe-btn" style="width: 100%; margin-top: 20px; text-align: center; background: #25d366; border: none;">
                    QUERO ESSE LOOK ➔
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = "block";
    
    // Adicionar listener nos checkboxes de acessórios
    modalBody.querySelectorAll('.acc-check').forEach(c => {
        c.addEventListener('change', () => atualizarPrecoModal(p.preco));
    });
}

function atualizarPrecoModal(precoBase) {
    const checks = document.querySelectorAll('.acc-check:checked');
    const itens = Array.from(checks).map(c => ({ preco: parseFloat(c.dataset.preco) }));
    
    let desconto = 0;
    if (itens.length === 1) desconto = 0.05;
    else if (itens.length === 2) desconto = 0.08;
    else if (itens.length >= 3) desconto = 0.10;

    const subtotal = precoBase + itens.reduce((a, b) => a + b.preco, 0);
    const economizado = subtotal * desconto;
    const total = subtotal - economizado;

    document.getElementById('valorTotal').innerText = `R$ ${total.toFixed(2)}`;
    document.getElementById('textoEconomia').innerText = economizado > 0 ? `Você economiza R$ ${economizado.toFixed(2)} (${desconto*100}%)` : '';
}

function gerarLinkZap(nome, precoBase) {
    const checks = document.querySelectorAll('.acc-check:checked');
    const accs = Array.from(checks).map(c => c.dataset.nome);
    const total = document.getElementById('valorTotal').innerText;
    
    const msg = `Olá Crazy Fantasy!%0AQuero alugar o look *${nome}*.%0A%0A*Acessórios:*%0A${accs.join('%0A') || 'Nenhum'}%0A%0A*Total:* ${total}`;
    window.open(`https://wa.me/5519992850208?text=${msg}`, '_blank');
}

document.addEventListener('DOMContentLoaded', carregarDados);
