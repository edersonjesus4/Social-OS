// ELEMENTOS PRINCIPAIS
let resultsContainer = document.querySelector(".results-container");
let campoBusca = document.querySelector(".search-box input");
let categoryList = document.getElementById("category-list");
let resultsSection = document.querySelector(".results-section");
let themeToggleBtn = document.querySelector(".theme-toggle");
let themeLabel = document.querySelector(".theme-label");

let dados = [];

/* ===========================
   CARREGAR BASE (data.json)
   =========================== */
document.addEventListener("DOMContentLoaded", async () => {
    await carregarDados();
    inicializarTema();
});

/**
 * Busca data.json e popula a variável "dados"
 */
async function carregarDados() {
    if (dados.length > 0) return;

    try {
        const resposta = await fetch("data.json");
        dados = await resposta.json();
        renderizarCategorias();
    } catch (error) {
        console.error("Falha ao buscar dados:", error);
        resultsContainer.innerHTML =
            `<p style="color: #ef4444; text-align: center;">Erro ao carregar a base de conhecimento.</p>`;
        resultsSection.classList.remove("hidden");
    }
}

/* ===========================
   BUSCA
   =========================== */
function iniciarBusca() {
    const termoBusca = campoBusca.value.toLowerCase().trim();

    limparCategoriaAtiva();

    if (termoBusca.length > 2) {
        const filtrados = dados.filter((dado) =>
            dado.nome.toLowerCase().includes(termoBusca) ||
            dado.descrição.toLowerCase().includes(termoBusca) ||
            dado.categoria_ref.toLowerCase().includes(termoBusca)
        );
        renderizarCards(filtrados);
    } else if (termoBusca.length === 0) {
        resultsContainer.innerHTML = "";
        resultsSection.classList.add("hidden");
    }
}

/* ===========================
   CATEGORIAS
   =========================== */
function filtrarPorCategoria(categoria, elemento) {
    limparCategoriaAtiva();

    if (elemento) {
        elemento.classList.add("active");
    }

    campoBusca.value = "";

    const lista = categoria === "__ALL__"
        ? dados
        : dados.filter((dado) => dado.categoria_ref === categoria);

    renderizarCards(lista);
}

function limparCategoriaAtiva() {
    const links = categoryList.querySelectorAll("a");
    links.forEach((link) => link.classList.remove("active"));
}

function renderizarCategorias() {
    const categorias = [...new Set(dados.map((dado) => dado.categoria_ref))].sort();

    categoryList.innerHTML = "";

    // botão "Ver todos"
    const liTodos = document.createElement("li");
    liTodos.innerHTML =
        `<a href="#" onclick="filtrarPorCategoria('__ALL__', this); return false;">Ver todos</a>`;
    categoryList.appendChild(liTodos);

    categorias.forEach((categoria) => {
        const li = document.createElement("li");
        li.innerHTML =
            `<a href="#" onclick="filtrarPorCategoria('${categoria}', this); return false;">${categoria}</a>`;
        categoryList.appendChild(li);
    });
}

/* ===========================
   CARDS
   =========================== */
function renderizarCards(listaDados) {
    resultsContainer.innerHTML = "";
    resultsSection.classList.remove("hidden");

    if (!listaDados || listaDados.length === 0) {
        resultsContainer.innerHTML =
            `<p style="text-align: center;">Nenhum prompt encontrado.</p>`;
        return;
    }

    listaDados.forEach((dado) => {
        const article = document.createElement("article");
        article.classList.add("card");

        // Escapar aspas simples para o onclick
        const promptText = dado.Promt.replace(/'/g, "\\'");

        article.innerHTML = `
            <h2>${dado.nome}</h2>
            <p>${dado.descrição}</p>
            <div class="prompt-container">
                <textarea readonly onfocus="this.select()">${dado.Promt}</textarea>
                <button class="copy-btn" onclick="copiarPrompt(this, '${promptText}')">
                    Copiar prompt
                </button>
            </div>
        `;
        resultsContainer.appendChild(article);
    });
}

/* ===========================
   COPIAR PROMPT
   =========================== */
function copiarPrompt(botao, texto) {
    navigator.clipboard.writeText(texto)
        .then(() => {
            botao.textContent = "Copiado!";
            setTimeout(() => {
                botao.textContent = "Copiar prompt";
            }, 2000);
        })
        .catch(() => {
            botao.textContent = "Erro :(";
            setTimeout(() => {
                botao.textContent = "Copiar prompt";
            }, 2000);
        });
}

/* ===========================
   TEMA CLARO / ESCURO
   =========================== */
function inicializarTema() {
    const temaSalvo = localStorage.getItem("socialos-theme");
    const temaInicial = temaSalvo === "dark" || temaSalvo === "light"
        ? temaSalvo
        : "light";

    aplicarTema(temaInicial);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const atual = document.documentElement.getAttribute("data-theme") || "light";
            const novo = atual === "light" ? "dark" : "light";
            aplicarTema(novo);
        });
    }
}

function aplicarTema(tema) {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem("socialos-theme", tema);

    if (themeLabel) {
        themeLabel.textContent = tema === "light" ? "Tema claro" : "Tema escuro";
    }
}
