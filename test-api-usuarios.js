async function testAPIUsuarios() {
  try {
    console.log('Testando API /api/usuarios...')
    
    const response = await fetch('http://localhost:3001/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: 'Teste API Usuarios',
        email: `testapiusuarios${Date.now()}@example.com`,
        senha: '123456',
        tipo_usuario: 'Usuário',
        gestao: 'TI',
        area: 'Desenvolvimento',
        equipe: 'Equipe Alpha',
        especialidade: 'Frontend'
      })
    })
    
    const data = await response.json()
    console.log('Status:', response.status)
    console.log('Resposta:', data)
    
  } catch (error) {
    console.error('Erro no teste:', error)
  }
}

testAPIUsuarios()
