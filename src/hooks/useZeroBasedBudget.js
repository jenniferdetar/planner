import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// [name, default_monthly_amount]
const DEFAULT_SECTIONS = [
  {
    section: 'Housing',
    envelopes: [
      ['Mortgage', 2025],
      ['HOA', 600],
      ['HELOC (California Credit Union)', 357],
      ['Spectrum', 197],
      ['Verizon', 274],
      ['DWP', 100],
      ['ADT', 32],
      ['Orkin', 50],
      ['Laundry', 80],
      ['Amazon Prime', 12],
      ['Amazon Purchases', 0],
      ['Ana', 180],
    ],
  },
  {
    section: 'Transport',
    envelopes: [
      ['Auto Loan', 239],
      ['Gas', 600],
      ['Mercury Auto Insurance', 175],
      ['Metrolink Monthly Pass', 107],
      ['Auto Maintenance', 100],
      ['Equinox Registration', 34],
      ['Tahoe Registration', 17],
      ["Tahoe's Major Repairs", 200],
    ],
  },
  {
    section: 'Food',
    envelopes: [['Groceries', 600]],
  },
  {
    section: 'Personal',
    envelopes: [['Hair (Cheap)', 50], ['Hair (Expensive)', 0], ['Clothing', 0]],
  },
  {
    section: 'Fun Money',
    envelopes: [['Blow', 200]],
  },
  {
    section: 'Medical',
    envelopes: [['HSA', 200]],
  },
  {
    section: 'Emergency Fund',
    envelopes: [['Summer Saver', 400]],
  },
  {
    section: 'Debt Payments',
    envelopes: [
      ['Debt Consolidation', 631],
      ["Jennifer's Student Loans - NelNet", 25],
      ["Jennifer's Student Loans - Sallie Mae", 202],
      ['Schools First Loan', 0],
    ],
  },
  {
    section: 'Savings',
    envelopes: [['Savings', 0]],
  },
]

