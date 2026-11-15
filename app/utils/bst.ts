// Pure tree logic: building, laying out, searching and traversing a BST.
// No Vue here, so it is easy to unit-test.

export interface BstNode {
  value: number
  left: BstNode | null
  right: BstNode | null
  depth: number
}

function insertNode(node: BstNode | null, value: number, depth: number): BstNode {
  if (!node) return { value, left: null, right: null, depth }
  if (value < node.value) node.left = insertNode(node.left, value, depth + 1)
  else if (value > node.value) node.right = insertNode(node.right, value, depth + 1)
  return node // duplicates are ignored
}

/** Builds a BST by inserting the values in order. */
export function buildBst(values: number[]): BstNode | null {
  let root: BstNode | null = null
  for (const v of values) root = insertNode(root, v, 0)
  return root
}

export interface LaidNode { value: number; x: number; y: number; depth: number }
export interface LaidEdge { key: string; from: number; to: number; x1: number; y1: number; x2: number; y2: number }

/** Positions nodes for drawing: x by in-order rank, y by depth. */
export function layoutTree(values: number[], width = 480, levelGap = 84, pad = 32) {
  const root = buildBst(values)
  const inOrder: BstNode[] = []
  const walk = (n: BstNode | null) => {
    if (!n) return
    walk(n.left)
    inOrder.push(n)
    walk(n.right)
  }
  walk(root)

  const count = inOrder.length
  const stepX = count > 1 ? (width - 2 * pad) / (count - 1) : 0
  const pos = new Map<number, LaidNode>()
  inOrder.forEach((n, i) => {
    pos.set(n.value, { value: n.value, x: count > 1 ? pad + i * stepX : width / 2, y: pad + n.depth * levelGap, depth: n.depth })
  })

  const edges: LaidEdge[] = []
  const addEdges = (n: BstNode) => {
    for (const c of [n.left, n.right]) {
      if (!c) continue
      const a = pos.get(n.value)!
      const b = pos.get(c.value)!
      edges.push({ key: `${n.value}-${c.value}`, from: n.value, to: c.value, x1: a.x, y1: a.y, x2: b.x, y2: b.y })
      addEdges(c)
    }
  }
  if (root) addEdges(root)

  const maxDepth = Math.max(0, ...inOrder.map(n => n.depth))
  return { nodes: [...pos.values()], edges, width, height: pad * 2 + maxDepth * levelGap }
}

export interface SearchStep { value: number; result: 'left' | 'right' | 'found' }

/** Follows the BST search path for target. */
export function searchBst(values: number[], target: number) {
  const steps: SearchStep[] = []
  let n = buildBst(values)
  while (n) {
    if (target === n.value) {
      steps.push({ value: n.value, result: 'found' })
      return { steps, found: true }
    }
    const goLeft = target < n.value
    steps.push({ value: n.value, result: goLeft ? 'left' : 'right' })
    n = goLeft ? n.left : n.right
  }
  return { steps, found: false }
}

export type Order = 'bfs' | 'pre' | 'in' | 'post'

export interface TraceStep {
  current: number | null
  frontier: number[] // queue (BFS) or call stack (DFS), front/bottom first
  output: number[]
  line: number // pseudocode line to highlight, 1-based
  message: string
}

export const PSEUDOCODE: Record<Order, string[]> = {
  bfs: [
    'queue ← [root]',
    'while queue is not empty:',
    '  node ← queue.dequeue()',
    '  visit(node)',
    '  enqueue node.left, node.right (if they exist)',
  ],
  pre: ['dfs(node):', '  if node is null: return', '  visit(node)', '  dfs(node.left)', '  dfs(node.right)'],
  in: ['dfs(node):', '  if node is null: return', '  dfs(node.left)', '  visit(node)', '  dfs(node.right)'],
  post: ['dfs(node):', '  if node is null: return', '  dfs(node.left)', '  dfs(node.right)', '  visit(node)'],
}

