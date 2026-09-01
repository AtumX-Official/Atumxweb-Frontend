'use client'

/** Browser-only project filesystem backed by the File System Access API. */
export type WorkspaceNode = {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: WorkspaceNode[]
}

const separator = '/'
let root: FileSystemDirectoryHandle | null = null

const unsupported = () => new Error('This browser does not support the File System Access API. Use a recent Chromium-based browser over HTTPS or localhost.')
const api = () => {
  if (typeof window === 'undefined' || !('showDirectoryPicker' in window)) throw unsupported()
}
const cleanName = (name: string) => {
  const value = name.trim()
  if (!value || value === '.' || value === '..' || /[\\/:*?"<>|]/.test(value)) throw new Error('Enter a valid file or folder name.')
  return value
}
const pieces = (path: string) => path.split(separator).filter(Boolean)
const rootName = () => root?.name || ''

async function directoryFor(path = ''): Promise<FileSystemDirectoryHandle> {
  if (!root) throw new Error('Open a project folder first.')
  let current = root
  const relative = pieces(path).slice(path.startsWith(root.name + separator) ? 1 : 0)
  for (const piece of relative) current = await current.getDirectoryHandle(piece)
  return current
}

async function parentFor(path: string) {
  const all = pieces(path)
  const name = all.pop()
  if (!name) throw new Error('Invalid file path.')
  return { directory: await directoryFor(all.join(separator)), name }
}

async function list(directory: FileSystemDirectoryHandle, path: string): Promise<WorkspaceNode[]> {
  const nodes: WorkspaceNode[] = []
  for await (const handle of directory.values()) {
    const nodePath = path ? `${path}/${handle.name}` : handle.name
    nodes.push(handle.kind === 'directory'
      ? { name: handle.name, path: nodePath, type: 'folder', children: await list(handle, nodePath) }
      : { name: handle.name, path: nodePath, type: 'file' })
  }
  return nodes.sort((a, b) => a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1)
}

export const browserWorkspace = {
  supported: () => typeof window !== 'undefined' && 'showDirectoryPicker' in window,
  hasProject: () => root !== null,
  name: rootName,
  async openProject() {
    api()
    root = await window.showDirectoryPicker({ mode: 'readwrite' })
    return this.refresh()
  },
  async createProject(name: string) {
    api()
    const base = await window.showDirectoryPicker({ mode: 'readwrite' })
    root = await base.getDirectoryHandle(cleanName(name), { create: true })
    const src = await root.getDirectoryHandle('src', { create: true })
    await src.getFileHandle('main.cpp', { create: true })
    await root.getDirectoryHandle('include', { create: true })
    return this.refresh()
  },
  async refresh() {
    if (!root) return { rootName: '', tree: [] as WorkspaceNode[] }
    return { rootName: root.name, tree: await list(root, root.name) }
  },
  async readFile(path: string) {
    const { directory, name } = await parentFor(path)
    return (await (await directory.getFileHandle(name)).getFile()).text()
  },
  async writeFile(path: string, content: string) {
    const { directory, name } = await parentFor(path)
    const writable = await (await directory.getFileHandle(cleanName(name), { create: true })).createWritable()
    await writable.write(content)
    await writable.close()
    return path
  },
  async saveAs(name: string, content: string) {
    if (typeof window === 'undefined' || !('showSaveFilePicker' in window)) throw unsupported()
    const handle = await window.showSaveFilePicker({ suggestedName: cleanName(name), types: [{ description: 'C++ source', accept: { 'text/plain': ['.cpp', '.h', '.hpp'] } }] })
    const writable = await handle.createWritable()
    await writable.write(content)
    await writable.close()
    return handle.name
  },
  async createFile(parentPath: string, name: string) {
    const folder = await directoryFor(parentPath)
    await folder.getFileHandle(cleanName(name), { create: true })
  },
  async createFolder(parentPath: string, name: string) {
    const folder = await directoryFor(parentPath)
    await folder.getDirectoryHandle(cleanName(name), { create: true })
  },
  async remove(path: string, recursive = false) {
    const { directory, name } = await parentFor(path)
    await directory.removeEntry(name, { recursive })
  },
  async rename(path: string, newName: string) {
    if (pieces(path).length === 1) {
      throw new Error('Browsers cannot rename the selected project folder. Rename it in your operating system, then reopen it.')
    }
    const { directory, name } = await parentFor(path)
    const next = cleanName(newName)
    const file = await directory.getFileHandle(name).catch(() => null)
    if (file) {
      const text = await (await file.getFile()).text()
      await this.writeFile([...pieces(path).slice(0, -1), next].join(separator), text)
      await directory.removeEntry(name)
    } else {
      const source = await directory.getDirectoryHandle(name)
      const destination = await directory.getDirectoryHandle(next, { create: true })
      await copyDirectory(source, destination)
      await directory.removeEntry(name, { recursive: true })
    }
    return [...pieces(path).slice(0, -1), next].join(separator)
  },
  async search(query: string) {
    const { tree } = await this.refresh()
    const hits: { fileName: string; filePath: string; lineNumber: number; lineText: string; matchStart: number; matchLength: number }[] = []
    const visit = async (node: WorkspaceNode) => {
      if (node.type === 'folder') return Promise.all((node.children || []).map(visit))
      const lines = (await this.readFile(node.path)).split(/\r?\n/)
      lines.forEach((line, i) => {
        const matchStart = line.toLowerCase().indexOf(query.toLowerCase())
        if (matchStart >= 0) hits.push({ fileName: node.name, filePath: node.path, lineNumber: i + 1, lineText: line, matchStart, matchLength: query.length })
      })
    }
    await Promise.all(tree.map(visit))
    return hits
  },
}

async function copyDirectory(source: FileSystemDirectoryHandle, destination: FileSystemDirectoryHandle) {
  for await (const entry of source.values()) {
    if (entry.kind === 'directory') await copyDirectory(entry, await destination.getDirectoryHandle(entry.name, { create: true }))
    else {
      const writable = await (await destination.getFileHandle(entry.name, { create: true })).createWritable()
      await writable.write(await (await entry.getFile()).text())
      await writable.close()
    }
  }
}

declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>
    showSaveFilePicker(options?: { suggestedName?: string; types?: { description: string; accept: Record<string, string[]> }[] }): Promise<FileSystemFileHandle>
  }
}
