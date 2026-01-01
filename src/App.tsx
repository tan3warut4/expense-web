import { useEffect, useState } from 'react'
import './App.css'

type Expense = {
  id: number;
  title: string;
  amount: string;
  category: string | null;
  spent_at: string;
  note: string | null;
}
type NewExpense = {
  title: string;
  amount: string;
  category: string | null;
  spent_at: string;
  note: string;
}

const API_BASE = "http://localhost";

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<NewExpense>({
    title: "",
    amount: "",
    category: "Food",
    spent_at: new Date().toISOString().slice(0, 10),
    note: "",
  })
  const loadExpenses = async () => {
    setError("")
    try {
      const res = await fetch(`${API_BASE}/api/expenses`);
      if (!res.ok) throw new Error(await res.text());
      const data: Expense[] = await res.json();
      setExpenses(data);
    }
    catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category || null,
        spent_at: form.spent_at,
        note: form.note || null
      }
      const res = await fetch(`${API_BASE}/api/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text())

      setForm((f) => ({ ...f, title: "", amount: "", note: "" }))
      await loadExpenses();
    }
    catch (e) {
      setError(String(e));
    }
    finally {
      setLoading(false)
    }

  }

  return (
    <>
      <div style={{ padding: 24 }}>
        <h1>Expenses</h1>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginBottom: 24 }}>
          <input
            placeholder='Title (e.g. Lunch)'
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            type="date"
            value={form.spent_at}
            onChange={(e) => setForm({ ...form, spent_at: e.target.value })}
          />
          <input
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          <button disabled={loading || !form.title || !form.amount} type='submit'>
            {loading ? "Saving..." : "Add Expense"}
          </button>
        </form>

        {error && <pre>{error}</pre>}
        <ul>
          {expenses.map((e) => (
            <li key={e.id}>
            {e.title} — {e.amount} ({e.spent_at}) {e.category ? `- ${e.category}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default App