/** Step-by-step trace of a traversal, for the stepper. */
export function traceTraversal(values: number[], order: Order): TraceStep[] {
  const root = buildBst(values)
  const steps: TraceStep[] = []
  if (!root) return steps

  if (order === 'bfs') {
    const queue: BstNode[] = [root]
    const out: number[] = []
    steps.push({ current: null, frontier: [root.value], output: [], line: 1, message: `Start: the root, ${root.value}, joins the queue.` })
    while (queue.length) {
      const n = queue.shift()!
      out.push(n.value)
      const kids = [n.left, n.right].filter((k): k is BstNode => k !== null)
      queue.push(...kids)
      const joined = kids.length
        ? `${kids.map(k => k.value).join(' and ')} ${kids.length === 1 ? 'joins' : 'join'} the back.`
        : 'It has no children.'
      steps.push({ current: n.value, frontier: queue.map(k => k.value), output: [...out], line: 4, message: `${n.value} leaves the front of the queue and is visited. ${joined}` })
    }
  } else {
    const visitLine = { pre: 3, in: 4, post: 5 }[order]
    const why = {
      pre: (v: number) => `Visit ${v} first, before its subtrees.`,
      in: (v: number) => `${v}'s left side is done, so visit ${v}, then go right.`,
      post: (v: number) => `Both subtrees of ${v} are done, so visit ${v} last.`,
    }[order]
    const out: number[] = []
    steps.push({ current: null, frontier: [], output: [], line: 1, message: `Start: call dfs(${root.value}). Each call goes on the stack.` })
    const rec = (n: BstNode, path: number[]) => {
      const stack = [...path, n.value]
      const visit = () => {
        out.push(n.value)
        steps.push({ current: n.value, frontier: stack, output: [...out], line: visitLine, message: why(n.value) })
      }
      if (order === 'pre') visit()
      if (n.left) rec(n.left, stack)
      if (order === 'in') visit()
      if (n.right) rec(n.right, stack)
      if (order === 'post') visit()
    }
    rec(root, [])
  }

  steps[steps.length - 1]!.message += ' Done: every node was visited once.'
  return steps
}

/** Just the final visit order, e.g. for the summary cheat sheet. */
export function traversalOrder(values: number[], order: Order): number[] {
  return traceTraversal(values, order).at(-1)?.output ?? []
}

export interface TreeFact {
  value: number
  parent: number | null
  side: 'left' | 'right' | null
  left: number | null
  right: number | null
  depth: number
}

/** One fact per node, in level order (root first). Used for text descriptions. */
export function treeFacts(values: number[]): TreeFact[] {
  const root = buildBst(values)
  const out: TreeFact[] = []
  if (!root) return out
  const queue: { n: BstNode, parent: number | null, side: 'left' | 'right' | null }[] = [{ n: root, parent: null, side: null }]
  while (queue.length) {
    const { n, parent, side } = queue.shift()!
    out.push({ value: n.value, parent, side, left: n.left?.value ?? null, right: n.right?.value ?? null, depth: n.depth })
    if (n.left) queue.push({ n: n.left, parent: n.value, side: 'left' })
    if (n.right) queue.push({ n: n.right, parent: n.value, side: 'right' })
  }
  return out
}

/** Plain-English sentence describing where a node sits, e.g. "left child of 50, level 1". */
export function describeNode(f: TreeFact): string {
  const where = f.parent === null ? 'the root' : `${f.side} child of ${f.parent}`
  const kids = [f.left !== null ? `left child ${f.left}` : '', f.right !== null ? `right child ${f.right}` : ''].filter(Boolean)
  return `${where}, level ${f.depth}, ${kids.length ? kids.join(' and ') : 'a leaf (no children)'}`
}

/** Path from the root to where `value` would be inserted (empty if already in the tree). */
export function insertPath(values: number[], value: number) {
  const r = searchBst(values, value)
  return r.found ? null : r.steps
}
