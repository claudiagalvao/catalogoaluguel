let db = [];
let accDb = [];
let selecionados = [];
let fantasiaAtual = null;

async function carregarDados() {
    try {
        const [resF, resA] = await Promise.all([
            fetch('data/fantasias.json'),
            fetch('data/acessorios.json')
        ]);
        db = await resF.json();
        accDb = await resA.json();
        render(db.filter(f => f.destaque));
    } catch (err) { console.error("Erro ao carregar ficheiros:", err); }
}

function render(lista) {
    const v = document.getElementById('vitrine');
    if (!v) return;
    v.innerHTML = lista.map(f => `
        <div class="card" onclick="abrirModal('${f.id}')">
            <img src="${f.imagem}" alt="${f.nome}">
            <div class="card-info">
                <h4>${f.nome}</h4>
                <p>R$ ${f.preco.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

function abrirModal(id) {
    fantasiaAtual = db.find(f => f.id === id);
    selecionados = [];
    
    // Verifica se existem acessórios vinculados
    const extras = accDb.filter(a => fantasiaAtual.upsell && fantasiaAtual.upsell.includes(a.id));
    
    if (extras.length === 0) {
        enviarWhats(); // Se não há acessórios, vai direto pro Whats
        return;
    }

    const container = document.getElementById('upsell-items');
    container.innerHTML = extras.map(a => `
        <div class="acc-card" onclick="toggleAcc(this, '${a.id}')">
            <img src="${a.imagem}" style="width:80px; border-radius:5px">
            <p>${a.nome}<br><span>+ R$ ${a.preco.toFixed(2)}</span></p>
        </div>
    `).join('');
    
    document.getElementById('modal').style.display = 'block';
    atualizarDescontoLabel(0);
}

function toggleAcc(el, id) {
    el.classList.toggle('selected');
    const idx = selecionados.indexOf(id);
    idx > -1 ? selecionados.splice(idx, 1) : selecionados.push(id);
    
    const desc = selecionados.length === 1 ? 5 : selecionados.length === 2 ? 8 : selecionados.length >= 3 ? 10 : 0;
    atualizarDescontoLabel(desc);
}

function atualizarDescontoLabel(valor) {
    const label = document.getElementById('label-desconto');
    if (label) label.innerText = valor + "%";
}

function enviarWhats() {
    const desc = selecionados.length === 1 ? 5 : selecionados.length === 2 ? 8 : selecionados.length >= 3 ? 10 : 0;
    const num = "5511999999999"; // Substitua pelo seu número
    let msg = `*RESERVA CRAZY FANTASY*\n\n`;
    msg += `*Fantasia:* ${fantasiaAtual.nome}\n`;
    if (selecionados.length > 0) {
        msg += `*Combos/Acessórios:* ${selecionados.join(', ')}\n`;
        msg += `*Desconto Aplicado:* ${desc}%\n`;
    }
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`);
}

// Filtros de busca e categorias
function filtrarTag(tag) { render(db.filter(f => f.tags.includes(tag))); }
function filtrarEstilo(estilo) { render(db.filter(f => f.estilo === estilo)); }
function limparFiltros() { render(db.filter(f => f.destaque)); }

document.getElementById('search').oninput = (e) => {
    const val = e.target.value.toLowerCase();
    render(db.filter(f => f.nome.toLowerCase().includes(val) || f.tags.some(t => t.toLowerCase().includes(val))));
};

function sideScroll(dir) { document.getElementById('vitrine').scrollLeft += dir * 280; }
function fecharModal() { document.getElementById('modal').style.display = 'none'; }

carregarDados();
