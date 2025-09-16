document.addEventListener('DOMContentLoaded', () => {
    // --- CARDÁPIO DEMO RESTAURANTE ITALIANO ---
    const demoMenu = {
        lanches: [ // Massas
            { id: 1, name: "Spaghetti Carbonara", price: 38.00, img: "https://cdn.pixabay.com/photo/2019/10/13/18/25/carbonara-4547230_1280.jpg" },
            { id: 2, name: "Lasagna alla Bolognese", price: 42.00, img: "https://cdn.pixabay.com/photo/2016/12/11/22/41/lasagna-1900529_1280.jpg" },
            { id: 3, name: "Fettuccine al Pesto", price: 37.00, img: "https://cdn.pixabay.com/photo/2015/04/08/13/13/food-712665_1280.jpg" },
            { id: 4, name: "Ravioli di Ricotta", price: 40.00, img: "https://cdn.pixabay.com/photo/2018/07/18/19/12/ravioli-3547432_1280.jpg" },
            { id: 5, name: "Penne all'Arrabbiata", price: 35.00, img: "https://cdn.pixabay.com/photo/2020/03/17/19/33/penne-4941394_1280.jpg" },
        ],
        acompanhamentos: [ // Antipasti
            { id: 6, name: "Bruschetta al Pomodoro", price: 22.00, img: "https://cdn.pixabay.com/photo/2018/04/20/14/23/bruschetta-3336 bruschetta-3336423_1280.jpg" },
            { id: 7, name: "Focaccia com Alecrim", price: 18.00, img: "https://cdn.pixabay.com/photo/2019/08/21/11/17/focaccia-4420367_1280.jpg" },
            { id: 8, name: "Insalata Caprese", price: 25.00, img: "https://cdn.pixabay.com/photo/2016/08/17/10/21/salad-1600109_1280.jpg" },
        ],
        bebidas: [
            { id: 9, name: "Refrigerante Italiano", price: 9.00, img: "https://cdn.pixabay.com/photo/2017/01/20/00/30/fast-food-1999025_1280.jpg" },
            { id: 10, name: "Suco de Uva Integral", price: 10.00, img: "https://cdn.pixabay.com/photo/2016/11/18/17/20/orange-1833768_1280.jpg" },
            { id: 11, name: "Acqua Panna (500ml)", price: 8.00, img: "https://cdn.pixabay.com/photo/2016/05/16/22/16/water-1395397_1280.jpg" },
        ],
        sobremesas: [ // Dolci
            { id: 12, name: "Tiramisù", price: 20.00, img: "https://cdn.pixabay.com/photo/2016/02/19/11/53/tiramisu-1209542_1280.jpg" },
            { id: 13, name: "Panna Cotta", price: 18.00, img: "https://cdn.pixabay.com/photo/2017/02/08/13/28/pannacotta-2045108_1280.jpg" },
            { id: 14, name: "Cannoli Siciliano", price: 19.00, img: "https://cdn.pixabay.com/photo/2019/02/12/17/28/cannoli-3992881_1280.jpg" },
        ],
        combos: [
            { id: 15, name: "Combo Roma", price: 59.00, desc: "Spaghetti Carbonara + Bruschetta + Refri", img: "https://cdn.pixabay.com/photo/2019/10/13/18/25/carbonara-4547230_1280.jpg" },
            { id: 16, name: "Combo Bologna", price: 65.00, desc: "Lasagna alla Bolognese + Focaccia + Suco", img: "https://cdn.pixabay.com/photo/2016/12/11/22/41/lasagna-1900529_1280.jpg" },
            { id: 17, name: "Combo Firenze", price: 60.00, desc: "Fettuccine al Pesto + Insalata + Acqua", img: "https://cdn.pixabay.com/photo/2015/04/08/13/13/food-712665_1280.jpg" },
        ]
    };

    let demoCart = [];

    // --- RENDERIZAÇÃO DO CARDÁPIO DEMO ---
    function renderDemoMenu() {
        const sections = {
            lanches: document.getElementById('lanches-demo'),
            acompanhamentos: document.getElementById('acompanhamentos-demo'),
            bebidas: document.getElementById('bebidas-demo'),
            sobremesas: document.getElementById('sobremesas-demo'),
            combos: document.getElementById('combos-demo'),
        };
        for (const cat in sections) {
            const section = sections[cat];
            if (section) {
                section.innerHTML = '';
                demoMenu[cat].forEach(item => {
                    const itemHTML = `
                        <div class="menu-item" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
                            <img src="${item.img}" alt="${item.name}">
                            <h3>${item.name}</h3>
                            ${item.desc ? `<p class="desc">${item.desc}</p>` : ''}
                            <p class="price">R$ ${item.price.toFixed(2)}</p>
                            <button class="add-to-cart-btn">Adicionar</button>
                        </div>
                    `;
                    section.innerHTML += itemHTML;
                });
            }
        }
    }

    // --- CARRINHO DEMO ---
    function addToDemoCart(name, price) {
        demoCart.push({ name, price });
        updateDemoCart();
    }

    function updateDemoCart() {
        const cartEl = document.getElementById('cart-demo-items');
        const totalEl = document.getElementById('cart-demo-total');
        cartEl.innerHTML = '';
        let total = 0;
        demoCart.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.name}</span><strong>R$ ${item.price.toFixed(2)}</strong>`;
            cartEl.appendChild(li);
            total += item.price;
        });
        totalEl.textContent = `R$ ${total.toFixed(2)}`;
    }

    document.querySelector('.menu-demo').addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const itemEl = e.target.closest('.menu-item');
            const name = itemEl.dataset.name;
            const price = parseFloat(itemEl.dataset.price);
            addToDemoCart(name, price);
        }
    });

    document.getElementById('cart-demo-checkout-btn').addEventListener('click', () => {
        if (demoCart.length > 0) {
            alert("Pedido realizado com sucesso! (Simulação)\nSua comanda:\n" + demoCart.map(i => `${i.name} - R$ ${i.price.toFixed(2)}`).join('\n'));
            demoCart = [];
            updateDemoCart();
        } else {
            alert('Sua comanda está vazia!');
        }
    });

    // --- CONTATO ---
    const contatoForm = document.getElementById('contato-form');
    const contatoSucesso = document.getElementById('contato-sucesso');
    contatoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        contatoSucesso.textContent = "Obrigado! Em breve nossa equipe enviará uma proposta para o seu restaurante.";
        contatoForm.reset();
    });

    // --- INICIALIZAÇÃO ---
    renderDemoMenu();
    updateDemoCart();
});