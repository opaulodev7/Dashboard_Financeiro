// ARRAY PRINCIPAL DAS TRANSAÇÕES
let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

// ELEMENTOS HTML
const formulario = document.getElementById("form-transacao");

const listaTransacoes = document.getElementById("lista-transacoes");

const saldoElemento = document.getElementById("saldo");

const entradasElemento = document.getElementById("entradas");

const despesasElemento = document.getElementById("despesas");

const pesquisaInput = document.getElementById("pesquisa");

const filtroTipo = document.getElementById("filtro-tipo");

// EVENTOS
pesquisaInput.addEventListener("input", listarTransacoes);

filtroTipo.addEventListener("change", listarTransacoes);

formulario.addEventListener("submit", adicionarTransacao);

// SALVAR DADOS
function salvarDados() {
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

// RESUMO FINANCEIRO
function obterResumoFinanceiro() {
  let entradas = 0;
  let despesas = 0;

  transacoes.forEach((transacao) => {
    if (transacao.tipo === "entrada") {
      entradas += transacao.valor;
    } else {
      despesas += transacao.valor;
    }
  });

  return {
    entradas,
    despesas,
    saldo: entradas - despesas,
  };
}

// ADICIONAR TRANSAÇÃO
function adicionarTransacao(event) {
  event.preventDefault();

  const descricao = document.getElementById("descricao").value.trim();

  const valor = parseFloat(document.getElementById("valor").value);

  const categoria = document.getElementById("categoria").value.trim();

  const tipo = document.getElementById("tipo").value;

  // VALIDAÇÃO
  if (descricao === "" || categoria === "" || isNaN(valor) || tipo === "") {
    alert("Preencha todos os campos.");

    return;
  }

  // OBJETO
  const novaTransacao = {
    id: Date.now(),
    descricao,
    valor,
    categoria,
    tipo,
  };

  // ADICIONA
  transacoes.push(novaTransacao);

  // SALVA
  salvarDados();

  // ATUALIZA
  atualizarTela();

  // LIMPA FORMULÁRIO
  formulario.reset();
}

// LISTAR TRANSAÇÕES
function listarTransacoes() {
  listaTransacoes.innerHTML = "";

  const textoPesquisa = pesquisaInput.value.toLowerCase();

  const tipoFiltro = filtroTipo.value;

  const transacoesFiltradas = transacoes.filter((transacao) => {
    const descricao = (transacao.descricao || "").toLowerCase();

    const correspondePesquisa = descricao.includes(textoPesquisa);

    const correspondeFiltro =
      tipoFiltro === "todos" || transacao.tipo === tipoFiltro;

    return correspondePesquisa && correspondeFiltro;
  });

  transacoesFiltradas.forEach((transacao) => {
    const linha = document.createElement("tr");

    linha.innerHTML = `
            <td>${transacao.descricao}</td>

            <td>${transacao.categoria}</td>

            <td>
                R$ ${transacao.valor.toFixed(2)}
            </td>

            <td class="${
              transacao.tipo === "entrada" ? "tipo-entrada" : "tipo-saida"
            }">

                ${transacao.tipo}

            </td>

            <td>

                <button
                    class="btn-excluir"
                    onclick="excluirTransacao(${transacao.id})"
                >
                    Excluir
                </button>

            </td>
        `;

    listaTransacoes.appendChild(linha);
  });
}

// CALCULAR RESUMO
function calcularResumo() {
  const resumo = obterResumoFinanceiro();

  saldoElemento.textContent = `R$ ${resumo.saldo.toFixed(2)}`;

  entradasElemento.textContent = `R$ ${resumo.entradas.toFixed(2)}`;

  despesasElemento.textContent = `R$ ${resumo.despesas.toFixed(2)}`;
}

// EXCLUIR TRANSAÇÃO
function excluirTransacao(id) {
  transacoes = transacoes.filter((transacao) => transacao.id !== id);

  salvarDados();

  atualizarTela();
}

// GRÁFICO PIZZA
function desenharGrafico() {
  const canvas = document.getElementById("graficoFinanceiro");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  canvas.width = 300;
  canvas.height = 300;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const resumo = obterResumoFinanceiro();

  const entradas = resumo.entradas;

  const despesas = resumo.despesas;

  const total = entradas + despesas;

  // SEM DADOS
  if (total === 0) {
    ctx.font = "18px Arial";

    ctx.fillStyle = "#666";

    ctx.textAlign = "center";

    ctx.fillText("Sem dados financeiros", canvas.width / 2, canvas.height / 2);

    return;
  }

  // POSIÇÕES
  const centroX = canvas.width / 2;

  const centroY = canvas.height / 2;

  const raio = 100;

  // ÂNGULO
  const anguloEntradas = (entradas / total) * Math.PI * 2;

  // ENTRADAS
  ctx.beginPath();

  ctx.moveTo(centroX, centroY);

  ctx.fillStyle = "#16a34a";

  ctx.arc(centroX, centroY, raio, 0, anguloEntradas);

  ctx.fill();

  // BORDA
  ctx.lineWidth = 4;

  ctx.strokeStyle = "#bababa";

  ctx.stroke();

  // DESPESAS
  ctx.beginPath();

  ctx.moveTo(centroX, centroY);

  ctx.fillStyle = "#ef4444";

  ctx.arc(centroX, centroY, raio, anguloEntradas, Math.PI * 2);

  ctx.fill();

  ctx.stroke();

  // CENTRO
  ctx.beginPath();

  ctx.fillStyle = "#bababa";

  ctx.arc(centroX, centroY, 45, 0, Math.PI * 2);

  ctx.fill();

  // TEXTO
  ctx.fillStyle = "#111";

  ctx.font = "bold 16px Arial";

  ctx.textAlign = "center";

  ctx.fillText("Total", centroX, centroY - 10);

  ctx.font = "14px Arial";

  ctx.fillText(`R$ ${total.toFixed(2)}`, centroX, centroY + 15);
}

// GRÁFICO DE BARRAS
function desenharGraficoBarras() {
  const canvas = document.getElementById("graficoBarras");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  canvas.width = 400;
  canvas.height = 280;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const resumo = obterResumoFinanceiro();

  const entradas = resumo.entradas;

  const despesas = resumo.despesas;

  const maiorValor = Math.max(entradas, despesas);

  // SEM DADOS
  if (maiorValor === 0) {
    ctx.font = "18px Arial";

    ctx.fillStyle = "#666";

    ctx.textAlign = "center";

    ctx.fillText("Sem dados financeiros", canvas.width / 2, canvas.height / 2);

    return;
  }

  // CONFIGURAÇÕES
  const larguraBarra = 90;

  const alturaMaxima = 180;

  const eixoY = 220;

  // ALTURAS
  const alturaEntradas = (entradas / maiorValor) * alturaMaxima;

  const alturaDespesas = (despesas / maiorValor) * alturaMaxima;

  // BARRA ENTRADAS
  ctx.fillStyle = "#16a34a";

  ctx.fillRect(70, eixoY - alturaEntradas, larguraBarra, alturaEntradas);

  // BARRA DESPESAS
  ctx.fillStyle = "#ef4444";

  ctx.fillRect(240, eixoY - alturaDespesas, larguraBarra, alturaDespesas);

  // TEXTOS
  ctx.fillStyle = "#111";

  ctx.font = "bold 14px Arial";

  ctx.textAlign = "center";

  // LABELS
  ctx.fillText("Entradas", 115, 245);

  ctx.fillText("Despesas", 285, 245);

  // VALORES
  ctx.font = "13px Arial";

  ctx.fillText(`R$ ${entradas.toFixed(2)}`, 115, eixoY - alturaEntradas - 10);

  ctx.fillText(`R$ ${despesas.toFixed(2)}`, 285, eixoY - alturaDespesas - 10);
}

// ATUALIZAR TELA
function atualizarTela() {
  listarTransacoes();

  calcularResumo();

  desenharGrafico();

  desenharGraficoBarras();
}

// INICIAR
atualizarTela();

const botao = document.getElementById('toggle-tema');

// Verifica se o usuário já tinha um tema salvo anteriormente
const temaSalvo = localStorage.getItem('tema');

if (temaSalvo === 'escuro') {
    document.body.classList.add('dark');
}

// Alterna o tema ao clicar no botão
botao.addEventListener('click', () => {
    document.body.classList.toggle('dark');

    // Salva a preferência no navegador
    if (document.body.classList.contains('dark')) {
        localStorage.setItem('tema', 'escuro');
    } else {
        localStorage.setItem('tema', 'claro');
    }
});
