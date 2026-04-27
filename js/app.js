let todasFantasias = [];
let acessorios = [];

async function init() {
    const resF = await fetch('data/fantasias.json');
    todasFantasias = await resF.json();
    
    const resA = await fetch('data/acessorios.json');
    acessorios = await resA.json();

    renderCards(todasFantasias.filter(f => f.destaque), 'destaquesContainer');
    setupEventListeners();
}

function renderCards(lista, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = lista.map(item => `
        <div class="card-fantasia" onclick="openModal(${item.id})">
            <div class="thumb" style="background-image: url('assets/images/products/${item.imagem}')"></div>
            <div class="info">
                <h3>${item.nome}</h3>
                <p class="preco">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                <button class="btn-look">VER LOOK</button>
            </div>
        </div>
    `).join('');
}

// Lógica de Desconto Progressivo no Modal
function calcularTotal(precoBase, qtdAcessorios) {
    let desconto = 0;
    if (qtdAcessorios === 1) desconto = 0.05;
    else if (qtdAcessorios === 2) desconto = 0.08;
    else if (qtdAcessorios >= 3) desconto = 0.10;

    const subtotal = precoBase + (/* soma preços acessorios selecionados */ 0);
    const valorDesconto = subtotal * desconto;
    return { total: subtotal - valorDesconto, economizado: valorDesconto, pct: desconto * 100 };
}

function enviarWhatsApp(nomeFantasia, acessoriosNomes, total) {
    const fone = "5519992850208";
    const msg = encodeURIComponent(`Olá! Quero alugar a fantasia: ${nomeFantasia}.\nAcessórios: ${acessoriosNomes.join(', ')}.\nTotal: R$ ${total}`);
    window.open(`https://wa.me/${fone}?text=${msg}`);
}

// Inicialização
document.addEventListener('DOMContentLoaded', init);
