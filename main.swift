import Foundation

// Estrutura do Contato (bem simples)
struct Contact {
    let id: Int
    var name: String
    var age: Int
    var phone: String
    var email: String
}

// Lista de contatos
var contacts: [Contact] = []
var nextId = 1

// ====================== FUNÇÕES ======================

func mostrarMenu() {
    print("\n=== GERENCIADOR DE CONTATOS ===")
    print("1. Cadastrar contato")
    print("2. Listar contatos")
    print("3. Alterar contato")
    print("4. Remover contato")
    print("5. Sair")
    print("Escolha uma opção: ", terminator: "")
}

// Cadastro simples
func cadastrar() {
    print("\n--- Cadastro de Contato ---")
    
    print("Nome: ", terminator: "")
    let nome = readLine() ?? ""
    if nome.isEmpty {
        print("Erro: Nome não pode estar vazio!")
        return
    }
    
    // Verifica se nome já existe
    if contacts.contains(where: { $0.name == nome }) {
        print("Erro: Já existe um contato com esse nome!")
        return
    }
    
    print("Idade: ", terminator: "")
    let idade = Int(readLine() ?? "") ?? 0
    
    print("Telefone: ", terminator: "")
    let telefone = readLine() ?? ""
    
    print("Email: ", terminator: "")
    let email = readLine() ?? ""
    
    // Verifica se os campos obrigatórios foram preenchidos
    if telefone.isEmpty || email.isEmpty {
        print("Erro: Telefone e Email são obrigatórios!")
        return
    }
    
    let novoContato = Contact(id: nextId, name: nome, age: idade, phone: telefone, email: email)
    contacts.append(novoContato)
    nextId += 1
    
    print("✅ Contato cadastrado com sucesso!")
}

// Listar contatos
func listar() {
    print("\n--- Lista de Contatos ---")
    
    if contacts.isEmpty {
        print("Nenhum contato cadastrado ainda.")
        return
    }
    
    for c in contacts {
        print("ID: \(c.id) | Nome: \(c.name) | Idade: \(c.age) | Telefone: \(c.phone) | Email: \(c.email)")
    }
}

// Alterar contato
func alterar() {
    print("\n--- Alterar Contato ---")
    
    if contacts.isEmpty {
        print("Não há contatos para alterar.")
        return
    }
    
    // Mostra apenas nome e ID
    for c in contacts {
        print("\(c.id). \(c.name)")
    }
    
    print("\nDigite o ID do contato que quer alterar: ", terminator: "")
    guard let idDigitado = Int(readLine() ?? "") else {
        print("ID inválido!")
        return
    }
    
    // Procura o contato pelo ID
    if let index = contacts.firstIndex(where: { $0.id == idDigitado }) {
        
        print("Novo nome (atual: \(contacts[index].name)): ", terminator: "")
        let novoNome = readLine() ?? ""
        
        if !novoNome.isEmpty && contacts.contains(where: { $0.name == novoNome && $0.id != idDigitado }) {
            print("Erro: Esse nome já está sendo usado!")
            return
        }
        
        print("Nova idade (atual: \(contacts[index].age)): ", terminator: "")
        let novaIdade = Int(readLine() ?? "") ?? contacts[index].age
        
        print("Novo telefone (atual: \(contacts[index].phone)): ", terminator: "")
        let novoTelefone = readLine() ?? contacts[index].phone
        
        print("Novo email (atual: \(contacts[index].email)): ", terminator: "")
        let novoEmail = readLine() ?? contacts[index].email
        
        // Atualiza os dados
        contacts[index].name = novoNome.isEmpty ? contacts[index].name : novoNome
        contacts[index].age = novaIdade
        contacts[index].phone = novoTelefone.isEmpty ? contacts[index].phone : novoTelefone
        contacts[index].email = novoEmail.isEmpty ? contacts[index].email : novoEmail
        
        print("✅ Contato alterado com sucesso!")
        
    } else {
        print("Erro: ID não encontrado!")
    }
}

// Remover contato
func remover() {
    print("\n--- Remover Contato ---")
    
    if contacts.isEmpty {
        print("Não há contatos para remover.")
        return
    }
    
    for c in contacts {
        print("\(c.id). \(c.name)")
    }
    
    print("\nDigite o ID do contato que quer remover: ", terminator: "")
    guard let idDigitado = Int(readLine() ?? "") else {
        print("ID inválido!")
        return
    }
    
    if let index = contacts.firstIndex(where: { $0.id == idDigitado }) {
        let nome = contacts[index].name
        contacts.remove(at: index)
        print("✅ Contato '\(nome)' removido com sucesso!")
    } else {
        print("Erro: ID não encontrado!")
    }
}

// ====================== PROGRAMA PRINCIPAL ======================

func main() {
    print("🚀 Sistema de Contatos iniciado!")
    
    while true {
        mostrarMenu()
        
        if let escolha = Int(readLine() ?? "") {
            switch escolha {
            case 1:
                cadastrar()
            case 2:
                listar()
            case 3:
                alterar()
            case 4:
                remover()
            case 5:
                print("\n👋 Programa finalizado. Até mais!")
                return
            default:
                print("Opção inválida! Escolha de 1 a 5.")
            }
        } else {
            print("Por favor, digite um número.")
        }
        
        print("\nPressione Enter para continuar...")
        _ = readLine()
    }
}

// Inicia o programa
main()