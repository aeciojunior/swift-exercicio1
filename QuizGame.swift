// Jogo de Perguntas - Versão Simples para Iniciantes

import SwiftUI

// =====================================================
// MARK: - DADOS DO JOGO
// Aqui ficam as perguntas organizadas por tema
// =====================================================

// Uma pergunta tem: texto, 4 opções e o índice da resposta certa (0, 1, 2 ou 3)
struct Pergunta {
    let texto: String
    let opcoes: [String]
    let respostaCorreta: Int
}

// Um tema tem: nome, emoji e lista de perguntas
struct Tema {
    let nome: String
    let emoji: String
    let perguntas: [Pergunta]
}

// Lista de temas disponíveis no jogo
let temas: [Tema] = [
    Tema(
        nome: "História",
        emoji: "📜",
        perguntas: [
            Pergunta(texto: "Em que ano o Brasil proclamou sua independência?",
                     opcoes: ["1808", "1822", "1889", "1500"],
                     respostaCorreta: 1),
            Pergunta(texto: "Quem foi o primeiro presidente do Brasil?",
                     opcoes: ["Getúlio Vargas", "Dom Pedro II", "Deodoro da Fonseca", "Floriano Peixoto"],
                     respostaCorreta: 2),
            Pergunta(texto: "Em que ano ocorreu a Revolução Francesa?",
                     opcoes: ["1776", "1789", "1804", "1815"],
                     respostaCorreta: 1),
            Pergunta(texto: "Em que ano terminou a Segunda Guerra Mundial?",
                     opcoes: ["1943", "1944", "1945", "1946"],
                     respostaCorreta: 2),
            Pergunta(texto: "Qual civilização construiu Machu Picchu?",
                     opcoes: ["Asteca", "Maia", "Inca", "Olmeca"],
                     respostaCorreta: 2),
            Pergunta(texto: "Em que ano caiu o Muro de Berlim?",
                     opcoes: ["1987", "1988", "1989", "1990"],
                     respostaCorreta: 2)
        ]
    ),
    Tema(
        nome: "Geografia",
        emoji: "🌎",
        perguntas: [
            Pergunta(texto: "Qual é o maior país do mundo em área?",
                     opcoes: ["China", "EUA", "Brasil", "Rússia"],
                     respostaCorreta: 3),
            Pergunta(texto: "Qual é o rio mais longo do mundo?",
                     opcoes: ["Amazonas", "Nilo", "Yangtze", "Mississippi"],
                     respostaCorreta: 1),
            Pergunta(texto: "Qual é a capital da Austrália?",
                     opcoes: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
                     respostaCorreta: 2),
            Pergunta(texto: "Qual é o menor país do mundo?",
                     opcoes: ["Mônaco", "San Marino", "Vaticano", "Liechtenstein"],
                     respostaCorreta: 2),
            Pergunta(texto: "Quantos países fazem fronteira com o Brasil?",
                     opcoes: ["8", "9", "10", "11"],
                     respostaCorreta: 2),
            Pergunta(texto: "Em qual oceano fica Madagascar?",
                     opcoes: ["Atlântico", "Pacífico", "Índico", "Ártico"],
                     respostaCorreta: 2)
        ]
    ),
    Tema(
        nome: "Ciências",
        emoji: "🔬",
        perguntas: [
            Pergunta(texto: "Qual é o símbolo químico do ouro?",
                     opcoes: ["Or", "Go", "Au", "Ag"],
                     respostaCorreta: 2),
            Pergunta(texto: "Quantos planetas tem o Sistema Solar?",
                     opcoes: ["7", "8", "9", "10"],
                     respostaCorreta: 1),
            Pergunta(texto: "Quem propôs a Teoria da Relatividade?",
                     opcoes: ["Newton", "Tesla", "Einstein", "Bohr"],
                     respostaCorreta: 2),
            Pergunta(texto: "O que é o ADN?",
                     opcoes: ["Ácido Desoxirribonucleico", "Ácido Dimetílico", "Adenina Desoxigenada", "Ácido Dinitrofenol"],
                     respostaCorreta: 0),
            Pergunta(texto: "Em que unidade se mede frequência?",
                     opcoes: ["Joule", "Pascal", "Hertz", "Newton"],
                     respostaCorreta: 2),
            Pergunta(texto: "Qual o número atômico do carbono?",
                     opcoes: ["6", "8", "12", "14"],
                     respostaCorreta: 0)
        ]
    ),
    Tema(
        nome: "Filmes",
        emoji: "🎬",
        perguntas: [
            Pergunta(texto: "Quem dirigiu 'O Poderoso Chefão'?",
                     opcoes: ["Spielberg", "Coppola", "Scorsese", "De Palma"],
                     respostaCorreta: 1),
            Pergunta(texto: "Em qual planeta se passa 'Duna'?",
                     opcoes: ["Marte", "Arrakis", "Caladan", "Pandora"],
                     respostaCorreta: 1),
            Pergunta(texto: "Quem interpreta Tony Stark no MCU?",
                     opcoes: ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo"],
                     respostaCorreta: 1),
            Pergunta(texto: "Em 'Matrix', qual pílula representa a verdade?",
                     opcoes: ["Azul", "Vermelha", "Verde", "Branca"],
                     respostaCorreta: 1),
            Pergunta(texto: "Quem compôs a trilha sonora de 'Star Wars'?",
                     opcoes: ["Hans Zimmer", "Danny Elfman", "John Williams", "Morricone"],
                     respostaCorreta: 2),
            Pergunta(texto: "Qual estúdio produziu 'Toy Story'?",
                     opcoes: ["DreamWorks", "Blue Sky", "Pixar", "Illumination"],
                     respostaCorreta: 2)
        ]
    )
]

