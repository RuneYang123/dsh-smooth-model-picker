import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// 1. Check host module import
const hostMod = await import(path.join(root, 'index.js'))
assert.equal(typeof hostMod.apply, 'function', 'index.js must export apply()')

// 2. Load client.js into mock ModuleLoader + localStorage
const store = new Map()
store.set('dsh.model-quick-switch.v1', JSON.stringify({
  providerOrder: ['antigravity', 'openai-codex'],
  modelOrder: { antigravity: ['gemini-4-neon', 'gemini-3.8-flash'] },
  favorites: ['antigravity/gemini-4-neon'],
  recent: ['openai-codex/gpt-5.6-luna'],
}))

let loadedModule = null
const mockWindow = {
  localStorage: {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)) },
  },
  __ModuleLoader__: {
    load(def) {
      loadedModule = def
    },
  },
}

const code = fs.readFileSync(path.join(root, 'client.js'), 'utf8')
vm.runInNewContext(code, { window: mockWindow, console, Date, Math, Object, Array, Set, Map, Promise, Number, String, Boolean })

assert.ok(loadedModule, 'ModuleLoader.load must be called')
assert.equal(loadedModule.id, 'dsh-smooth-model-picker')

const mockReact = {
  createElement: (...args) => ({ args }),
  Fragment: Symbol('Fragment'),
  Component: class Component { constructor(props) { this.props = props } },
  useCallback: fn => fn,
  useEffect: () => {},
  useLayoutEffect: () => {},
  useMemo: fn => fn(),
  useRef: v => ({ current: v }),
  useState: v => [typeof v === 'function' ? v() : v, () => {}],
}
const plugin = loadedModule.factory(name => {
  if (name === 'react') return mockReact
  if (name === 'react-dom') return { createPortal: x => x }
  throw new Error('Unexpected require: ' + name)
})

assert.deepEqual(Array.from(plugin.inject), ['slots', 'sessions', 'modelDirectories', 'locale'])
assert.equal(typeof plugin.apply, 'function')

// 2b. Verify bundle metadata & locale files
const pkgJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
assert.equal(pkgJson.exports['./locale/*.json'], './locale/*.json')
assert.equal(pkgJson.exports['./icon'], './icon.svg')
for (const loc of ['zh.json', 'en.json']) {
  const locData = JSON.parse(fs.readFileSync(path.join(root, 'locale', loc), 'utf8'))
  assert.ok(locData.meta && locData.meta.title && locData.meta.description, `locale/${loc} must define meta.title and meta.description`)
}
assert.ok(fs.existsSync(path.join(root, 'LICENSE')), 'LICENSE file must exist')

const t = plugin.__testExports

// 3. Test legacy migration from dsh-model-quick-switch
const migrated = t.readPrefs()
assert.deepEqual(Array.from(migrated.providerOrder), ['antigravity', 'openai-codex'])
assert.deepEqual(Array.from(migrated.favorites), ['antigravity/gemini-4-neon'])
assert.deepEqual(Array.from(migrated.recent), ['openai-codex/gpt-5.6-luna'])

// 4. Test ordering & moveItem
assert.deepEqual(Array.from(t.orderIds(['b', 'missing'], ['a', 'b', 'c'])), ['b', 'a', 'c'])
assert.deepEqual(Array.from(t.moveItem(['a', 'b', 'c', 'd'], 1, 3)), ['a', 'c', 'd', 'b'])
assert.deepEqual(Array.from(t.moveItem(['a', 'b', 'c', 'd'], 3, 0)), ['d', 'a', 'b', 'c'])

// 5. Test remembered reasoning effort resolution
const modelWithEfforts = {
  id: 'gemini-4-neon',
  reasoning: {
    defaultEffort: 'medium',
    efforts: [{ id: 'low' }, { id: 'medium' }, { id: 'high' }],
  },
}
assert.equal(t.resolveRememberedEffort(modelWithEfforts, 'high'), 'high')
assert.equal(t.resolveRememberedEffort(modelWithEfforts, 'nonexistent'), 'medium')
assert.equal(t.resolveRememberedEffort(modelWithEfforts, undefined), 'medium')
assert.equal(t.resolveRememberedEffort({ id: 'plain' }, 'high'), undefined)

