/**
 * 🧪 QR Code Tester - Teste Manual Interativo
 *
 * Este script:
 * 1. Inicia uma sessão de teste
 * 2. Exibe o QR Code automaticamente no terminal
 * 3. Abre o QR Code no navegador
 * 4. Aguarda você escanear com seu celular
 * 5. Cria um grupo de teste
 * 6. Executa testes básicos
 */

import qrcode from 'qrcode-terminal';
import open from 'open';
import readline from 'readline';

const BASE_URL = 'http://localhost:3000/api/v1';
const SESSION_ID = 'test-session';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(message: string) {
  console.log('\n' + '='.repeat(60));
  log(message, colors.bright + colors.blue);
  console.log('='.repeat(60) + '\n');
}

async function waitForEnter(message: string): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${message}${colors.reset}`, () => {
      rl.close();
      resolve();
    });
  });
}

async function apiRequest(endpoint: string, method: string = 'GET', body?: any) {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error: any) {
    log(`❌ Erro na requisição: ${error.message}`, colors.red);
    throw error;
  }
}

async function initializeSession() {
  header('📱 Passo 1: Inicializando Sessão');

  const response = await apiRequest(`/sessions/${SESSION_ID}/init`, 'POST');

  if (response.status === 201 || response.status === 200) {
    log('✅ Sessão inicializada com sucesso!', colors.green);
    return true;
  } else if (response.status === 400 && response.data.error?.code === 'CLIENT_ALREADY_EXISTS') {
    log('⚠️  Sessão já existe, continuando...', colors.yellow);
    return true;
  } else {
    log(`❌ Erro ao inicializar sessão: ${response.data.message}`, colors.red);
    return false;
  }
}

async function waitForQRCode(): Promise<string | null> {
  header('📱 Passo 2: Aguardando QR Code');

  log('⏳ Aguardando geração do QR Code...', colors.yellow);

  for (let i = 0; i < 20; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await apiRequest(`/sessions/${SESSION_ID}`);

    if (response.data.data?.qrCode) {
      log('✅ QR Code gerado!', colors.green);
      return response.data.data.qrCode;
    }

    if (response.data.data?.status === 'READY') {
      log('✅ Sessão já está autenticada!', colors.green);
      return null;
    }

    process.stdout.write('.');
  }

  log('\n❌ Timeout aguardando QR Code', colors.red);
  return null;
}

async function displayQRCode(qrCodeData: string) {
  header('📱 Passo 3: Exibindo QR Code');

  // Extrair texto do QR code do base64
  const qrText = qrCodeData.replace(/^data:image\/png;base64,/, '');

  // Mostrar QR no terminal
  log('QR Code no terminal:', colors.bright);
  console.log('');

  // Gerar ASCII QR
  const asciiResponse = await apiRequest(`/sessions/${SESSION_ID}/qr/ascii`);
  if (asciiResponse.status === 200) {
    console.log(asciiResponse.data);
  }

  console.log('');

  // Abrir QR Code no navegador
  const qrUrl = `${BASE_URL}/sessions/${SESSION_ID}/qr/image`;
  log(`🌐 Abrindo QR Code no navegador: ${qrUrl}`, colors.blue);

  try {
    await open(qrUrl);
    log('✅ Navegador aberto!', colors.green);
  } catch (error) {
    log(`⚠️  Não foi possível abrir o navegador automaticamente`, colors.yellow);
    log(`   Abra manualmente: ${qrUrl}`, colors.yellow);
  }
}

async function waitForAuthentication(): Promise<boolean> {
  header('📱 Passo 4: Aguardando Autenticação');

  await waitForEnter('👉 Escaneie o QR Code com seu WhatsApp e pressione ENTER...');

  log('⏳ Verificando autenticação...', colors.yellow);

  for (let i = 0; i < 60; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await apiRequest(`/sessions/${SESSION_ID}`);
    const status = response.data.data?.status;
    const phoneNumber = response.data.data?.phoneNumber;

    log(`   Status: ${status}`, colors.blue);

    if (status === 'READY') {
      log(`✅ Autenticado com sucesso!`, colors.green);
      log(`📞 Número conectado: ${phoneNumber}`, colors.green);
      return true;
    }

    if (status === 'DISCONNECTED' || status === 'ERROR') {
      log(`❌ Erro na autenticação: ${status}`, colors.red);
      return false;
    }
  }

  log('❌ Timeout na autenticação', colors.red);
  return false;
}

async function createTestGroup(): Promise<string | null> {
  header('📱 Passo 5: Criando Grupo de Teste');

  log('ℹ️  Você precisa fornecer números de teste', colors.blue);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const participants = await new Promise<string[]>((resolve) => {
    rl.question('Digite os números para o grupo (separados por vírgula, ex: 5511999999999,5511888888888): ', (answer) => {
      rl.close();
      const numbers = answer.split(',').map(n => n.trim() + '@c.us');
      resolve(numbers);
    });
  });

  if (participants.length === 0) {
    log('⚠️  Nenhum participante fornecido, pulando criação de grupo', colors.yellow);
    return null;
  }

  const groupData = {
    name: '🧪 Grupo de Teste API',
    participantIds: participants,
  };

  log('⏳ Criando grupo...', colors.yellow);

  try {
    const response = await apiRequest(`/sessions/${SESSION_ID}/groups`, 'POST', groupData);

    if (response.status === 200 || response.status === 201) {
      log('✅ Grupo criado com sucesso!', colors.green);
      log(`   Grupo ID: ${response.data.data?.id}`, colors.blue);
      return response.data.data?.id;
    } else {
      log(`❌ Erro ao criar grupo: ${response.data.message}`, colors.red);
      return null;
    }
  } catch (error) {
    log('❌ Erro ao criar grupo', colors.red);
    return null;
  }
}

async function runBasicTests(groupId: string | null) {
  header('📱 Passo 6: Executando Testes Básicos');

  // Teste 1: Listar conversas
  log('🧪 Teste 1: Listar conversas', colors.blue);
  const chatsResponse = await apiRequest(`/sessions/${SESSION_ID}/chats`);
  if (chatsResponse.status === 200) {
    const chatCount = chatsResponse.data.data?.length || 0;
    log(`✅ Sucesso! ${chatCount} conversas encontradas`, colors.green);
  } else {
    log(`❌ Falha ao listar conversas`, colors.red);
  }

  // Teste 2: Listar contatos
  log('\n🧪 Teste 2: Listar contatos', colors.blue);
  const contactsResponse = await apiRequest(`/sessions/${SESSION_ID}/contacts`);
  if (contactsResponse.status === 200) {
    const contactCount = contactsResponse.data.data?.length || 0;
    log(`✅ Sucesso! ${contactCount} contatos encontrados`, colors.green);
  } else {
    log(`❌ Falha ao listar contatos`, colors.red);
  }

  // Teste 3: Obter perfil
  log('\n🧪 Teste 3: Obter perfil', colors.blue);
  const profileResponse = await apiRequest(`/sessions/${SESSION_ID}/profile`);
  if (profileResponse.status === 200) {
    log(`✅ Sucesso! Perfil: ${profileResponse.data.data?.pushname}`, colors.green);
  } else {
    log(`❌ Falha ao obter perfil`, colors.red);
  }

  // Teste 4: Status da bateria
  log('\n🧪 Teste 4: Status da bateria', colors.blue);
  const batteryResponse = await apiRequest(`/sessions/${SESSION_ID}/profile/battery`);
  if (batteryResponse.status === 200) {
    const battery = batteryResponse.data.data;
    log(`✅ Sucesso! Bateria: ${battery?.battery}% ${battery?.plugged ? '⚡' : '🔋'}`, colors.green);
  } else {
    log(`❌ Falha ao obter bateria`, colors.red);
  }

  // Teste 5: Enviar mensagem no grupo (se criado)
  if (groupId) {
    log('\n🧪 Teste 5: Enviar mensagem no grupo de teste', colors.blue);
    const messageData = {
      chatId: groupId,
      content: '🧪 Esta é uma mensagem de teste automático da API!',
    };

    const messageResponse = await apiRequest(`/sessions/${SESSION_ID}/messages/send`, 'POST', messageData);
    if (messageResponse.status === 200 || messageResponse.status === 201) {
      log(`✅ Mensagem enviada com sucesso!`, colors.green);
    } else {
      log(`❌ Falha ao enviar mensagem`, colors.red);
    }
  }
}

async function cleanup() {
  header('🧹 Limpeza');

  const answer = await new Promise<string>((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Deseja destruir a sessão de teste? (s/N): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });

  if (answer === 's' || answer === 'sim' || answer === 'y' || answer === 'yes') {
    log('⏳ Destruindo sessão...', colors.yellow);
    const response = await apiRequest(`/sessions/${SESSION_ID}`, 'DELETE');

    if (response.status === 200) {
      log('✅ Sessão destruída com sucesso!', colors.green);
    } else {
      log('❌ Erro ao destruir sessão', colors.red);
    }
  } else {
    log('✅ Sessão mantida para testes futuros', colors.green);
  }
}

async function main() {
  console.clear();

  header('🧪 TESTADOR INTERATIVO - WhatsApp API');

  log('Este script irá:', colors.blue);
  log('  1. Inicializar uma sessão de teste');
  log('  2. Exibir o QR Code (terminal + navegador)');
  log('  3. Aguardar você escanear com seu celular');
  log('  4. Criar um grupo de teste (opcional)');
  log('  5. Executar testes básicos da API');
  log('');
  log('⚠️  IMPORTANTE:', colors.yellow);
  log('  - O servidor deve estar rodando em http://localhost:3000', colors.yellow);
  log('  - Tenha seu celular em mãos para escanear o QR Code', colors.yellow);
  log('  - Tenha números de teste para o grupo (opcional)', colors.yellow);
  log('');

  await waitForEnter('Pressione ENTER para começar...');

  try {
    // 1. Inicializar sessão
    const initialized = await initializeSession();
    if (!initialized) {
      log('❌ Falha ao inicializar. Encerrando.', colors.red);
      return;
    }

    // 2. Aguardar e obter QR Code
    const qrCode = await waitForQRCode();

    // 3. Exibir QR Code (se gerado)
    if (qrCode) {
      await displayQRCode(qrCode);

      // 4. Aguardar autenticação
      const authenticated = await waitForAuthentication();
      if (!authenticated) {
        log('❌ Falha na autenticação. Encerrando.', colors.red);
        return;
      }
    }

    // 5. Criar grupo de teste
    const groupId = await createTestGroup();

    // 6. Executar testes
    await runBasicTests(groupId);

    // 7. Limpeza
    await cleanup();

    header('✅ TESTES CONCLUÍDOS!');
    log('Obrigado por testar! 🚀', colors.green);

  } catch (error: any) {
    log(`\n❌ Erro inesperado: ${error.message}`, colors.red);
    console.error(error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { main as runQRTester };