export function useZeroBasedBudget(userId, month) {
  const [paychecks, setPaychecks] = useState([])
  const [envelopes, setEnvelopes] = useState([])
  const [allocations, setAllocations] = useState([])
  const [spending, setSpending] = useState([])
  const [loading, setLoading] = useState(true)

  // Derive month date range
  const monthStart = month + '-01'
  const [year, mon] = month.split('-').map(Number)
  const nextMonth = mon === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(mon + 1).padStart(2, '0')}-01`
  const monthEnd = nextMonth

  const fetchAll = useCallback(async () => {
    if (!userId || !month) return
    setLoading(true)

    // Fetch envelopes (all, not month-filtered)
    const { data: envData } = await supabase
      .from('budget_envelopes')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })

    let finalEnvelopes = envData || []

    // Seed defaults if no envelopes exist
    if (finalEnvelopes.length === 0) {
      const toInsert = []
      let sortOrder = 0
      for (const group of DEFAULT_SECTIONS) {
        for (const [name, default_amount] of group.envelopes) {
          toInsert.push({ user_id: userId, name, section: group.section, sort_order: sortOrder++, default_amount })
        }
      }
      const { data: seeded } = await supabase
        .from('budget_envelopes')
        .insert(toInsert)
        .select()
      finalEnvelopes = seeded || []
    }

    setEnvelopes(finalEnvelopes)

    // Fetch paychecks for this month
    const { data: pcData } = await supabase
      .from('paychecks')
      .select('*')
      .eq('user_id', userId)
      .gte('pay_date', monthStart)
      .lt('pay_date', monthEnd)
      .order('pay_date', { ascending: true })

    setPaychecks(pcData || [])

    // Fetch allocations for paychecks in this month
    // We need paycheck ids from this month
    const pcIds = (pcData || []).map(p => p.id)

    let allocData = []
    if (pcIds.length > 0) {
      const { data } = await supabase
        .from('budget_allocations')
        .select('*')
        .eq('user_id', userId)
        .in('paycheck_id', pcIds)
      allocData = data || []
    }
    setAllocations(allocData)

    // Fetch spending for this month
    const { data: spendData } = await supabase
      .from('budget_spending')
      .select('*')
      .eq('user_id', userId)
      .gte('spent_date', monthStart)
      .lt('spent_date', monthEnd)
      .order('spent_date', { ascending: false })

    setSpending(spendData || [])
    setLoading(false)
  }, [userId, month, monthStart, monthEnd])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // --- Paychecks ---
  async function addPaycheck(pay_date, amount) {
    const { data, error } = await supabase
      .from('paychecks')
      .insert({ user_id: userId, pay_date, amount: Number(amount) })
      .select()
      .single()
    if (error) { console.error(error); return }
    setPaychecks(prev => [...prev, data].sort((a, b) => a.pay_date.localeCompare(b.pay_date)))
  }

  async function deletePaycheck(id) {
    // Delete allocations first
    await supabase.from('budget_allocations').delete().eq('paycheck_id', id)
    await supabase.from('paychecks').delete().eq('id', id)
    setPaychecks(prev => prev.filter(p => p.id !== id))
    setAllocations(prev => prev.filter(a => a.paycheck_id !== id))
  }

  // --- Envelopes ---
  async function addEnvelope(name, section) {
    const sectionEnvelopes = envelopes.filter(e => e.section === section)
    const maxOrder = sectionEnvelopes.length > 0
      ? Math.max(...sectionEnvelopes.map(e => e.sort_order))
      : envelopes.length
    const { data, error } = await supabase
      .from('budget_envelopes')
      .insert({ user_id: userId, name, section, sort_order: maxOrder + 1 })
      .select()
      .single()
    if (error) { console.error(error); return }
    setEnvelopes(prev => [...prev, data])
  }

  async function deleteEnvelope(id) {
    await supabase.from('budget_allocations').delete().eq('envelope_id', id)
    await supabase.from('budget_spending').delete().eq('envelope_id', id)
    await supabase.from('budget_envelopes').delete().eq('id', id)
    setEnvelopes(prev => prev.filter(e => e.id !== id))
    setAllocations(prev => prev.filter(a => a.envelope_id !== id))
    setSpending(prev => prev.filter(s => s.envelope_id !== id))
  }

  async function addSection(sectionName) {
    // Just add a placeholder envelope in the new section
    const maxOrder = envelopes.length > 0
      ? Math.max(...envelopes.map(e => e.sort_order)) + 1
      : 0
    const { data, error } = await supabase
      .from('budget_envelopes')
      .insert({ user_id: userId, name: 'New Envelope', section: sectionName, sort_order: maxOrder })
      .select()
      .single()
    if (error) { console.error(error); return }
    setEnvelopes(prev => [...prev, data])
  }

  // --- Allocations ---
  // Save all allocations for a paycheck at once (upsert approach)
  // allocMap: { envelopeId: amount, ... }
  async function saveAllocations(paycheckId, allocMap) {
    // Delete existing allocations for this paycheck first
    await supabase.from('budget_allocations').delete().eq('paycheck_id', paycheckId)

    const rows = Object.entries(allocMap)
      .filter(([, amt]) => Number(amt) > 0)
      .map(([envelope_id, amount]) => ({
        user_id: userId,
        paycheck_id: paycheckId,
        envelope_id,
        amount: Number(amount),
      }))

    if (rows.length === 0) {
      setAllocations(prev => prev.filter(a => a.paycheck_id !== paycheckId))
      return
    }

    const { data, error } = await supabase
      .from('budget_allocations')
      .insert(rows)
      .select()
    if (error) { console.error(error); return }
    setAllocations(prev => [
      ...prev.filter(a => a.paycheck_id !== paycheckId),
      ...(data || []),
    ])
  }

  // Add a single allocation (kept for API completeness)
  async function addAllocation(paycheckId, envelopeId, amount) {
    const { data, error } = await supabase
      .from('budget_allocations')
      .insert({ user_id: userId, paycheck_id: paycheckId, envelope_id: envelopeId, amount: Number(amount) })
      .select()
      .single()
    if (error) { console.error(error); return }
    setAllocations(prev => [...prev, data])
  }

  // --- Spending ---
  async function addSpending(envelopeId, amount, description, spent_date) {
    const { data, error } = await supabase
      .from('budget_spending')
      .insert({ user_id: userId, envelope_id: envelopeId, amount: Number(amount), description, spent_date })
      .select()
      .single()
    if (error) { console.error(error); return }
    setSpending(prev => [data, ...prev])
  }

  async function deleteSpending(id) {
    await supabase.from('budget_spending').delete().eq('id', id)
    setSpending(prev => prev.filter(s => s.id !== id))
  }

  return {
    paychecks,
    envelopes,
    allocations,
    spending,
    loading,
    addPaycheck,
    deletePaycheck,
    addEnvelope,
    deleteEnvelope,
    addSection,
    addAllocation,
    saveAllocations,
    addSpending,
    deleteSpending,
    refresh: fetchAll,
  }
}