// 6. Test search scoring (substring beats sparse subsequence)
assert.ok(t.matchScore('neon', 'Gemini 4 Neon') > t.matchScore('neon', 'New Open Engine'))
assert.equal(t.matchScore('xyz', 'Gemini 4 Neon'), 0)

// 7. Test drag-to-reorder target index & landing coordinate math
const items = [
  { index: 0, contentTop: 0, height: 34 },
  { index: 1, contentTop: 36, height: 34 },
  { index: 2, contentTop: 72, height: 34 },
  { index: 3, contentTop: 108, height: 34 },
]
assert.equal(t.computeTargetIndex(items, 0, 17), 0)
assert.equal(t.computeTargetIndex(items, 0, 56), 1)
assert.equal(t.computeTargetIndex(items, 0, 128), 3)
assert.equal(t.computeTargetIndex(items, 3, 15), 0)

// Landing coordinate checks (uniform & variable heights)
assert.equal(t.computeLandingContentTop(items, 0, 2), 72)
assert.equal(t.computeLandingContentTop(items, 3, 1), 36)
assert.equal(t.computeLandingContentTop(items, 2, 2), 72)

const varItems = [
  { index: 0, contentTop: 0, height: 30 },
  { index: 1, contentTop: 32, height: 50 },
]
assert.equal(t.computeLandingContentTop(varItems, 0, 1), 52) // 32 + 50 - 30 = 52
assert.equal(t.computeLandingContentTop(varItems, 1, 0), 0)

