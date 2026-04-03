/**
 * Cloud Function: Parse Lattes CV (XML) and extract publications/projects/supervisions
 * Triggered by: HTTP (upload from React component)
 */

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import xml2js from 'xml2js'

const db = admin.firestore()
const bucket = admin.storage().bucket()

interface LattesPublication {
  title: string
  year: number
  venue: string
  type: 'artigo' | 'livro' | 'capitulo' | 'evento'
  doi?: string
  issn?: string
}

interface LattesSupervision {
  name: string
  level: 'mestrado' | 'doutorado'
  status: 'concluida' | 'andamento'
  year?: number
}

interface LattesProject {
  title: string
  startYear: number
  endYear?: number
  status: 'ativo' | 'concluido'
}

/**
 * Parse ARTIGO-PUBLICADO nodes from Lattes XML
 */
function parseArtigos(producaoNodes: any[]): LattesPublication[] {
  const artigos: LattesPublication[] = []

  if (!Array.isArray(producaoNodes)) return artigos

  producaoNodes.forEach(node => {
    if (node['$']?.['SEQUENCIA-PRODUCAO'] === 'ARTIGO-PUBLICADO') {
      const details = node['DETALHE-PRODUCAO']?.[0]
      if (details) {
        artigos.push({
          title: details['$']?.['TITULO'] || '',
          year: parseInt(details['$']?.['ANO-PUBLICACAO'] || '0'),
          venue: details['$']?.['NOME-PERIODICO'] || details['$']?.['VEÍCULO-DE-PUBLICACAO'] || '',
          type: 'artigo',
          doi: details['$']?.['DOI'] || undefined,
          issn: details['$']?.['ISSN'] || undefined,
        })
      }
    }
  })

  return artigos
}

/**
 * Parse LIVRO-PUBLICADO and CAPITULO-DE-LIVRO nodes
 */
function parseLibros(producaoNodes: any[]): LattesPublication[] {
  const libros: LattesPublication[] = []

  if (!Array.isArray(producaoNodes)) return libros

  producaoNodes.forEach(node => {
    const tipo = node['$']?.['SEQUENCIA-PRODUCAO']
    const details = node['DETALHE-PRODUCAO']?.[0]

    if ((tipo === 'LIVRO-PUBLICADO' || tipo === 'CAPITULO-DE-LIVRO') && details) {
      libros.push({
        title: details['$']?.['TITULO'] || '',
        year: parseInt(details['$']?.['ANO'] || '0'),
        venue: details['$']?.['NOME-DA-EDITORA'] || '',
        type: tipo === 'CAPITULO-DE-LIVRO' ? 'capitulo' : 'livro',
        doi: details['$']?.['DOI'] || undefined,
      })
    }
  })

  return libros
}

/**
 * Parse TRABALHO-EM-EVENTOS
 */
function parseEventos(producaoNodes: any[]): LattesPublication[] {
  const eventos: LattesPublication[] = []

  if (!Array.isArray(producaoNodes)) return eventos

  producaoNodes.forEach(node => {
    if (node['$']?.['SEQUENCIA-PRODUCAO'] === 'TRABALHO-EM-EVENTOS') {
      const details = node['DETALHE-PRODUCAO']?.[0]
      if (details) {
        eventos.push({
          title: details['$']?.['TITULO-DO-TRABALHO'] || '',
          year: parseInt(details['$']?.['ANO'] || '0'),
          venue: details['$']?.['NOME-DO-EVENTO'] || '',
          type: 'evento',
          doi: details['$']?.['DOI'] || undefined,
        })
      }
    }
  })

  return eventos
}

/**
 * Main parser function
 */
async function parseLattes(xmlContent: string): Promise<{
  publications: LattesPublication[]
  orcid?: string
  lattesId?: string
}> {
  try {
    const parser = new xml2js.Parser()
    const jsonData = await parser.parseStringPromise(xmlContent)

    const dadosGerais = jsonData['CURRICULO-VITAE']?.['DADOS-GERAIS']?.[0]?.['$'] || {}
    const producao = jsonData['CURRICULO-VITAE']?.['PRODUCAO-BIBLIOGRAFICA']?.[0]?.['ARTIGOS-PUBLICADOS']?.[0]
      ?.['ARTIGO-PUBLICADO'] || []

    const orcid = dadosGerais['ORCID-DO-AUTOR']
    const lattesId = dadosGerais['NUMERO-IDENTIFICADOR']

    // Extract all publication types
    const artigos = parseArtigos(producao)
    const libros = parseLibros(producao)
    const eventos = parseEventos(producao)

    const publications = [...artigos, ...libros, ...eventos].sort((a, b) => b.year - a.year)

    return {
      publications,
      orcid,
      lattesId,
    }
  } catch (error) {
    console.error('Error parsing Lattes XML:', error)
    throw new functions.https.HttpsError('invalid-argument', 'Failed to parse Lattes XML format')
  }
}

/**
 * HTTP Cloud Function: Parse uploaded Lattes XML and return diff
 * POST /lattes-parser
 * Body: { userId: string, xmlContent: string }
 */
export const lattesParser = functions
  .region('southamerica-east1')
  .https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User not authenticated')
    }

    const { userId, xmlContent } = data

    if (!userId || !xmlContent) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing userId or xmlContent')
    }

    // Parse Lattes XML
    const parsed = await parseLattes(xmlContent)

    // Fetch existing profile publications to show diff
    const existingPubs = await db
      .collection('publications')
      .where('authorIds', 'array-contains', userId)
      .get()

    const existingTitles = new Set(existingPubs.docs.map(doc => doc.data().title))

    const newPublications = parsed.publications.filter(pub => !existingTitles.has(pub.title))

    return {
      success: true,
      parsed,
      newCount: newPublications.length,
      newPublications,
      diff: {
        new: newPublications,
        existing: parsed.publications.length - newPublications.length,
      },
    }
  })
