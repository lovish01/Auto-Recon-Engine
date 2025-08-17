import express from 'express'
import cors from 'cors'
import { reconcile } from './reconcile.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.post('/api/reconcile', (req, res) => {
  const { source1 = [], source2 = [], rules = {} } = req.body || {}
  try {
    const result = reconcile(source1, source2, rules)
    res.json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Reconciliation failed', details: String(e) })
  }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