// 8. Test vendorAccent & effortTone helpers
assert.equal(t.vendorAccent('deepseek-account', 'DeepSeek'), '#4d6bfe')
assert.equal(t.vendorAccent('antigravity', 'Antigravity'), '#3b82f6')
assert.equal(t.vendorAccent('openai-codex', 'Codex'), '#10b981')
assert.equal(t.vendorAccent('qwen', 'Qwen'), '#8b5cf6')
assert.match(t.vendorAccent('custom-provider', 'My Custom'), /^#[0-9a-f]{6}$/i)
assert.equal(t.resolveProviderAccent('qwen', 'Qwen', { qwen: '#ec4899' }), '#ec4899')
assert.equal(t.resolveProviderAccent('qwen', 'Qwen', {}), '#8b5cf6')
assert.equal(t.sanitizePrefs({ providerColors: { qwen: '#EC4899', bad: 'red' } }).providerColors.qwen, '#ec4899')
assert.equal(t.sanitizePrefs({ providerColors: { qwen: '#EC4899', bad: 'red' } }).providerColors.bad, undefined)
assert.equal(t.effortTone('low', 0, 3), '#38bdf8')
assert.equal(t.effortTone('high', 2, 3), '#8b5cf6')
assert.equal(t.effortTone('max', 3, 4), '#f59e0b')

// 9. Test effort scrubber math
const segs = [
  { left: 3, width: 50 },
  { left: 53, width: 60 },
  { left: 113, width: 50 },
]
assert.equal(t.computeEffortScrubIndex(segs, 20), 0)
assert.equal(t.computeEffortScrubIndex(segs, 80), 1)
assert.equal(t.computeEffortScrubIndex(segs, 150), 2)
assert.equal(t.clampSliderLeft(10, 50, 3, 163), 3)
assert.equal(t.clampSliderLeft(160, 50, 3, 163), 113)
assert.equal(t.clampSliderLeft(83, 60, 3, 163), 53)

// 10. Test customGroups, aliases, hidden items & backup round-trip
const richPrefs = t.sanitizePrefs({
  providerOrder: ['custom:dev', 'antigravity', 'antigravity'],
  providerAliases: { antigravity: '  谷歌主力  ', empty: '   ' },
  modelAliases: { 'antigravity/gemini-4-neon': 'Gemini 4' },
  hiddenProviders: ['qwen', 'qwen'],
  hiddenModels: ['antigravity/old-model'],
  customGroups: [
    {
      id: 'custom:dev',
      name: '主力编程',
      color: '#10b981',
      models: ['antigravity/gemini-4-neon', 'openai-codex/gpt-6-sol', 'antigravity/gemini-4-neon'],
      modelAliases: { 'antigravity/gemini-4-neon': '代码主力' },
    },
    { id: 'bad-id', name: 'Ignored', color: '#10b981', models: [] },
  ],
})
assert.equal(richPrefs.providerAliases.antigravity, '谷歌主力')
assert.equal(richPrefs.providerAliases.empty, undefined)
assert.equal(richPrefs.modelAliases['antigravity/gemini-4-neon'], 'Gemini 4')
assert.deepEqual(Array.from(richPrefs.hiddenProviders), ['qwen'])
assert.deepEqual(Array.from(richPrefs.hiddenModels), ['antigravity/old-model'])
assert.equal(richPrefs.customGroups.length, 1)
assert.deepEqual(Array.from(richPrefs.customGroups[0].models), ['antigravity/gemini-4-neon', 'openai-codex/gpt-6-sol'])
assert.equal(richPrefs.customGroups[0].modelAliases['antigravity/gemini-4-neon'], '代码主力')

const backupJson = t.exportBackupPayload(richPrefs)
const parsedOk = t.parseBackupPayload(backupJson)
assert.equal(parsedOk.ok, true)
assert.equal(parsedOk.prefs.customGroups[0].name, '主力编程')
assert.equal(parsedOk.prefs.customGroups[0].modelAliases['antigravity/gemini-4-neon'], '代码主力')
assert.equal(parsedOk.prefs.providerAliases.antigravity, '谷歌主力')
assert.equal(t.parseBackupPayload('{not-json').reason, 'json')
assert.equal(t.parseBackupPayload('{"unrelated":123}').reason, 'shape')

// 11. Test bilingual language resolution & sanitization
assert.equal(t.sanitizePrefs({ language: 'en' }).language, 'en')
assert.equal(t.sanitizePrefs({ language: 'zh' }).language, 'zh')
assert.equal(t.sanitizePrefs({ language: 'invalid' }).language, 'auto')
assert.equal(t.resolveCopy('en').manage, 'Settings & Manage')
assert.equal(t.resolveCopy('zh').manage, '管理与设置')

// 12. Test Cordis slot registration wiring & real component render execution
let registeredSlot = null
const sampleSnapshot = {
  status: 'ready',
  groups: [
    {
      id: 'antigravity',
      name: 'Antigravity',
      models: [
        {
          id: 'gemini-4-neon',
          name: 'Gemini 4 Neon',
          reasoning: { defaultEffort: 'medium', efforts: [{ id: 'low', name: 'Low' }, { id: 'medium', name: 'Medium' }, { id: 'high', name: 'High' }] },
        },
      ],
    },
  ],
  current: { provider: 'antigravity', model: 'gemini-4-neon', reasoningEffort: 'high' },
}
const fakeCtx = {
  effect: fn => fn(),
  inject: (_deps, fn) => fn({
    slots: {
      inject: (_name, reg) => { registeredSlot = reg() },
      register: (meta, comp) => ({ meta, comp }),
    },
    sessions: { subagentAddress: () => undefined },
    modelDirectories: { directoryFor: () => ({ store: { getSnapshot: () => sampleSnapshot } }) },
    locale: { getLocale: () => ({ active: 'zh-CN' }), resolveText: s => s },
  }),
}
plugin.apply(fakeCtx)
assert.ok(registeredSlot, 'Must register conversation.input.model slot')
assert.equal(registeredSlot.meta.name, 'conversation.input.model')
assert.equal(registeredSlot.meta.priority, -1)

// Execute SeatBoundary -> SmoothPicker render to catch any TDZ or runtime ReferenceError
const injectedProps = registeredSlot.meta.inject('session-1')
const boundary = new registeredSlot.comp(injectedProps)
const tree = boundary.render()
assert.ok(tree && tree.args, 'SeatBoundary must render element')
const pickerFn = tree.args[2].args[0]
const rendered = pickerFn(injectedProps)
assert.ok(rendered && rendered.args, 'SmoothPicker must execute without ReferenceError/TDZ')

console.log('ALL SMOKE TESTS PASSED')
