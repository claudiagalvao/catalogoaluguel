
document.addEventListener('DOMContentLoaded', () => {
    // 1. SELEÇÃO DE VIBES (FILTRO VISUAL)
    const vibeCards = document.querySelectorAll('.vibe-card');
    const productCards = document.querySelectorAll('.card');

    vibeCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove destaque de todos e adiciona no clicado
            vibeCards.forEach(c => c.style.transform = 'scale(1)');
            card.style.transform = 'scale(1.05)';
            
            // Simulação de filtro (Ex: se clicar em Impactar, brilha a borda dos produtos)
            const vibeType = card.classList[1]; // pink, yellow, blue, etc.
            console.log(`Filtrando produtos pela vibe: ${vibeType}`);
            
            // Pequeno feedback visual nos produtos
            productCards.forEach(p => {
                p.style.opacity = '0.5';
                setTimeout(() => p.style.opacity = '1', 300);
            });
        });
    });

    // 2. BUSCA DINÂMICA
    const searchInput = document.querySelector('.search-box input');
    
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        
        productCards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            if (title.includes(term)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // 3. BOTÃO "ME AJUDA A DECIDIR"
    const helpBtn = document.querySelector('.help-cta button');
    
    helpBtn.addEventListener('click', () => {
        const sugestoes = ['Arlequina', 'Coringa', 'Mulher Gato', 'Policial', 'Pirata'];
        const sorteio = sugestoes[Math.floor(Math.random() * sugestoes.length)];
        
        alert(`Que tal arrasar de ${sorteio} hoje? 🔥`);
    });

    // 4. EFEITO DE SCROLL NO HEADER
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(0, 0, 0, 0.95)';
            header.style.padding = '10px 5%';
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.9)';
            header.style.padding = '20px 5%';
        }
    });
});
