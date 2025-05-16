//Seletores
const form = document.getElementById('form-movimentacao');
const tabela = document.getElementById('tabela-movimentacoes');
const totalEntradas = document.getElementById('total-entradas');
const totalSaidas = document.getElementById('total-saidas');
const saldo = document.getElementById('saldo');

let movimentacoes = [];

// Recuperar dados do localStorage ao carregar
window.onload = () =>{
    const dadosSalvos = localStorage.getItem('livroCaixa');
    if (dadosSalvos){
        movimentacoes = JSON.parse(dadosSalvos);
        atualizarTabela();
        atualizarTotais();
    }
};

// Evento de envio do formulário
form.addEventListener('submit', function(event){
    event.preventDefault();

    const data = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value;
    const tipo = document.getElementById('tipo').value;
    const valor = parseFloat(document.getElementById('valor').value);

    if (!data || !descricao || !tipo || isNaN(valor)){
        alert('Preencha todos os campos corretamente.');
        return;
    }

    movimentacoes.push({ data, descricao, tipo, valor});
    salvarNoLocalStorage();
    atualizarTabela();
    atualizarTotais();
    form.reset();
});

// Atualiza a tabela com os dados
function atualizarTabela(){
    tabela.innerHTML = '';
    movimentacoes.forEach((mov) =>{
        const linha = document.createElement('tr');
        linha.innerHTML = `
        <td>${mov.data}</td>
        <td>${mov.descricao}</td>
        <td>${mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}</td>
        <td>R$ ${mov.valor.toFixed(2).replace('.', ',')}</td>
        `;
        tabela.appendChild(linha);
    });
}

// Atualiza os totais e saldo
function atualizarTotais(){
    let entradas = 0;
    let saidas = 0;

    movimentacoes.forEach(mov => {
        if (mov.tipo === 'entrada') entradas += mov.valor;
        else if (mov.tipo === 'saida') saidas += mov.valor;
    });

    const saldoFinal = entradas - saidas; 

    totalEntradas.textContent = `R$ ${entradas.toFixed(2).replace('.', ',')}`;
    totalSaidas.textContent = `R$ ${saldoFinal.toFixed(2).replace('.', ',')}`;
    saldo.textContent = `R$ ${saldoFinal.toFixed(2).replace('.', ',')}`;
}

// Salva no localStorage
function salvarNoLocalStorage(){
    localStorage.setItem('livroCaixa', JSON.stringify(movimentacoes));
}