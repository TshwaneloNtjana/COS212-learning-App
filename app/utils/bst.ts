// Pure tree logic: building, laying out, searching and breadth-first traversal of a BST.
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

/** All nodes in level order (uses a queue, like BFS). */
function levelOrder(root: BstNode | null): BstNode[] {
  const out: BstNode[] = []
  const queue = root ? [root] : []
  while (queue.length) {
    const n = queue.shift()!
    out.push(n)
    if (n.left) queue.push(n.left)
    if (n.right) queue.push(n.right)
  }
  return out
}

/** Positions nodes for drawing: x by value rank (smallest on the left), y by depth. */
export function layoutTree(values: number[], width = 480, levelGap = 84, pad = 32) {
  const root = buildBst(values)
  const nodes = levelOrder(root)
  // In a BST, left-to-right position is simply the order of the values.
  const ranked = [...nodes].sort((a, b) => a.value - b.value)

  const count = ranked.length
  const stepX = count > 1 ? (width - 2 * pad) / (count - 1) : 0
  const pos = new Map<number, LaidNode>()
  ranked.forEach((n, i) => {
    pos.set(n.value, { value: n.value, x: count > 1 ? pad + i * stepX : width / 2, y: pad + n.depth * levelGap, depth: n.depth })
  })

  const edges: LaidEdge[] = []
  for (const n of nodes) {
    for (const c of [n.left, n.right]) {
      if (!c) continue
      const a = pos.get(n.value)!
      const b = pos.get(c.value)!
      edges.push({ key: `${n.value}-${c.value}`, from: n.value, to: c.value, x1: a.x, y1: a.y, x2: b.x, y2: b.y })
    }
  }

  const maxDepth = Math.max(0, ...nodes.map(n => n.depth))
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

export interface TraceStep {
  current: number | null
  queue: number[] // front first
  output: number[]
  line: number // pseudocode line to highlight, 1-based
  message: string
}

export const BFS_PSEUDOCODE = [
  'queue ← [root]',
  'while queue is not empty:',
  '  node ← queue.dequeue()',
  '  visit(node)',
  '  enqueue node.left, node.right (if they exist)',
]

/** Step-by-step trace of breadth-first search, for the stepper. */
export function traceBfs(values: number[]): TraceStep[] {
  const root = buildBst(values)
  const steps: TraceStep[] = []
  if (!root) return steps

  const queue: BstNode[] = [root]
  const out: number[] = []
  steps.push({ current: null, queue: [root.value], output: [], line: 1, message: `Start: the root, ${root.value}, joins the queue.` })
  while (queue.length) {
    const n = queue.shift()!
    out.push(n.value)
    const kids = [n.left, n.right].filter((k): k is BstNode => k !== null)
    queue.push(...kids)
    const joined = kids.length
      ? `${kids.map(k => k.value).join(' and ')} ${kids.length === 1 ? 'joins' : 'join'} the back.`
      : 'It has no children, so nothing joins the queue.'
    steps.push({ current: n.value, queue: queue.map(k => k.value), output: [...out], line: 4, message: `${n.value} leaves the front of the queue and is visited. ${joined}` })
  }
  steps[steps.length - 1]!.message += ' The queue is empty: every node was visited once.'
  return steps
}

/** Just the final BFS order, e.g. for the summary page. */
export function bfsOrder(values: number[]): number[] {
  return traceBfs(values).at(-1)?.output ?? []
}
