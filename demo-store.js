/* ============================================================
   demo-store.js — camada de dados do MODO DEMONSTRAÇÃO
   ------------------------------------------------------------
   Substitui Firebase (Firestore + Auth), Cloudinary e EmailJS
   da versão de produção por um armazenamento local no navegador
   (localStorage), com dados fictícios gerados em relação à data
   de hoje. Nada sai do navegador do visitante.
   ============================================================ */
(function () {
  const KEY = 'calendario-cursos-demo-v1';
  const SESSION_KEY = 'calendario-cursos-demo-session';
  const DEMO_USER = { email: 'admin@demo.com', senha: 'demo1234' };

  // ---------- helpers de data ----------
  function toDS(dt) {
    return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
  }
  function addDays(dt, n) { const d = new Date(dt); d.setDate(d.getDate() + n); return d; }
  // próximo dia útil (seg a sex) a partir de base + n dias
  function nextWeekday(base, n, allowed) {
    let d = addDays(base, n);
    while (!allowed.includes(d.getDay())) d = addDays(d, 1);
    return d;
  }
  function uid() { return 'demo_' + Math.random().toString(36).slice(2, 10); }

  // ---------- fotos de exemplo (SVG inline, sem rede) ----------
  function fotoSVG(cor, texto) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="${cor}"/><text x="300" y="300" font-family="Georgia,serif" font-size="40" fill="#fff" text-anchor="middle" dominant-baseline="middle">${texto}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // ---------- dados fictícios ----------
  function seed() {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const SEG_SEX = [1, 2, 3, 4, 5];
    const TER_SAB = [2, 3, 4, 5, 6];
    const SEG_QUI = [1, 2, 3, 4];

    const d1 = nextWeekday(hoje, 22, SEG_SEX);
    const d2 = nextWeekday(hoje, 25, TER_SAB);
    const d3 = nextWeekday(hoje, 28, SEG_QUI);
    const d4 = nextWeekday(hoje, 30, SEG_SEX);
    const d5 = nextWeekday(hoje, 31, TER_SAB);
    const d6 = nextWeekday(hoje, 34, SEG_SEX);
    const d7 = nextWeekday(hoje, 36, SEG_SEX);
    const feriado = nextWeekday(hoje, 27, SEG_SEX);
    const manutencao = nextWeekday(hoje, 35, TER_SAB);

    const agendamentos = [
      { data: toDS(d1), data2: null, duracao: 'dia', horaInicio: '09:00', horaFim: '17:00',
        nome: 'Ana Ribeiro', email: 'ana.ribeiro@exemplo.com', categoria: 'Chocolateria',
        titulo: 'Bombons Recheados e Temperagem', tipo_curso: 'Prático', nome_fornecedor: '', valor: 480,
        descricao: 'Curso prático de bombons moldados. Começamos pela temperagem do chocolate nos três métodos (mármore, semeadura e micro-ondas) e pelos testes de cristalização. Em seguida, moldagem de cascas em forma de policarbonato, preparo de três recheios cremosos (ganache de maracujá, caramelo salgado e praliné de castanhas) e fechamento com acabamento brilhante. Para finalizar, pintura com manteiga de cacau colorida e embalagem para venda. Cada aluno leva cerca de 40 bombons. Todo o material está incluso, basta trazer avental.',
        fotos: [fotoSVG('#6B3E26', 'Bombons'), fotoSVG('#8B5A3C', 'Temperagem')], status: 'aprovado' },
      { data: toDS(d2), data2: null, duracao: 'manha', horaInicio: '09:00', horaFim: '12:30',
        nome: 'Carlos Mendes', email: 'carlos.mendes@exemplo.com', categoria: 'Confeitaria',
        titulo: 'Macarons Franceses', tipo_curso: 'Prático', nome_fornecedor: '', valor: 320,
        descricao: 'Aula completa de macarons pelo método do merengue italiano, o mais estável para o clima brasileiro. Vamos entender o ponto da calda, a macaronage correta, o descanso das cascas e a secagem que forma os pés. Preparo de três ganaches (chocolate meio amargo, limão siciliano e pistache) e montagem. Turma reduzida, com todos os alunos trabalhando em bancada individual. Inclui apostila com tabela de erros comuns e como corrigir. Material e embalagens inclusos.',
        fotos: [fotoSVG('#C4894A', 'Macarons'), fotoSVG('#D9A066', 'Ganache')], status: 'pendente' },
      { data: toDS(d2), data2: null, duracao: 'tarde', horaInicio: '13:30', horaFim: '17:00',
        nome: 'Juliana Prado', email: 'juliana.prado@exemplo.com', categoria: 'Salgados',
        titulo: 'Pães de Fermentação Natural', tipo_curso: 'Prático', nome_fornecedor: '', valor: 290,
        descricao: 'Introdução aos pães de fermentação natural. Vamos falar sobre o levain, como criar, alimentar e manter, e preparar uma massa de hidratação alta com dobras ao longo do período. Modelagem de pão rústico e baguete, corte e forno com vapor. Cada aluno leva o pão assado e um pote de fermento ativo para continuar em casa, além de apostila com cronograma de fermentação para dias quentes e frios. Material incluso.',
        fotos: [fotoSVG('#9E6A2E', 'Pães'), fotoSVG('#7A4B1E', 'Levain')], status: 'aprovado' },
      { data: toDS(d3), data2: toDS(addDays(d3, 1)), duracao: '2dias', horaInicio: '09:00', horaFim: '17:00',
        nome: 'Marcos Tavares', email: 'marcos.tavares@exemplo.com', categoria: 'Chocolateria',
        titulo: 'Ovos de Páscoa Artesanais, Imersão de 2 Dias', tipo_curso: 'Prático', nome_fornecedor: '', valor: 890,
        descricao: 'Imersão de dois dias voltada para quem quer vender ovos de Páscoa. No primeiro dia, temperagem, cascas lisas e trufadas, ovos de colher e recheios estáveis para transporte. No segundo dia, decoração com transfer e pintura, embalagem, cálculo de custo e precificação, planejamento de produção e estratégias de venda antecipada. Os alunos levam os ovos produzidos e uma planilha de custos pronta para uso. Material e embalagens inclusos.',
        fotos: [fotoSVG('#3D1F0A', 'Ovos'), fotoSVG('#5C3317', 'Decoração'), fotoSVG('#8B5A3C', 'Embalagem')], status: 'pendente' },
      { data: toDS(d4), data2: null, duracao: 'dia', horaInicio: '09:00', horaFim: '17:00',
        nome: 'Fernanda Luz', email: 'fernanda.luz@exemplo.com', categoria: 'Confeitaria',
        titulo: 'Bolos de Festa com Chantininho', tipo_curso: 'Demonstrativo', nome_fornecedor: '', valor: 410,
        descricao: 'Curso de bolos de festa do início ao fim. Massas amanteigada e de chocolate, recheios estáveis para calor (brigadeiro de forno e mousse de frutas), montagem nivelada com aro, cobertura de chantininho lisa com espátula e acabamento com bicos de confeitar. Cada aluno monta e decora um bolo de 20 cm e leva para casa. Inclui apostila com tabela de rendimento por tamanho e dicas de transporte. Material incluso.',
        fotos: [fotoSVG('#B06D3A', 'Bolos'), fotoSVG('#C98B55', 'Bicos')], status: 'reprovado' },
      { data: toDS(d5), data2: null, duracao: 'manha', horaInicio: '09:00', horaFim: '11:30',
        nome: 'Roberto Silva', email: 'roberto.silva@exemplo.com', categoria: 'Fornecedor',
        titulo: 'Workshop de Formas e Moldes de Policarbonato', tipo_curso: 'Demonstrativo', nome_fornecedor: 'Moldes & Cia', valor: 150,
        descricao: 'Workshop gratuito para parceiros com apresentação da linha de formas e moldes de policarbonato. Vamos mostrar a diferença entre moldes de policarbonato, acetato e silicone, as técnicas de limpeza e polimento que garantem brilho, o desmolde sem quebras e os cuidados de armazenamento. Demonstração prática com chocolate temperado em três modelos de forma. Os participantes recebem desconto na linha apresentada. Vagas limitadas a 15 pessoas.',
        fotos: [fotoSVG('#4E2A12', 'Moldes'), fotoSVG('#6B3E26', 'Demonstração')], status: 'aprovado' },
      { data: toDS(d6), data2: null, duracao: 'tarde', horaInicio: '13:30', horaFim: '17:00',
        nome: 'Ana Ribeiro', email: 'ana.ribeiro@exemplo.com', categoria: 'Chocolateria',
        titulo: 'Barras Recheadas e Chocolate Bean to Bar', tipo_curso: 'Demonstrativo', nome_fornecedor: '', valor: 390,
        descricao: 'Introdução ao chocolate bean to bar. Apresentamos as origens do cacau brasileiro, a seleção dos grãos e as etapas de torra, quebra, moagem, refino e conchagem em equipamentos de pequena escala. Degustação comparativa de amêndoas de diferentes regiões e de chocolates com porcentagens variadas. Na parte prática, temperagem e moldagem de barras recheadas com caramelo e castanhas. Cada aluno leva duas barras. Material incluso.',
        fotos: [fotoSVG('#2E1507', 'Bean to bar'), fotoSVG('#3D1F0A', 'Barras')], status: 'pendente' },
      { data: toDS(d7), data2: null, duracao: 'dia', horaInicio: '09:00', horaFim: '17:00',
        nome: 'Juliana Prado', email: 'juliana.prado@exemplo.com', categoria: 'Salgados',
        titulo: 'Salgados de Festa, Produção em Escala', tipo_curso: 'Prático', nome_fornecedor: '', valor: 350,
        descricao: 'Curso voltado para produção de salgados de festa em escala. Massas para coxinha, empada e folhado, recheios de frango, carne e queijo, modelagem rápida, congelamento correto e fritura sem absorver óleo. Vamos montar um cronograma de produção para encomendas de 500 unidades e preencher juntos a planilha de custos que acompanha o curso. Cada aluno leva os salgados produzidos. Material incluso.',
        fotos: [fotoSVG('#9E6A2E', 'Salgados'), fotoSVG('#B07A3C', 'Produção')], status: 'aprovado' },
    ].map(b => Object.assign({ id: uid(), criadoEm: new Date().toISOString() }, b));

    const f = toDS(feriado);
    const mt = toDS(manutencao);
    const datas_bloqueadas = [
      { id: uid(), date: f, periodo: 'dia', reason: 'Feriado', label: f.split('-').reverse().join('/') },
      { id: uid(), date: mt, periodo: 'manha', reason: 'Manutenção da cozinha', label: mt.split('-').reverse().join('/') },
    ];
    const datas_liberadas = [];
    return { agendamentos, datas_bloqueadas, datas_liberadas, seededAt: toDS(hoje) };
  }

  // ---------- persistência ----------
  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const db = JSON.parse(raw);
        // Se os dados de exemplo ficaram velhos (mais de 15 dias), regenera
        if (db.seededAt && (Date.now() - new Date(db.seededAt).getTime()) > 15 * 864e5) return write(seed());
        return db;
      }
    } catch (e) { /* localStorage indisponível ou corrompido */ }
    return write(seed());
  }
  function write(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* modo privado, segue em memória */ }
    return db;
  }

  let cache = null;
  function db() { if (!cache) cache = read(); return cache; }

  // ---------- API pública (imita o que o Firestore fazia) ----------
  const DemoStore = {
    getAll() { const d = db(); return { agendamentos: [...d.agendamentos], datas_bloqueadas: [...d.datas_bloqueadas], datas_liberadas: [...d.datas_liberadas] }; },
    add(col, obj) { const d = db(); const item = Object.assign({ id: uid() }, obj); d[col].push(item); write(d); return item.id; },
    update(col, id, patch) { const d = db(); const i = d[col].findIndex(x => x.id === id); if (i > -1) { Object.assign(d[col][i], patch); write(d); } },
    remove(col, id) { const d = db(); d[col] = d[col].filter(x => x.id !== id); write(d); },
    reset() { cache = write(seed()); return cache; },

    // Auth de demonstração
    DEMO_USER,
    login(email, senha) {
      const ok = email.trim().toLowerCase() === DEMO_USER.email && senha === DEMO_USER.senha;
      if (ok) { try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {} }
      return ok;
    },
    logout() { try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {} },
    isLogged() { try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; } },

    // Substitui o upload para o Cloudinary: reduz a imagem e guarda como data URL
    async uploadPhoto(file) {
      const url = URL.createObjectURL(file);
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      const max = 480, scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      return c.toDataURL('image/jpeg', 0.7);
    },

    // Substitui o EmailJS: mostra um aviso na tela em vez de enviar
    sendEmail(destinatario, assunto) {
      DemoStore.toast('✉️ E-mail simulado para ' + destinatario + ' — ' + assunto);
      return Promise.resolve();
    },

    toast(msg) {
      let el = document.getElementById('demo-toast');
      if (!el) {
        el = document.createElement('div'); el.id = 'demo-toast';
        el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#2A1505;color:#fff;padding:10px 16px;border-radius:8px;font:13px "DM Sans",sans-serif;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.25);max-width:90vw;opacity:0;transition:opacity .2s';
        document.body.appendChild(el);
      }
      el.textContent = msg; el.style.opacity = '1';
      clearTimeout(el._t); el._t = setTimeout(() => { el.style.opacity = '0'; }, 3500);
    },

    // Faixa no topo da página avisando que é demonstração
    banner(extra) {
      const b = document.createElement('div');
      b.style.cssText = 'background:#FFF3E0;color:#5C3317;border-bottom:1px solid #FFB74D;padding:8px 16px;font:13px "DM Sans",sans-serif;text-align:center;line-height:1.5';
      b.innerHTML = '<strong>Modo demonstração.</strong> Dados fictícios salvos apenas neste navegador. Fotos e e-mails são simulados. ' + (extra || '') +
        ' <a href="#" id="demo-reset" style="color:#9E6A2E;font-weight:500">Restaurar dados de exemplo</a>';
      document.body.prepend(b);
      b.querySelector('#demo-reset').addEventListener('click', (e) => { e.preventDefault(); DemoStore.reset(); location.reload(); });
    },
  };
  window.DemoStore = DemoStore;
})();
