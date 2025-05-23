let editando = false;
let indexEditando = null;

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
    // Espera o DOM terminar de montar antes de preencher a data
    setTimeout(() => preencherDataUltimaMovimentacao(), 0);
};

// Evento de envio do formulário
form.addEventListener('submit', function(event){
    event.preventDefault();

    const data = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value;
    const tipo = document.getElementById('tipo').value;
    const formaPagamento = document.getElementById('forma-pagamento').value;
    const valor = parseFloat(document.getElementById('valor').value);

    if (!data || !descricao || !tipo || !formaPagamento || isNaN(valor)){
        alert('Preencha todos os campos corretamente.');
        return;
    }

    if(editando){
        // Atualiza a movimentação
        movimentacoes[indexEditando] = {data, descricao, tipo, formaPagamento, valor};
        editando = false;
        indexEditando = null;
        form.querySelector('button').textContent = 'Adicionar';
    }else{
        // Adiciona nova movimentação
        movimentacoes.push({data, descricao, tipo, formaPagamento, valor});
    }

    salvarNoLocalStorage();
    atualizarTabela();
    atualizarTotais();

    //limpa campos
    document.getElementById('descricao').value = '';
    document.getElementById('tipo').value = '';
    document.getElementById('forma-pagamento').value = '';
    document.getElementById('valor').value = '';
});

// Atualiza a tabela com os dados
function atualizarTabela(){
    tabela.innerHTML = '';
    movimentacoes.forEach((mov, index) =>{
        const linha = document.createElement('tr');
        linha.innerHTML = `
        <td>${mov.data}</td>
        <td>${mov.descricao}</td>
        <td>${mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}</td>
        <td>${mov.formaPagamento}</td>
        <td>R$ ${mov.valor.toFixed(2).replace('.', ',')}</td>
        <td>
        <button class="btn-editar" onclick="editarMovimentacao(${index})">✏️</button>
        <button class="btn-excluir" onclick="excluirMovimentacao(${index})">🗑️</button>
        </td>
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
    totalSaidas.textContent = `R$ ${saidas.toFixed(2).replace('.', ',')}`;
    saldo.textContent = `R$ ${saldoFinal.toFixed(2).replace('.', ',')}`;
}

// Exclui movimentações da lista
function excluirMovimentacao(index){
    if(confirm('Tem certeza que deseja excluir esta movimentação?')){
        movimentacoes.splice(index, 1);
        salvarNoLocalStorage();
        atualizarTabela();
        atualizarTotais();
    }
}

// Edita itens da lista
function editarMovimentacao(index){
    const mov = movimentacoes[index];
    document.getElementById('data').value = mov.data;
    document.getElementById('descricao').value = mov.descricao;
    document.getElementById('tipo').value = mov.tipo;
     document.getElementById('forma-pagamento').value = mov.formaPagamento;
    document.getElementById('valor').value = mov.valor;

    editando = true;
    indexEditando = index;
    form.querySelector('button').textContent = 'Salvar Edição';
}

// preenche a data com a data da última movimentação
function preencherDataUltimaMovimentacao(){
    if(movimentacoes.length > 0){
        const ultimaData = movimentacoes.at(-1).data;
        const campoData = document.getElementById('data');
        if (campoData){
            campoData.value = ultimaData;
        }       
    }
}

function salvarFechamentoNoHistorico(data, totalEntradas, totalSaidas, saldo){
    const novoFechamento = {
        data,
        totalEntradas,
        totalSaidas,
        saldo
    };

    let historico =JSON.parse(localStorage.getItem('fechamentoCaixa')) || [];
    historico.push(novoFechamento);
    localStorage.setItem('fechamentoCaixa', JSON.stringify(historico));
}

// Salva no localStorage
function salvarNoLocalStorage(){
    localStorage.setItem('livroCaixa', JSON.stringify(movimentacoes));
}

// Função de fechamento de caixa
document.getElementById('btn-fechar-caixa').addEventListener('click', () =>{
    const dataSelecionada = document.getElementById('data').value;

    if(!dataSelecionada){
        alert('Selecione uma data para fechar o caixa.');
        return;
    }

    const movimentacoesDoDia = movimentacoes.filter(mov => mov.data === dataSelecionada);

    if (movimentacoesDoDia.length === 0){
        alert('Não há movimentações nesta data.');
        return;
    }

    let entradas = 0;
    let saidas = 0;

    movimentacoesDoDia.forEach(mov =>{
        if (mov.tipo === 'entrada') entradas += mov.valor;
        else if(mov.tipo === 'saida') saidas += mov.valor;
    });

    const saldo = entradas - saidas;

    alert(`Resumo do dia ${dataSelecionada}:\n\nEntradas: R$ ${entradas.toFixed(2).replace('.',',')}\nSaídas: R$ ${saidas.toFixed(2).replace('.',',')}\nSaldo: R$ ${saldo.toFixed(2).replace('.',',')}`);

    // Salvar no histórico de fechamentos
    salvarFechamentoNoHistorico(dataSelecionada, entradas, saidas, saldo);
});