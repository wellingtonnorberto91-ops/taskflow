import express from 'express';
import cors from 'cors';
import { initDatabase, db } from './src/config/database.js';
import routes from './src/routes/index.js';

async function runEndToEndTests() {
  console.log('🚀 Iniciando bateria de testes end-to-end do TaskFlow API...');

  // Setup app de teste
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', routes);

  await initDatabase();

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 1. Registro de Usuário 1
    console.log('\n1️⃣ Testando Registro de Usuário...');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Usuário Teste 1',
        email: `teste1_${Date.now()}@taskflow.dev`,
        password: 'senhaSegura123'
      })
    });
    const regData = await regRes.json();
    if (!regData.success || !regData.token) throw new Error('Falha no registro: ' + JSON.stringify(regData));
    const token1 = regData.token;
    console.log('✅ Usuário 1 registrado com sucesso!');

    // 2. Consulta de Categorias Padrão
    console.log('\n2️⃣ Testando Categorias Padrão...');
    const catRes = await fetch(`${baseUrl}/categories`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const catData = await catRes.json();
    if (!catData.success || catData.categories.length < 3) throw new Error('Categorias padrão não foram criadas corretamente.');
    console.log(`✅ ${catData.categories.length} categorias padrão carregadas (${catData.categories.map(c => c.name).join(', ')})`);
    const defaultCategoryId = catData.categories[0].id;

    // 3. Criação de Tarefas com Diferentes Prioridades
    console.log('\n3️⃣ Testando Criação de Tarefas...');
    const task1Res = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: 'Finalizar documentação técnica',
        description: 'Descrever todos os endpoints e regras de negócio',
        priority: 'urgent',
        category_id: defaultCategoryId,
        due_date: '2026-08-25',
        tags: [{ name: 'documentação' }, { name: 'backend' }]
      })
    });
    const task1Data = await task1Res.json();
    if (!task1Data.success || !task1Data.task.id) throw new Error('Falha na criação da tarefa 1.');
    const taskId1 = task1Data.task.id;
    console.log('✅ Tarefa 1 criada com ID:', taskId1);

    // Tarefa 2 (Média)
    await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`
      },
      body: JSON.stringify({
        title: 'Configurar tema escuro',
        priority: 'medium',
        category_id: defaultCategoryId
      })
    });

    // 4. Listagem e Filtros de Tarefas
    console.log('\n4️⃣ Testando Filtros de Tarefas...');
    const filterRes = await fetch(`${baseUrl}/tasks?priority=urgent`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const filterData = await filterRes.json();
    if (!filterData.success || filterData.count !== 1) throw new Error('Filtro por prioridade urgente falhou.');
    console.log(`✅ Filtro por prioridade retornou ${filterData.count} tarefa urgente com sucesso.`);

    // 5. Toggle de Conclusão de Tarefa
    console.log('\n5️⃣ Testando Alternância de Conclusão...');
    const toggleRes = await fetch(`${baseUrl}/tasks/${taskId1}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token1}` }
    });
    const toggleData = await toggleRes.json();
    if (!toggleData.success || toggleData.status !== 'completed') throw new Error('Toggle de conclusão falhou.');
    console.log('✅ Tarefa marcada como concluída com sucesso!');

    // 6. Métricas do Dashboard
    console.log('\n6️⃣ Testando Métricas do Dashboard...');
    const statsRes = await fetch(`${baseUrl}/stats`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const statsData = await statsRes.json();
    if (!statsData.success) throw new Error('Falha ao obter métricas do dashboard.');
    console.log('📊 Estatísticas obtidas:', {
      total: statsData.stats.total,
      concluidasHoje: statsData.stats.completedToday,
      taxaConclusao: `${statsData.stats.completionRate}%`
    });

    // 7. Teste de Isolamento entre Usuários (Multi-tenant)
    console.log('\n7️⃣ Testando Isolamento Estrito entre Usuários...');
    const reg2Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Usuário Teste 2',
        email: `teste2_${Date.now()}@taskflow.dev`,
        password: 'senhaSegura456'
      })
    });
    const reg2Data = await reg2Res.json();
    const token2 = reg2Data.token;

    // Usuário 2 tenta acessar tarefa do Usuário 1
    const attackRes = await fetch(`${baseUrl}/tasks/${taskId1}`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    if (attackRes.status !== 404) {
      throw new Error(`FALHA DE ISOLAMENTO: Usuário 2 conseguiu acessar a tarefa do Usuário 1! Status: ${attackRes.status}`);
    }
    console.log('🛡️ Isolamento verificado com perfeição: Usuário 2 não consegue acessar os dados do Usuário 1 (404 Not Found).');

    console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!\n');
  } finally {
    server.close();
  }
}

runEndToEndTests().catch((err) => {
  console.error('\n❌ ERRO NA SUÍTE DE TESTES:', err);
  process.exit(1);
});
