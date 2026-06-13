const HOURS_48 = 48 * 60 * 60 * 1000

function collectOverdue(nodes, results) {
  for (const node of nodes) {
    const todo = node.todo
    if (todo?.keep) continue
    const hasChildren = Array.isArray(node.children) && node.children.length > 0
    if (hasChildren) {
      collectOverdue(node.children, results)
    } else if (todo && !todo.done && todo.start) {
      if (Date.now() - todo.start > HOURS_48) {
        results.push({
          content: todo.content || '',
          level: todo.level || 'default',
          start: todo.start,
          hours: Math.floor((Date.now() - todo.start) / (60 * 60 * 1000)),
        })
      }
    }
  }
}

module.exports = function (api) {
  return {
    async getOverdueTasks(params) {
      const { filePath } = params
      if (!filePath) {
        throw new Error('filePath is required')
      }

      const data = await api.getTree(filePath)
      const tree = Array.isArray(data?.tree) ? data.tree : []
      const results = []
      collectOverdue(tree, results)
      results.sort((a, b) => a.start - b.start)
      return { tasks: results }
    },
  }
}
