import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import type { User as FirebaseUser } from 'firebase/auth'
import { db } from '@/config/firebase'
import { EMAIL_SECRETARIA } from '@/config/constants'
import type { User, UserProfile, Role } from '@/types'
import { ROLES } from '@/types'

const ALL_ROLES_ARR: Role[] = [...ROLES]

function isInstitutionalSecretariaEmail(email: string | null | undefined): boolean {
  return email != null && email.toLowerCase().trim() === EMAIL_SECRETARIA.toLowerCase()
}

function needsInstitutionalRoleFix(email: string | null | undefined, roles: Role[]): boolean {
  if (!isInstitutionalSecretariaEmail(email)) return false
  if (roles.length !== ROLES.length) return true
  const set = new Set(roles)
  return !ROLES.every((r) => set.has(r))
}

export function toUserProfile(id: string, data: Partial<User>): UserProfile {
  return {
    id,
    email: data.email ?? '',
    nome: data.nome ?? '',
    roles: (data.roles as Role[]) ?? ['Externo'],
    status: (data.status as UserProfile['status']) ?? 'Ativo',
    telefone: data.telefone,
    celular: data.celular,
    endereco: data.endereco,
    emergenciaNome: data.emergenciaNome,
    emergenciaTel: data.emergenciaTel,
    fotoUrl: data.fotoUrl,
    dataIngresso: data.dataIngresso,
    creditosTotais: data.creditosTotais,
    dataDefesa: data.dataDefesa,
    dataQualificacao: data.dataQualificacao,
    dataIntegralizacao: data.dataIntegralizacao,
    nomeOrientador: data.nomeOrientador,
    emailOrientador: data.emailOrientador,
    nivel: data.nivel,
    creditosOptativas: data.creditosOptativas,
    creditosObrigatorias: data.creditosObrigatorias,
    dataDefesaRealizada: data.dataDefesaRealizada,
    cpf: data.cpf,
    rg: data.rg,
    rgOrgao: data.rgOrgao,
    rgDataEmissao: data.rgDataEmissao,
    dataNascimento: data.dataNascimento,
    sexo: data.sexo,
    raca: data.raca,
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento,
    bairro: data.bairro,
    cidade: data.cidade,
    uf: data.uf,
    cep: data.cep,
    prazoAcesso: data.prazoAcesso,
    docenteCredenciamentoReuniao: data.docenteCredenciamentoReuniao,
    docenteCategoria: data.docenteCategoria,
    docentePodeOrientar: data.docentePodeOrientar,
    createdAt: data.createdAt
      ? (data.createdAt as unknown as { toDate: () => Date }).toDate()
      : new Date(),
    updatedAt: data.updatedAt
      ? (data.updatedAt as unknown as { toDate: () => Date }).toDate()
      : new Date(),
  }
}

/**
 * Carrega perfil do Firestore. Opcionalmente força novo token após mudança de claims.
 */
export async function loadUserProfile(
  firebaseUser: FirebaseUser,
  options?: { forceRefreshToken?: boolean },
): Promise<UserProfile> {
  if (options?.forceRefreshToken) {
    await firebaseUser.getIdToken(true)
  }

  const userRef = doc(db, 'users', firebaseUser.uid)
  const userDoc = await getDoc(userRef)

  if (userDoc.exists()) {
    const data = userDoc.data() as Partial<User>
    let profile = toUserProfile(firebaseUser.uid, data)
    if (needsInstitutionalRoleFix(firebaseUser.email, profile.roles)) {
      await updateDoc(userRef, { roles: ALL_ROLES_ARR, updatedAt: serverTimestamp() })
      profile = toUserProfile(firebaseUser.uid, { ...data, roles: ALL_ROLES_ARR })
    }
    return profile
  }

  if (isInstitutionalSecretariaEmail(firebaseUser.email)) {
    const emailNorm = firebaseUser.email!.toLowerCase().trim()
    await setDoc(userRef, {
      email: emailNorm,
      nome: firebaseUser.displayName ?? 'PPGPsi',
      roles: ALL_ROLES_ARR,
      status: 'Ativo',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    const snap = await getDoc(userRef)
    return toUserProfile(firebaseUser.uid, snap.data() as Partial<User>)
  }

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    nome: firebaseUser.displayName ?? 'Visitante',
    roles: ['Externo'],
    status: 'Ativo',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
