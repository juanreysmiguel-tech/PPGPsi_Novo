import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getFinancialByRequest, getAllFinancialRecords,
  createFinancialRecord, confirmDeposit,
} from '@/services/firestore/financial'
import type { BankDetails } from '@/types'

const STALE = 5 * 60 * 1000

const keys = {
  all: ['financial'] as const,
  byRequest: (rid: string) => ['financial', 'byRequest', rid] as const,
}

export function useFinancialByRequest(requestId: string) {
  return useQuery({
    queryKey: keys.byRequest(requestId),
    queryFn: () => getFinancialByRequest(requestId),
    staleTime: STALE,
    enabled: !!requestId,
  })
}

export function useAllFinancialRecords() {
  return useQuery({
    queryKey: keys.all,
    queryFn: getAllFinancialRecords,
    staleTime: STALE,
  })
}

export function useCreateFinancialRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      idSolicitacao: string
      valor: number
      rubrica: string
      descricao: string
      dadosBancarios?: BankDetails
    }) => createFinancialRecord(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial'] }) },
  })
}

export function useConfirmDeposit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; comprovanteUrl: string }) =>
      confirmDeposit(vars.id, vars.comprovanteUrl),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financial'] }) },
  })
}