// =====================================================
// MARK: - TELA INICIAL (escolha de tema)
// =====================================================

struct TelaInicial: View {
    var body: some View {
        // NavigationStack permite navegar entre telas usando NavigationLink
        NavigationStack {
            VStack(spacing: 20) {

                Text("🎯 Quiz Game")
                    .font(.largeTitle)
                    .bold()
                    .padding(.top, 20)

                Text("Escolha um tema para começar")
                    .foregroundStyle(.secondary)

                // ForEach cria uma view para cada tema da lista
                ForEach(temas, id: \.nome) { tema in
                    // NavigationLink: ao clicar, navega para TelaJogo
                    NavigationLink(destination: TelaJogo(tema: tema)) {
                        HStack {
                            Text(tema.emoji)
                                .font(.title2)
                            Text(tema.nome)
                                .font(.title3)
                                .bold()
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundStyle(.secondary)
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(12)
                    }
                    .buttonStyle(.plain) // Remove a cor azul padrão do link
                }

                Spacer()
            }
            .padding(.horizontal)
            .navigationTitle("Início")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// =====================================================
// MARK: - TELA DO JOGO
// =====================================================

struct TelaJogo: View {
    let tema: Tema // Recebe o tema escolhido na tela anterior

    // @State: variáveis que controlam o estado da tela
    // Quando mudam, o SwiftUI redesenha a tela automaticamente
    @State private var perguntas: [Pergunta] = []
    @State private var indiceAtual: Int = 0
    @State private var respostaSelecionada: Int? = nil  // nil = ainda não respondeu
    @State private var acertos: Int = 0
    @State private var jogoTerminou: Bool = false

    // Computed property: retorna a pergunta atual com base no índice
    var perguntaAtual: Pergunta {
        perguntas[indiceAtual]
    }

    var body: some View {
        VStack(spacing: 20) {

            // --- Progresso ---
            Text("Pergunta \(indiceAtual + 1) de \(perguntas.count)")
                .foregroundStyle(.secondary)

            ProgressView(value: Double(indiceAtual), total: Double(perguntas.count))

            // --- Texto da pergunta ---
            Text(perguntaAtual.texto)
                .font(.title3)
                .bold()
                .multilineTextAlignment(.center)
                .padding()
                .frame(maxWidth: .infinity)
                .background(Color(.systemGray6))
                .cornerRadius(12)

            // --- Opções de resposta (A, B, C, D) ---
            // 0..<4 gera os números 0, 1, 2, 3
            ForEach(0..<4, id: \.self) { i in
                BotaoOpcao(
                    texto: perguntaAtual.opcoes[i],
                    indice: i,
                    respostaSelecionada: respostaSelecionada,
                    respostaCorreta: perguntaAtual.respostaCorreta,
                    aoClicar: { responder(indice: i) }
                )
            }

            // --- Botão "Próxima" aparece somente após responder ---
            if respostaSelecionada != nil {
                Button(action: proximaPergunta) {
                    Text(indiceAtual + 1 < perguntas.count ? "Próxima →" : "Ver Resultado")
                        .bold()
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundStyle(.white)
                        .cornerRadius(12)
                }
            }

            Spacer()
        }
        .padding()
        .navigationTitle(tema.emoji + " " + tema.nome)
        .navigationBarTitleDisplayMode(.inline)
        // Navega para TelaResultado quando jogoTerminou muda para true
        .navigationDestination(isPresented: $jogoTerminou) {
            TelaResultado(acertos: acertos, total: perguntas.count)
        }
        // Executado quando a tela aparece: embaralha e pega 5 perguntas
        .onAppear {
            perguntas = Array(tema.perguntas.shuffled().prefix(5))
        }
    }

    // Chamado quando o jogador clica em uma opção
    func responder(indice: Int) {
        guard respostaSelecionada == nil else { return } // Ignora cliques duplos
        respostaSelecionada = indice
        if indice == perguntaAtual.respostaCorreta {
            acertos += 1
        }
    }

    // Chamado ao clicar no botão "Próxima"
    func proximaPergunta() {
        if indiceAtual + 1 < perguntas.count {
            indiceAtual += 1
            respostaSelecionada = nil // Limpa a seleção para a próxima pergunta
        } else {
            jogoTerminou = true
        }
    }
}

// =====================================================
// MARK: - BOTÃO DE OPÇÃO
// Componente separado para deixar TelaJogo mais limpa
// =====================================================

struct BotaoOpcao: View {
    let texto: String
    let indice: Int
    let respostaSelecionada: Int?
    let respostaCorreta: Int
    let aoClicar: () -> Void

    // Calcula a cor do botão com base no estado atual
    var corFundo: Color {
        // Se ainda não respondeu, todos ficam cinza
        guard let selecionada = respostaSelecionada else {
            return Color(.systemGray6)
        }
        // Se é a resposta certa: verde
        if indice == respostaCorreta { return Color.green.opacity(0.3) }
        // Se foi a escolhida e está errada: vermelho
        if indice == selecionada    { return Color.red.opacity(0.3) }
        // Demais opções: cinza
        return Color(.systemGray6)
    }

    // Ícone que aparece à direita depois de responder
    var icone: String? {
        guard respostaSelecionada != nil else { return nil }
        if indice == respostaCorreta   { return "checkmark.circle.fill" }
        if indice == respostaSelecionada { return "xmark.circle.fill" }
        return nil
    }

    var body: some View {
        Button(action: aoClicar) {
            HStack {
                Text(texto)
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.leading)
                Spacer()
                if let icone = icone {
                    Image(systemName: icone)
                        .foregroundStyle(indice == respostaCorreta ? .green : .red)
                }
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(corFundo)
            .cornerRadius(12)
        }
        .disabled(respostaSelecionada != nil) // Desabilita todos após responder
    }
}

// =====================================================
// MARK: - TELA DE RESULTADO
// =====================================================

struct TelaResultado: View {
    let acertos: Int
    let total: Int

    // dismiss() permite voltar para a tela anterior programaticamente
    @Environment(\.dismiss) var dismiss

    var erros: Int { total - acertos }

    // Emoji e mensagem mudam conforme a pontuação
    var emoji: String {
        switch acertos {
        case total:       return "🏆"
        case 4...:        return "🥇"
        case 3...:        return "🥈"
        case 2...:        return "🥉"
        default:          return "📚"
        }
    }

    var mensagem: String {
        switch acertos {
        case total:   return "Perfeito! Parabéns!"
        case 4...:    return "Excelente!"
        case 3...:    return "Muito bom!"
        case 2...:    return "Continue praticando!"
        default:      return "Não desista, tente de novo!"
        }
    }

    var body: some View {
        VStack(spacing: 30) {

            Spacer()

            Text(emoji).font(.system(size: 80))

            Text(mensagem)
                .font(.title2)
                .bold()

            // Placar de acertos e erros
            VStack(spacing: 12) {
                LinhaResultado(rotulo: "✅ Acertos", valor: acertos, cor: .green)
                Divider()
                LinhaResultado(rotulo: "❌ Erros",   valor: erros,   cor: .red)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(16)
            .padding(.horizontal)

            Spacer()

            // Botão para voltar ao início e jogar de novo
            Button(action: voltarAoInicio) {
                Text("Jogar Novamente")
                    .bold()
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundStyle(.white)
                    .cornerRadius(12)
            }
            .padding(.horizontal)
            .padding(.bottom, 30)
        }
        .navigationTitle("Resultado")
        .navigationBarBackButtonHidden(true) // Esconde o "<Voltar" automático
    }

    // Volta duas telas: de Resultado → Jogo → Início
    func voltarAoInicio() {
        dismiss()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
            dismiss()
        }
    }
}

// Linha de resultado: "✅ Acertos   5"
struct LinhaResultado: View {
    let rotulo: String
    let valor: Int
    let cor: Color

    var body: some View {
        HStack {
            Text(rotulo).font(.title3)
            Spacer()
            Text("\(valor)").font(.title3).bold().foregroundStyle(cor)
        }
    }
}

// =====================================================
// MARK: - PONTO DE ENTRADA DO APP
// =====================================================

// @main indica ao Xcode que este é o início do app
@main
struct QuizGameApp: App {
    var body: some Scene {
        WindowGroup {
            TelaInicial()
        }
    }
}