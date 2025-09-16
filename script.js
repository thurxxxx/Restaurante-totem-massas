/* script.js - Totem funcional La Tavola di Napoli
   Funcionalidades:
   - Renderiza o cardápio (5 lanches, 3 acompanh., 3 bebidas, 3 sobremesas, 3 combos)
   - Carrinho com quantidade, remover, limpar
   - Persistência no localStorage
   - Sugestão de combo (upsell)
   - Formas de pagamento simuladas (cartão, dinheiro, PIX)
   - Geração de nota/comanda imprimível e download .txt
   - Animações e feedback tipo totem
*/

document.addEventListener('DOMContentLoaded', () => {
    // ---------- Dados do cardápio ----------
    const menu = {
      massas: [
        { id: 1, name: "Spaghetti Carbonara", price: 38.00, img: "https://cdn.pixabay.com/photo/2019/10/13/18/25/carbonara-4547230_1280.jpg" },
        { id: 2, name: "Lasagna alla Bolognese", price: 42.00, img: "https://cdn.pixabay.com/photo/2016/12/11/22/41/lasagna-1900529_1280.jpg" },
        { id: 3, name: "Fettuccine al Pesto", price: 37.00, img: "https://cdn.pixabay.com/photo/2015/04/08/13/13/food-712665_1280.jpg" },
        { id: 4, name: "Ravioli di Ricotta", price: 40.00, img: "https://cdn.pixabay.com/photo/2018/07/18/19/12/ravioli-3547432_1280.jpg" },
        { id: 5, name: "Penne all'Arrabbiata", price: 35.00, img: "https://cdn.pixabay.com/photo/2020/03/17/19/33/penne-4941394_1280.jpg" }
      ],
      acompanhamentos: [
        { id: 6, name: "Bruschetta al Pomodoro", price: 22.00, img: "https://cdn.pixabay.com/photo/2018/04/20/14/23/bruschetta-3336423_1280.jpg" },
        { id: 7, name: "Focaccia com Alecrim", price: 18.00, img: "https://cdn.pixabay.com/photo/2019/08/21/11/17/focaccia-4420367_1280.jpg" },
        { id: 8, name: "Insalata Caprese", price: 25.00, img: "https://cdn.pixabay.com/photo/2016/08/17/10/21/salad-1600109_1280.jpg" }
      ],
      bebidas: [
        { id: 9, name: "Refrigerante Italiano", price: 9.00, img: "https://cdn.pixabay.com/photo/2017/01/20/00/30/fast-food-1999025_1280.jpg" },
        { id: 10, name: "Suco de Uva Integral", price: 10.00, img: "https://cdn.pixabay.com/photo/2016/11/18/17/20/orange-1833768_1280.jpg" },
        { id: 11, name: "Acqua Panna (500ml)", price: 8.00, img: "https://cdn.pixabay.com/photo/2016/05/16/22/16/water-1395397_1280.jpg" }
      ],
      sobremesas: [
        { id: 12, name: "Tiramisù", price: 20.00, img: "https://cdn.pixabay.com/photo/2016/02/19/11/53/tiramisu-1209542_1280.jpg" },
        { id: 13, name: "Panna Cotta", price: 18.00, img: "https://cdn.pixabay.com/photo/2017/02/08/13/28/pannacotta-2045108_1280.jpg" },
        { id: 14, name: "Cannoli Siciliano", price: 19.00, img: "https://cdn.pixabay.com/photo/2019/02/12/17/28/cannoli-3992881_1280.jpg" }
      ],
      combos: [
        { id: 15, name: "Combo Roma", price: 59.00, desc: "Carbonara + Bruschetta + Refri", includes: [1,6,9] },
        { id: 16, name: "Combo Bologna", price: 65.00, desc: "Lasagna + Focaccia + Suco", includes: [2,7,10] },
        { id: 17, name: "Combo Firenze", price: 60.00, desc: "Fettuccine + Salada + Água", includes: [3,8,11] }
      ]
    };
  
    // ---------- Estado ----------
    let cart = JSON.parse(localStorage.getItem('lt_cart') || '[]');
    let loyalty = parseFloat(localStorage.getItem('lt_loyalty') || '0'); // acumula gasto para fidelidade
  
    // ---------- Elementos ----------
    const menuArea = document.getElementById('menu-area');
    const tabs = document.querySelectorAll('.tab-btn');
    const cartItemsEl = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const grandTotalEl = document.getElementById('grand-total');
    const topItems = document.getElementById('top-items');
    const topTotal = document.getElementById('top-total');
    const paymentMethod = document.getElementById('payment-method');
    const paymentExtra = document.getElementById('payment-extra');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const openCartBtn = document.getElementById('open-cart-btn');
    const cartPanel = document.getElementById('cart-panel');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('modal');
    const estimatedTime = document.getElementById('estimated-time');
  
    // ---------- Utils ----------
    const currency = v => `R$ ${v.toFixed(2).replace('.',',')}`;
    function findItem(id){
      for(const cat in menu){
        const found = menu[cat].find(x => x.id === id);
        if(found) return found;
      }
      return null;
    }
    function saveCart(){
      localStorage.setItem('lt_cart', JSON.stringify(cart));
    }
    function saveLoyalty(){ localStorage.setItem('lt_loyalty', loyalty.toFixed(2)); }
  
    // ---------- Render cardápio ----------
    function renderCategory(key){
      menuArea.innerHTML = '';
      const items = menu[key];
      items.forEach(it => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.innerHTML = `
          <img class="product-img" src="${it.img}" alt="${it.name}">
          <h3 class="product-title">${it.name}</h3>
          <p class="product-desc">${it.desc || ''}</p>
          <div class="product-row">
            <div class="price">${currency(it.price)}</div>
            <button class="add-btn" data-id="${it.id}">Adicionar</button>
          </div>
        `;
        menuArea.appendChild(card);
      });
    }
  
    // inicial render: massas
    renderCategory('massas');
  
    // tabs behavior
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        if(menu[tab]) renderCategory(tab);
      });
    });
  
    // ---------- Carrinho ----------
    function addToCartById(id){
      const product = findItem(id);
      if(!product) return;
      const existing = cart.find(i => i.id === id);
      if(existing) existing.qty += 1;
      else cart.push({ ...product, qty: 1 });
      saveCart();
      renderCart();
      suggestComboIfNeeded();
      highlightTopSummary();
      playAddSound();
    }
  
    function removeFromCart(index){
      if(index < 0 || index >= cart.length) return;
      cart.splice(index,1);
      saveCart();
      renderCart();
      highlightTopSummary();
    }
  
    function changeQty(index, delta){
      if(!cart[index]) return;
      cart[index].qty += delta;
      if(cart[index].qty <= 0) cart.splice(index,1);
      saveCart();
      renderCart();
      highlightTopSummary();
    }
  
    function computeTotals(){
      const subtotal = cart.reduce((s,i)=> s + (i.price * i.qty),0);
      const tax = +(subtotal * 0.10); // 10% tax simulated
      const total = subtotal + tax;
      return { subtotal, tax, total };
    }
  
    function renderCart(){
      cartItemsEl.innerHTML = '';
      cart.forEach((it, idx) => {
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
          <div class="meta">
            <div>
              <strong>${it.name}</strong><div style="font-size:0.9rem;color:#666">${currency(it.price)} • x${it.qty}</div>
            </div>
          </div>
          <div class="controls">
            <div class="qty-controls">
              <button class="qty-btn" data-action="dec" data-index="${idx}">−</button>
              <button class="qty-btn" data-action="inc" data-index="${idx}">+</button>
            </div>
            <button class="remove-btn" data-action="remove" data-index="${idx}">Remover</button>
          </div>
        `;
        cartItemsEl.appendChild(li);
      });
  
      const { subtotal, tax, total } = computeTotals();
      subtotalEl.textContent = currency(subtotal);
      taxEl.textContent = currency(tax);
      grandTotalEl.textContent = currency(total);
      topItems.textContent = `${cart.reduce((s,i)=> s + i.qty,0)} itens`;
      topTotal.textContent = currency(total);
  
      // update estimated time (diferencial: calcula baseado em itens)
      const baseTime = 8; // base 8 min
      const perItem = 3; // +3 min por item
      const est = baseTime + cart.reduce((s,i) => s + (perItem * i.qty),0);
      estimatedTime.textContent = `Tempo estimado: ${est} min`;
    }
  
    // ---------- Sugestão de combo (upsell) ----------
    function suggestComboIfNeeded(){
      // if user has at least 2 items and there is a combo missing 1 item, suggest it
      for(const combo of menu.combos){
        const have = combo.includes.filter(id => cart.some(c => c.id === id));
        const missing = combo.includes.filter(id => !cart.some(c => c.id === id));
        if(have.length >= 1 && missing.length === 1){
          // show unobtrusive suggestion in modal area
          showSuggestion(combo, missing[0]);
          break;
        }
      }
    }
  
    let suggestionTimeout = null;
    function showSuggestion(combo, missingId){
      // avoid multiple popups too frequent
      if(suggestionTimeout) return;
      suggestionTimeout = setTimeout(()=> suggestionTimeout = null, 60000); // 1min cooldown
  
      const missing = findItem(missingId);
      openModal(`
        <h2>✨ Sugestão</h2>
        <p>Complete seu pedido para transformar em <strong>${combo.name}</strong> por <strong>${currency(combo.price)}</strong>.</p>
        <p>Falta: <strong>${missing.name}</strong></p>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
          <button id="add-missing" class="primary-btn">Adicionar ${missing.name}</button>
          <button id="ignore-sug" class="ghost-btn">Agora não</button>
        </div>
      `, {closable:true});
  
      document.getElementById('add-missing').addEventListener('click', () => {
        addToCartById(missingId);
        closeModal();
      });
      document.getElementById('ignore-sug').addEventListener('click', () => closeModal());
    }
  
    // ---------- Pagamento UI ----------
    function renderPaymentExtra(){
      paymentExtra.innerHTML = '';
      const method = paymentMethod.value;
      if(method === 'card'){
        paymentExtra.innerHTML = `
          <input placeholder="Número do cartão (simulado)" id="card-number" style="padding:8px;border-radius:8px;border:1px solid #ddd;width:100%">
          <div style="display:flex;gap:8px;margin-top:8px">
            <input placeholder="MM/AA" id="card-exp" style="padding:8px;border-radius:8px;border:1px solid #ddd;flex:1">
            <input placeholder="CVV" id="card-cvv" style="padding:8px;border-radius:8px;border:1px solid #ddd;width:80px">
          </div>
        `;
      } else if(method === 'pix'){
        // show simulated pix code + button to copy
        const code = `PIX-LT-${Date.now().toString().slice(-6)}`;
        paymentExtra.innerHTML = `
          <div style="background:#f6f6f6;padding:8px;border-radius:8px">
            <div style="font-weight:700">PIX: ${code}</div>
            <div style="font-size:0.9rem;color:#666">Copie o código e conclua no app do seu banco (simulado)</div>
          </div>
          <button id="copy-pix" class="add-btn" style="margin-top:8px">Copiar Código PIX</button>
        `;
        setTimeout(()=> {
          const copyBtn = document.getElementById('copy-pix');
          copyBtn?.addEventListener('click', () => {
            navigator.clipboard?.writeText(code).then(()=> {
              flashMessage('Código PIX copiado!');
            }, ()=> flashMessage('Não foi possível copiar'));
          });
        }, 150);
      } else {
        paymentExtra.innerHTML = `<div style="color:#444;padding:8px;border-radius:6px;background:#fafafa">Pagamento em dinheiro — informe ao caixa.</div>`;
      }
    }
  
    paymentMethod.addEventListener('change', renderPaymentExtra);
    renderPaymentExtra();
  
    // ---------- Checkout: gerar nota, fidelidade ----------
    checkoutBtn.addEventListener('click', () => {
      if(cart.length === 0) { flashMessage('Carrinho vazio!'); return; }
      // validate payment (very simple simulation)
      const method = paymentMethod.value;
      if(method === 'card'){
        const num = document.getElementById('card-number')?.value || '';
        if(num.trim().length < 8){ flashMessage('Preencha dados do cartão (simulado)'); return; }
      }
      // compute totals
      const { subtotal, tax, total } = computeTotals();
  
      // fidelidade: atualizar acúmulo
      loyalty += subtotal;
      saveLoyalty();
  
      // criar pedido object
      const order = {
        id: `LT${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleString('pt-BR'),
        items: JSON.parse(JSON.stringify(cart)),
        subtotal, tax, total,
        paymentMethod: method
      };
  
      // show confirmation modal with options: imprimir nota, baixar .txt
      openModal(buildOrderHtml(order), {closable:false});
  
      // buttons actions
      document.getElementById('btn-print').addEventListener('click', () => {
        printOrder(order);
      });
      document.getElementById('btn-download').addEventListener('click', () => {
        downloadTxtOrder(order);
      });
      document.getElementById('btn-close-order').addEventListener('click', () => {
        closeModal();
      });
  
      // limpar carrinho
      cart = [];
      saveCart();
      renderCart();
      flashMessage('Pedido finalizado com sucesso! Buon appetito 🍝');
      playSuccessAnimation();
  
      // atualiza estimativa
      estimatedTime.textContent = `Tempo estimado: —`;
    });
  
    // ---------- Helpers: generar HTML da nota ----------
    function buildOrderHtml(order){
      const itemsHtml = order.items.map(i => `<tr><td>${i.qty}x</td><td>${i.name}</td><td style="text-align:right">${currency(i.price * i.qty)}</td></tr>`).join('');
      return `
        <h2>✅ Pedido Confirmado — ${order.id}</h2>
        <p><small>${order.date} • Pagamento: ${order.paymentMethod.toUpperCase()}</small></p>
        <div style="max-height:320px;overflow:auto">
          <table style="width:100%;border-collapse:collapse">
            ${itemsHtml}
          </table>
        </div>
        <hr>
        <div style="display:flex;justify-content:space-between;font-weight:800">
          <div>Subtotal</div><div>${currency(order.subtotal)}</div>
        </div>
        <div style="display:flex;justify-content:space-between">
          <div>Taxa (10%)</div><div>${currency(order.tax)}</div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:1.2rem">
          <div>Total</div><div>${currency(order.total)}</div>
        </div>
  
        <div style="display:flex;gap:8px;justify-content:center;margin-top:14px">
          <button id="btn-print" class="add-btn">Imprimir/Visualizar</button>
          <button id="btn-download" class="primary-btn">Baixar Nota (.txt)</button>
          <button id="btn-close-order" class="ghost-btn">Fechar</button>
        </div>
  
        <p style="margin-top:12px;font-size:0.92rem;color:#444">Acumulado fidelidade: ${currency(loyalty)} • A cada R$100 ganha 1 cupom</p>
      `;
    }
  
    // ---------- Impressão / Download ----------
    function printOrder(order){
      // abrir nova janela com formato amigável para impressão
      const html = `
        <html><head><title>Nota ${order.id}</title>
        <style>
          body{font-family:Arial,Helvetica,sans-serif;padding:18px;color:#222}
          h2{color:${getCssVar('--primary-color')}}
          table{width:100%;border-collapse:collapse;margin-top:10px}
          td{padding:6px;border-bottom:1px dashed #ddd}
          .total{font-weight:800;margin-top:12px}
        </style>
        </head>
        <body>
          <h2>La Tavola di Napoli — Nota / Comanda</h2>
          <div><small>${order.date}</small></div>
          <table>
            ${order.items.map(i => `<tr><td>${i.qty} x ${i.name}</td><td style="text-align:right">${currency(i.price * i.qty)}</td></tr>`).join('')}
          </table>
          <div class="total">
            <div style="display:flex;justify-content:space-between"><span>Subtotal</span><span>${currency(order.subtotal)}</span></div>
            <div style="display:flex;justify-content:space-between"><span>Taxa (10%)</span><span>${currency(order.tax)}</span></div>
            <div style="display:flex;justify-content:space-between;margin-top:8px"><strong>Total</strong><strong>${currency(order.total)}</strong></div>
          </div>
          <p style="margin-top:16px">Obrigado! Buon appetito!</p>
        </body></html>
      `;
      const w = window.open('', '_blank', 'noopener');
      w.document.write(html);
      w.document.close();
      w.focus();
    }
  
    function downloadTxtOrder(order){
      const lines = [];
      lines.push('LA TAVOLA DI NAPOLI - NOTA');
      lines.push('Pedido: ' + order.id);
      lines.push('Data: ' + order.date);
      lines.push('');
      order.items.forEach(i => lines.push(`${i.qty} x ${i.name} - ${currency(i.price * i.qty)}`));
      lines.push('');
      lines.push('Subtotal: ' + currency(order.subtotal));
      lines.push('Taxa: ' + currency(order.tax));
      lines.push('Total: ' + currency(order.total));
      lines.push('');
      lines.push('Obrigado! Buon appetito!');
      const blob = new Blob([lines.join('\n')], {type:'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `nota_${order.id}.txt`; a.click();
      URL.revokeObjectURL(url);
    }
  
    // ---------- Modal / overlay ----------
    function openModal(htmlContent, opts = {closable:true}){
      overlay.classList.remove('hidden');
      overlay.setAttribute('aria-hidden','false');
      modal.innerHTML = `<div style="padding:8px">${htmlContent}</div>`;
      if(opts.closable){
        modal.insertAdjacentHTML('beforeend', `<div style="text-align:center;margin-top:10px"><button id="close-modal" class="ghost-btn">Fechar</button></div>`);
        document.getElementById('close-modal').addEventListener('click', closeModal);
      }
    }
    function closeModal(){
      overlay.classList.add('hidden');
      overlay.setAttribute('aria-hidden','true');
      modal.innerHTML = '';
    }
    // allow dismiss by clicking overlay
    overlay.addEventListener('click', (e) => { if(e.target === overlay) closeModal(); });
  
    // ---------- Small helpers ----------
    function flashMessage(txt){
      // pequeno toast
      const t = document.createElement('div');
      t.style.position = 'fixed';
      t.style.right = '18px';
      t.style.bottom = '18px';
      t.style.padding = '12px 16px';
      t.style.background = '#222';
      t.style.color = '#fff';
      t.style.borderRadius = '10px';
      t.style.zIndex = 99999;
      t.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
      t.textContent = txt;
      document.body.appendChild(t);
      setTimeout(()=> t.style.opacity = '0',2200);
      setTimeout(()=> t.remove(),2600);
    }
  
    function highlightTopSummary(){
      const el = document.getElementById('top-summary');
      el.style.transform = 'scale(1.06)';
      setTimeout(()=> el.style.transform = 'scale(1)',350);
    }
  
    function playAddSound(){
      // small UX sound using WebAudio (soft click) — silent if not available
      try{
        const ctx = new (window.AudioContext||window.webkitAudioContext)();
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = 880;
        g.gain.value = 0.02;
        o.connect(g); g.connect(ctx.destination);
        o.start(); setTimeout(()=> { o.stop(); ctx.close(); }, 80);
      }catch(e){}
    }
  
    function playSuccessAnimation(){
      // small check animation in modal (if open) — or flash border
      const el = document.querySelector('.kiosk');
      el.style.boxShadow = '0 0 0 6px rgba(212,175,55,0.12)';
      setTimeout(()=> el.style.boxShadow = varClear(),900);
      function varClear(){ return '0 10px 30px rgba(0,0,0,0.08)'; }
    }
  
    // ---------- Events global ----------
    // add product buttons
    document.body.addEventListener('click', (e) => {
      if(e.target.matches('.add-btn')){
        const id = parseInt(e.target.dataset.id,10);
        addToCartById(id);
      }
      if(e.target.matches('.qty-btn')){
        const idx = parseInt(e.target.dataset.index,10);
        const action = e.target.dataset.action;
        if(action === 'inc') changeQty(idx, +1);
        else changeQty(idx, -1);
      }
      if(e.target.matches('.remove-btn')){
        const idx = parseInt(e.target.dataset.index,10);
        removeFromCart(idx);
      }
    });
  
    // cart open/close
    openCartBtn.addEventListener('click', () => {
      cartPanel.scrollIntoView({behavior:'smooth', block:'center'});
    });
    closeCartBtn.addEventListener('click', () => {
      // nothing special - user can scroll away
    });
  
    clearCartBtn.addEventListener('click', () => {
      if(confirm('Limpar todo o pedido?')){
        cart = []; saveCart(); renderCart(); flashMessage('Carrinho limpo');
      }
    });
  
    // ---------- Utility functions ----------
    function getCssVar(name){
      return getComputedStyle(document.documentElement).getPropertyValue(name) || '#000';
    }
  
    // ---------- Local start ----------
    renderCart();
  
    // Bind dynamic events
    renderPaymentExtra();
  
    // Show first suggestion opportunity if cart persisted
    if(cart.length) setTimeout(()=> suggestComboIfNeeded(),600);
  });