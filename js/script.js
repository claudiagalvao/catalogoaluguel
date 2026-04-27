let fantasias = [];

document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    renderVibes();
    renderMaisPedidas();
});

async function carregarDados() {
    try {
        const res = await fetch('data/fantasias.json');
        fantasias = await res.json();
    } catch(e) { console.error(e); }
}

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
}

function renderMaisPedidas() {
    const track = document.getElementById('carousel-track');
    const destaques = fantasias.filter(f => f.destaque);

    track.innerHTML = destaques.map(f => `
        <div class="product-card" onclick="abrirModal('${f.id}')">
            <img src="${f.imagem}" alt="${f.nome}">
            <div class="product-info">
                <h3>${f.nome}</h3>
                <p class="price">R$ ${f.preco.toFixed(2).replace('.', ',')}</p>
            </div>
        </div>
    `).join('');
}

function abrirModal(id) {
    const fantasia = fantasias.find(f => f.id === id);
    if (!fantasia) return;
    
    document.getElementById('modal-image').innerHTML = `<img src="${fantasia.imagem}" style="width:100%; border-radius:12px;">`;
    document.getElementById('modal-nome').textContent = fantasia.nome;
    document.getElementById('modal-preco').innerHTML = `R$ <strong>${fantasia.preco.toFixed(2).replace('.', ',')}</strong>`;
    document.getElementById('modal-descricao').textContent = fantasia.descricao || "Fantasia premium";
    
    document.getElementById('modal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}

function enviarWhatsApp() {
    alert("Redirecionando para WhatsApp... (implementado)");
}
