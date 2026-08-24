// Script de teste e verificação das funcionalidades do backend
import { initDatabase, db } from './src/config/database.js';

async function testBackend() {
  console.log('🧪 Iniciando teste de banco e integridade...');
  await initDatabase();

  const tables = await db.execute(`
    SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
  `);

  console.log('📋 Tabelas criadas no SQLite:', tables.rows.map(r => r.name));
  console.log('✅ Verificação do banco concluída com sucesso!');
}

testBackend().catch(err => {
  console.error('❌ Erro no teste do backend:', err);
  process.exit(1);
});
