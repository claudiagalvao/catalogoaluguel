let produtos = [], acessorios = [];
let filtros = { busca:"", tamanho:"", genero:"", preco:"", estilo:"" };

async function init(){
  produtos = await fetch("data/fantasias.json").then(r=>r.json());
  acessorios = await fetch("data/acessorios.json").then(r=>r.json());

  aplicarFiltros();
  renderMaisPedidas();
}

function aplicarFiltros(){
  let lista = produtos.filter(p=>{
    return (
      (!filtros.busca || p.nome.toLowerCase().includes(filtros.busca) || p.tags.some(t=>t.includes(filtros.busca))) &&
      (!filtros.tamanho || p.tamanho===filtros.tamanho) &&
      (!filtros.genero || p.genero===filtros.genero) &&
      (!filtros.preco || p.preco <= filtros.preco) &&
      (!filtros.estilo || p.categoria===filtros.estilo)
    );
  });

  renderGrid(lista);
}

function renderGrid(lista){
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  lista.forEach(p=>{
    grid.innerHTML += `
      <div class="card" onclick="abrirModal(${p.id})">
        <img src="${p.imagem}">
        <h4>${p.nome}</h4>
        <p>R$ ${p.preco}</p>
      </div>
    `;
  });
}

function renderMaisPedidas(){
  const track = document.getElementById("track");
  track.innerHTML = "";

  produtos.filter(p=>p.destaque).forEach(p=>{
    track.innerHTML += `
      <div class="card" onclick="abrirModal(${p.id})">
        <img src="${p.imagem}">
        <p>${p.nome}</p>
      </div>
    `;
  });
}

function abrirModal(id){
  const p = produtos.find(x=>x.id===id);
  const rel = acessorios.filter(a=>p.acessorios.includes(a.id));

  let total = p.preco;
  let selecionados = [];

  function calcular(){
    const soma = selecionados.reduce((acc,a)=>acc+a.preco,0);
    let desc = 0;
    if(selecionados.length>=3) desc=0.10;
    else if(selecionados.length==2) desc=0.08;
    else if(selecionados.length==1) desc=0.05;

    const final = (p.preco + soma)*(1-desc);

    return {final, desc};
  }

  const modal = document.getElementById("modal");

  modal.innerHTML = `
    <div class="modal-box">
      <h2>${p.nome}</h2>
      <p>R$ ${p.preco}</p>

      ${rel.length ? `
        <h3>🔥 Complete seu look e economize</h3>
        ${rel.map(a=>`
          <div class="acessorio">
            <input type="checkbox" value="${a.id}">
            <img src="${a.imagem}">
            ${a.nome} (R$${a.preco})
          </div>
        `).join("")}
        <p class="desconto" id="descInfo"></p>
      ` : ""}

      <button id="comprar">Comprar via WhatsApp</button>
      <button onclick="fechar()">Fechar</button>
    </div>
  `;

  modal.classList.remove("hidden");

  const checks = modal.querySelectorAll("input");

  function atualizar(){
    selecionados = [...checks].filter(c=>c.checked)
      .map(c=>acessorios.find(a=>a.id==c.value));

    const {final, desc} = calcular();

    document.getElementById("descInfo").innerText =
      desc ? `🔥 Você economiza ${desc*100}%` : "";

    document.getElementById("comprar").onclick = ()=>{
      let msg = `Pedido:\n${p.nome}\n`;
      selecionados.forEach(a=>msg+=`+ ${a.nome}\n`);
      msg += `Total: R$${final.toFixed(2)}`;

      window.open(`https://wa.me/5519999999999?text=${encodeURIComponent(msg)}`);
    };
  }

  checks.forEach(c=>c.onchange = atualizar);
}

function fechar(){
  document.getElementById("modal").classList.add("hidden");
}

function filtrarCategoria(cat){
  filtros.estilo = cat;
  aplicarFiltros();
}

// eventos
document.getElementById("search").oninput = e=>{
  filtros.busca = e.target.value.toLowerCase();
  aplicarFiltros();
};

document.getElementById("tamanho").onchange = e=>{
  filtros.tamanho = e.target.value;
  aplicarFiltros();
};

document.getElementById("genero").onchange = e=>{
  filtros.genero = e.target.value;
  aplicarFiltros();
};

document.getElementById("preco").onchange = e=>{
  filtros.preco = e.target.value;
  aplicarFiltros();
};

document.getElementById("estilo").onchange = e=>{
  filtros.estilo = e.target.value;
  aplicarFiltros();
};

document.getElementById("clear").onclick = ()=>{
  filtros = { busca:"", tamanho:"", genero:"", preco:"", estilo:"" };
  document.querySelectorAll("select").forEach(s=>s.value="");
  document.getElementById("search").value="";
  aplicarFiltros();
};

document.getElementById("next").onclick = ()=>track.scrollLeft+=300;
document.getElementById("prev").onclick = ()=>track.scrollLeft-=300;

init();
