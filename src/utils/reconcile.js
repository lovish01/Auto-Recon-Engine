// Enhanced reconciliation logic with optional fuzzy text match and grouping
function normalize(val) {
  if (val == null) return '';
  if (typeof val === 'number') return String(val);
  return String(val).trim().toLowerCase();
}

function parseAmount(val) {
  if (val == null || val === '') return null;
  const n = Number(String(val).replace(/[,\s]/g, ''));
  return isNaN(n) ? null : n;
}

function dateKey(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d.getTime())) return normalize(v);
  return d.toISOString().slice(0,10);
}

// Lightweight Levenshtein similarity (0..1)
function lev(a, b) {
  a = normalize(a); b = normalize(b);
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
  for (let i=0;i<=m;i++) dp[i][0]=i;
  for (let j=0;j<=n;j++) dp[0][j]=j;
  for (let i=1;i<=m;i++){
    for (let j=1;j<=n;j++){
      const cost = a[i-1]===b[j-1]?0:1;
      dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
    }
  }
  const dist = dp[m][n];
  const maxlen = Math.max(m,n) || 1;
  return 1 - (dist/maxlen);
}

export function reconcile(source1, source2, rules) {
  const {
    keys = [],
    amountTolerance = 0,
    amountField = 'amount',
    fuzzyField = null,
    fuzzyThreshold = 0.9,
    groupBy = [], // optional list of fields to group on for group-level check
  } = rules || {};

  const keyFns = {
    text: normalize,
    date: dateKey,
    amount: (v) => {
      const n = parseAmount(v);
      return n == null ? '' : n.toFixed(2);
    },
  };

  const buildKey = (row) => {
    const parts = keys.map(k => {
      const { field, type='text' } = k;
      const v = row[field];
      const f = keyFns[type] || keyFns.text;
      return f(v);
    });
    return parts.join('|');
  };

  const s2Map = new Map();
  const unmatched1 = [];
  const unmatched2 = [];
  const matched = [];
  const exceptions = [];

  source2.forEach((row, idx) => {
    const key = buildKey(row);
    if (!s2Map.has(key)) s2Map.set(key, []);
    s2Map.get(key).push({ row, idx, taken: false });
  });

  function findFuzzyCandidate(row) {
    if (!fuzzyField) return null;
    let best = null;
    let bestScore = 0;
    const target = row[fuzzyField];
    for (const [, arr] of s2Map.entries()) {
      for (const cand of arr) {
        if (cand.taken) continue;
        const s = lev(target, cand.row[fuzzyField]);
        if (s >= fuzzyThreshold && s > bestScore) {
          best = cand;
          bestScore = s;
        }
      }
    }
    return best;
  }

  // Try direct key matches first
  source1.forEach((row, idx) => {
    const key = buildKey(row);
    const candidates = s2Map.get(key) || [];
    // amount check
    let chosen = null;
    const a1 = parseAmount(row[amountField]);
    for (const cand of candidates) {
      if (cand.taken) continue;
      const a2 = parseAmount(cand.row[amountField]);
      const within = (a1 == null || a2 == null) ? true : Math.abs(a1 - a2) <= amountTolerance;
      if (within) { chosen = cand; break; }
    }

    if (chosen) {
      chosen.taken = true;
      matched.push({ left: row, right: chosen.row, via: 'key' });
    } else {
      // fallback to fuzzy if enabled
      const fuzzyCand = findFuzzyCandidate(row);
      if (fuzzyCand) {
        // still check amount tolerance
        const a2 = parseAmount(fuzzyCand.row[amountField]);
        const within = (a1 == null || a2 == null) ? true : Math.abs(a1 - a2) <= amountTolerance;
        if (within) {
          fuzzyCand.taken = true;
          matched.push({ left: row, right: fuzzyCand.row, via: 'fuzzy' });
          return;
        } else {
          exceptions.push({ left: row, rights: [fuzzyCand.row], reason: `Fuzzy match but amount mismatch (> ${amountTolerance})` });
          return;
        }
      }
      unmatched1.push({ row, idx, reason: 'No match' });
    }
  });

  // remaining s2 rows not taken are unmatched
  for (const [, arr] of s2Map.entries()) {
    for (const cand of arr) {
      if (!cand.taken) unmatched2.push({ row: cand.row, idx: cand.idx, reason: 'No counterpart from Source 1' });
    }
  }

  // Optional grouping: produce group-level summary by fields (sum amounts)
  let groupSummary = [];
  if (groupBy && groupBy.length > 0) {
    const keyOf = (r) => groupBy.map(f => normalize(r[f])).join('|');
    const sumBy = (rows) => rows.reduce((acc,r) => acc + (parseAmount(r[amountField]) ?? 0), 0);
    const g1 = new Map();
    const g2 = new Map();
    source1.forEach(r => {
      const k = keyOf(r);
      if (!g1.has(k)) g1.set(k, []);
      g1.get(k).push(r);
    });
    source2.forEach(r => {
      const k = keyOf(r);
      if (!g2.has(k)) g2.set(k, []);
      g2.get(k).push(r);
    });
    const keysSet = new Set([...g1.keys(), ...g2.keys()]);
    for (const k of keysSet) {
      const rowsA = g1.get(k) || [];
      const rowsB = g2.get(k) || [];
      const sumA = sumBy(rowsA);
      const sumB = sumBy(rowsB);
      const diff = Math.abs(sumA - sumB);
      groupSummary.push({ groupKey: k, sumSource1: sumA, sumSource2: sumB, difference: diff, withinTolerance: diff <= amountTolerance });
    }
  }

  const summary = {
    total1: source1.length,
    total2: source2.length,
    matched: matched.length,
    unmatched1: unmatched1.length,
    unmatched2: unmatched2.length,
    exceptions: exceptions.length,
    matchRate: (source1.length === 0) ? 0 : Math.round((matched.length / source1.length) * 100)
  };

  return { matched, unmatched1, unmatched2, exceptions, summary, groupSummary };
}
