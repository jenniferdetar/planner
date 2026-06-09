import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTransactions(userId) {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('txn_date', { ascending: false })
      .limit(50)
      .then(({ data }) => setTransactions(data || []))
  }, [userId])

  async function addTransaction(fields) {
    const { data } = await supabase
      .from('financial_transactions')
      .insert({ ...fields, user_id: userId })
      .select().single()
    if (data) setTransactions(prev => [data, ...prev])
  }

  async function deleteTransaction(id) {
    await supabase.from('financial_transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  return { transactions, addTransaction, deleteTransaction }
}

export function useBills(userId) {
  const [bills, setBills] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })
      .then(({ data }) => setBills(data || []))
  }, [userId])

  async function addBill(fields) {
    const { data } = await supabase
      .from('bills')
      .insert({ ...fields, user_id: userId })
      .select().single()
    if (data) setBills(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function toggleBillPaid(id) {
    const bill = bills.find(b => b.id === id)
    const { data } = await supabase
      .from('bills')
      .update({ paid: !bill.paid })
      .eq('id', id)
      .select().single()
    if (data) setBills(prev => prev.map(b => b.id === id ? data : b))
  }

  async function deleteBill(id) {
    await supabase.from('bills').delete().eq('id', id)
    setBills(prev => prev.filter(b => b.id !== id))
  }

  return { bills, addBill, toggleBillPaid, deleteBill }
}

export function usePaychecks(userId) {
  const [paychecks, setPaychecks] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('paychecks')
      .select('*')
      .eq('user_id', userId)
      .order('pay_date', { ascending: false })
      .then(({ data }) => setPaychecks(data || []))
  }, [userId])

  async function addPaycheck(pay_date, amount) {
    const { data } = await supabase
      .from('paychecks')
      .insert({ user_id: userId, pay_date, amount, paid_bill_ids: [] })
      .select().single()
    if (data) setPaychecks(prev => [data, ...prev])
  }

  async function updatePaycheckAmount(id, amount) {
    const { data } = await supabase.from('paychecks').update({ amount }).eq('id', id).select().single()
    if (data) setPaychecks(prev => prev.map(p => p.id === id ? data : p))
  }

  async function togglePaycheckBill(id, billId) {
    const pc = paychecks.find(p => p.id === id)
    const ids = pc.paid_bill_ids || []
    const updated = ids.includes(billId) ? ids.filter(x => x !== billId) : [...ids, billId]
    const { data } = await supabase.from('paychecks').update({ paid_bill_ids: updated }).eq('id', id).select().single()
    if (data) setPaychecks(prev => prev.map(p => p.id === id ? data : p))
  }

  async function deletePaycheck(id) {
    await supabase.from('paychecks').delete().eq('id', id)
    setPaychecks(prev => prev.filter(p => p.id !== id))
  }

  return { paychecks, addPaycheck, updatePaycheckAmount, togglePaycheckBill, deletePaycheck }
}

  const [goals, setGoals] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setGoals(data || []))
  }, [userId])

  async function addGoal(fields) {
    const { data } = await supabase
      .from('financial_goals')
      .insert({ ...fields, user_id: userId })
      .select().single()
    if (data) setGoals(prev => [...prev, data])
  }

  async function updateGoalAmount(id, current_amount) {
    const { data } = await supabase
      .from('financial_goals')
      .update({ current_amount })
      .eq('id', id)
      .select().single()
    if (data) setGoals(prev => prev.map(g => g.id === id ? data : g))
  }

  async function deleteGoal(id) {
    await supabase.from('financial_goals').delete().eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  return { goals, addGoal, updateGoalAmount, deleteGoal }
}
