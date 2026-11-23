/**
 * dsh-smooth-model-picker — browser client module.
 *
 * Replaces `conversation.input.model` with:
 * - A composer model button + adjacent quick reasoning-effort capsule
 * - A two-pane provider/model picker (auto-focused search, favorites, recents,
 *   click switching + toggleable debounced hover switching)
 * - A Pointer Events + GPU-transform smooth drag-to-reorder engine with floating
 *   lift card, elastic sibling displacement, edge auto-scroll, and settle landing
 * - A bottom reasoning-effort segmented bar with animated sliding pill and
 *   per-model remembered effort persistence
 */
window.__ModuleLoader__.load({
  id: 'dsh-smooth-model-picker',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const { createPortal } = ReactDOM
    const flushSync = typeof ReactDOM.flushSync === 'function' ? ReactDOM.flushSync : null
    const { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } = React
    const h = React.createElement

    /* ------------------------------------------------------------------ copy */

    const COPY = {
      zh: {
        title: '模型与思考强度',
        selectModel: '选择模型',
        searchPlaceholder: '搜索',
        searchAria: '搜索模型或供应商',
        clear: '清除搜索',
        reload: '刷新模型目录',
        favorites: '收藏',
        recent: '最近',
        results: '搜索结果',
        emptyFavorites: '还没有收藏，点击模型右侧星标即可置顶收藏',
        emptyRecent: '还没有切换记录',
        emptySearch: '没有找到匹配的模型',
        emptyCatalog: '当前会话暂时没有可用供应商',
        loading: '正在加载模型目录…',
        failed: '该供应商加载失败',
        retry: '重试',
        account: 'DeepSeek 账号',
        effortLabel: '思考强度',
        effortTooltip: '快捷切换当前模型思考强度',
        effortSlideHint: '可左右拖动',
        dragHint: '按住任意行拖动可排序',
        resetOrder: '重置排序',
        star: '收藏',
        unstar: '取消收藏',
        manage: '管理与设置',
        manageTitle: '模型与分组设置',
        tabCatalog: '供应商与模型',
        tabBackup: '设置与备份',
        catalogDesc: '展开任意供应商或自定义文件夹，独立设置别名、显示状态与包含模型',
        backupDesc: '界面语言切换、导入导出个人配置，或按需恢复默认状态',
        filterAll: '全部',
        filterCustom: '自定义文件夹',
        expandAll: '全部展开',
        collapseAll: '全部收起',
        folderAliasPlaceholder: '此文件夹专属别名…',
        removeFromFolder: '移出文件夹',
        folderEmpty: '此文件夹暂无模型，点击「编辑模型」添加',
        pickColor: '点击自定义标识色',
        resetColor: '恢复默认色',
        customColor: '自定义色盘',
        langTitle: '界面语言',
        langHint: '立即切换选择器与管理界面的显示语言',
        langAuto: '跟随系统',
        langZh: '中文',
        langEn: 'English',
        langShortAuto: '自动',
        langShortZh: '中',
        langShortEn: 'EN',
        newGroup: '新建分组',
        editGroup: '编辑分组',
        groupName: '分组名称',
        groupNamePlaceholder: '例如：主力编程、日常问答…',
        groupColor: '标识色',
        groupModels: '包含模型',
        groupSelectedCount: n => `已选 ${n} 个模型`,
        emptyGroups: '还没有自定义分组。点击右上角「新建分组」，把跨供应商的常用模型放进同一个组里。',
        save: '保存',
        cancel: '取消',
        edit: '编辑',
        remove: '删除',
        back: '返回',
        allProviders: '全部供应商',
        onlyHidden: '仅看已隐藏',
        aliasPlaceholder: '自定义别名…',
        restoreAlias: '恢复原名',
        hiddenTag: '已隐藏',
        customTag: '自定义',
        noMatchingItems: '没有符合条件的条目',
        exportTitle: '导出配置备份',
        exportHint: '包含自定义分组、别名、隐藏项、收藏、排序与思考强度记忆',
        downloadJson: '下载 JSON',
        copyJson: '复制 JSON',
        copied: '已复制 ✓',
        importTitle: '导入配置备份',
        importHint: '从 JSON 文件或粘贴文本恢复，将覆盖当前插件配置',
        chooseFile: '选择 JSON 文件',
        pastePlaceholder: '或在此粘贴备份的 JSON 内容…',
        importBtn: '确认导入',
        importOk: '配置已导入并立即生效',
        importBadJson: 'JSON 格式无效，请检查内容',
        importBadShape: '备份内容结构不正确，未做修改',
        resetTitle: '重置选项',
        resetOrderOnly: '仅重置排序',
        resetHiddenOnly: '恢复全部隐藏项',
        resetAll: '全部重置为默认',
        resetAllConfirm: '再次点击确认全部清空',
        resetDone: '已重置完成',
        statGroups: n => `${n} 个自定义分组`,
        statFavs: n => `${n} 个收藏`,
        statAliases: n => `${n} 个别名`,
        statHidden: n => `${n} 个隐藏项`,
        statEfforts: n => `${n} 条强度记忆`,
        broken: '模型选择器出错，点击重试',
        count: n => `${n}`,
      },
      en: {
        title: 'Model & Reasoning Effort',
        selectModel: 'Select model',
        searchPlaceholder: 'Search',
        searchAria: 'Search models or providers',
        clear: 'Clear search',
        reload: 'Refresh catalog',
        favorites: 'Pinned',
        recent: 'Recent',
        results: 'Results',
        emptyFavorites: 'No pinned models yet. Click the star on any model.',
        emptyRecent: 'No recent switches yet.',
        emptySearch: 'No matching models.',
        emptyCatalog: 'No providers available in this session yet.',
        loading: 'Loading model catalog…',
        failed: 'Provider failed to load',
        retry: 'Retry',
        account: 'DeepSeek Account',
        effortLabel: 'Effort',
        effortTooltip: 'Quickly switch reasoning effort for current model',
        effortSlideHint: 'Slide or click',
        dragHint: 'Drag rows to reorder',
        resetOrder: 'Reset order',
        star: 'Pin model',
        unstar: 'Unpin model',
        manage: 'Settings & Manage',
        manageTitle: 'Model & Group Settings',
        tabCatalog: 'Providers & Models',
        tabBackup: 'Settings & Backup',
        catalogDesc: 'Expand any provider or custom folder to set independent aliases, visibility & models',
        backupDesc: 'Switch display language, export/import backups, or reset selectively',
        filterAll: 'All',
        filterCustom: 'Custom Folders',
        expandAll: 'Expand all',
        collapseAll: 'Collapse all',
        folderAliasPlaceholder: 'Folder-specific alias…',
        removeFromFolder: 'Remove from folder',
        folderEmpty: 'No models in this folder yet. Click Edit to add models.',
        pickColor: 'Click to customize color',
        resetColor: 'Reset default',
        customColor: 'Custom color',
        langTitle: 'Display Language',
        langHint: 'Instantly switch language for both the picker and settings window',
        langAuto: 'System',
        langZh: '中文',
        langEn: 'English',
        langShortAuto: 'Auto',
        langShortZh: '中',
        langShortEn: 'EN',
        newGroup: 'New Group',
        editGroup: 'Edit Group',
        groupName: 'Group name',
        groupNamePlaceholder: 'e.g. Coding, Daily, Free…',
        groupColor: 'Accent',
        groupModels: 'Models',
        groupSelectedCount: n => `${n} selected`,
        emptyGroups: 'No custom groups yet. Create one to combine models across providers.',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        remove: 'Delete',
        back: 'Back',
        allProviders: 'All providers',
        onlyHidden: 'Hidden only',
        aliasPlaceholder: 'Custom alias…',
        restoreAlias: 'Reset name',
        hiddenTag: 'Hidden',
        customTag: 'Custom',
        noMatchingItems: 'No matching items',
        exportTitle: 'Export Backup',
        exportHint: 'Includes custom groups, aliases, hidden items, pins, order & effort memory',
        downloadJson: 'Download JSON',
        copyJson: 'Copy JSON',
        copied: 'Copied ✓',
        importTitle: 'Import Backup',
        importHint: 'Restore from a JSON file or pasted text (replaces current plugin preferences)',
        chooseFile: 'Choose JSON File',
        pastePlaceholder: 'Or paste backup JSON here…',
        importBtn: 'Import',
        importOk: 'Preferences imported and applied',
        importBadJson: 'Invalid JSON syntax',
        importBadShape: 'Unrecognized backup format — nothing changed',
        resetTitle: 'Reset Options',
        resetOrderOnly: 'Reset Order Only',
        resetHiddenOnly: 'Unhide All',
        resetAll: 'Reset Everything',
        resetAllConfirm: 'Click again to confirm reset',
        resetDone: 'Reset complete',
        statGroups: n => `${n} groups`,
        statFavs: n => `${n} pinned`,
        statAliases: n => `${n} aliases`,
        statHidden: n => `${n} hidden`,
        statEfforts: n => `${n} effort prefs`,
        broken: 'Model picker hit an error, click to retry',
        count: n => `${n}`,
      },
    }

    function localeCandidates(service) {
      const found = []
      const push = value => {
        if (typeof value === 'string' && value.trim() !== '') found.push(value)
      }
      try {
        const snapshot = service && typeof service.getLocale === 'function' ? service.getLocale() : null
        if (typeof snapshot === 'string') push(snapshot)
        else if (snapshot) {
          push(snapshot.active)
          push(snapshot.id)
          push(snapshot.localeId)
          push(snapshot.language)
        }
      } catch (e) { /* ignore */ }
      try { if (typeof document !== 'undefined') push(document.documentElement.lang) } catch (e) { /* ignore */ }
      try { if (typeof navigator !== 'undefined') push(navigator.language) } catch (e) { /* ignore */ }
      return found
    }

    function pickCopy(service) {
      for (const candidate of localeCandidates(service)) {
        const id = candidate.toLowerCase()
        if (id.startsWith('zh')) return COPY.zh
        if (id.startsWith('en')) return COPY.en
      }
      return COPY.zh
    }

    function resolveCopy(languagePref, hostCopy) {
      if (languagePref === 'zh') return COPY.zh
      if (languagePref === 'en') return COPY.en
      return hostCopy || COPY.zh
    }

    /* ----------------------------------------------------------- preferences */

    const PREFS_KEY = 'dsh.smooth-model-picker.v1'
    const LEGACY_KEY = 'dsh.model-quick-switch.v1'
    const CUSTOM_GROUP_PALETTE = ['#3b82f6', '#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#d97757', '#06b6d4', '#ec4899']
    const prefsListeners = new Set()
    let prefsCache

    function stringArray(value) {
      return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
    }

    function uniqueStrings(list) {
      const out = []
      const seen = new Set()
      for (const item of stringArray(list)) {
        if (!seen.has(item)) {
          seen.add(item)
          out.push(item)
        }
      }
      return out
    }

    function sanitizeAliasMap(raw) {
      const out = {}
      if (!raw || typeof raw !== 'object') return out
      for (const key of Object.keys(raw)) {
        const v = raw[key]
        if (typeof v === 'string' && v.trim() !== '') out[key] = v.trim().slice(0, 48)
      }
      return out
    }

    function sanitizeCustomGroups(raw) {
      if (!Array.isArray(raw)) return []
      const out = []
      const seenIds = new Set()
      for (const item of raw) {
        if (!item || typeof item !== 'object') continue
        const id = typeof item.id === 'string' && item.id.startsWith('custom:') ? item.id : ''
        const name = typeof item.name === 'string' ? item.name.trim().slice(0, 40) : ''
        if (!id || !name || seenIds.has(id)) continue
        seenIds.add(id)
        const color = typeof item.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(item.color)
          ? item.color
          : CUSTOM_GROUP_PALETTE[out.length % CUSTOM_GROUP_PALETTE.length]
        const models = uniqueStrings(item.models)
        const modelAliases = sanitizeAliasMap(item.modelAliases)
        out.push({ id, name, color, models, modelAliases })
      }
      return out
    }

    function sanitizeColorMap(raw) {
      const out = {}
      if (!raw || typeof raw !== 'object') return out
      for (const key of Object.keys(raw)) {
        const v = raw[key]
        if (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v.trim())) out[key] = v.trim().toLowerCase()
      }
      return out
    }

    function sanitizePrefs(raw) {
      const next = {
        language: 'auto',
        providerOrder: [],
        modelOrder: {},
        favorites: [],
        recent: [],
        modelEfforts: {},
        providerAliases: {},
        providerColors: {},
        modelAliases: {},
        hiddenProviders: [],
        hiddenModels: [],
        customGroups: [],
      }
      if (!raw || typeof raw !== 'object') return next
      if (raw.language === 'zh' || raw.language === 'en' || raw.language === 'auto') {
        next.language = raw.language
      }
      next.providerOrder = uniqueStrings(raw.providerOrder)
      next.favorites = uniqueStrings(raw.favorites)
      next.recent = uniqueStrings(raw.recent).slice(0, 12)
      next.hiddenProviders = uniqueStrings(raw.hiddenProviders)
      next.hiddenModels = uniqueStrings(raw.hiddenModels)
      next.providerAliases = sanitizeAliasMap(raw.providerAliases || raw.aliases)
      next.providerColors = sanitizeColorMap(raw.providerColors)
      next.modelAliases = sanitizeAliasMap(raw.modelAliases)
      next.customGroups = sanitizeCustomGroups(raw.customGroups)
      if (raw.modelOrder && typeof raw.modelOrder === 'object') {
        for (const key of Object.keys(raw.modelOrder)) {
          const list = uniqueStrings(raw.modelOrder[key])
          if (list.length > 0) next.modelOrder[key] = list
        }
      }
      if (raw.modelEfforts && typeof raw.modelEfforts === 'object') {
        for (const key of Object.keys(raw.modelEfforts)) {
          const v = raw.modelEfforts[key]
          if (typeof v === 'string' && v.trim() !== '') next.modelEfforts[key] = v.trim()
        }
      }
      return next
    }

    function exportBackupPayload(prefs) {
      return JSON.stringify({
        schema: 'dsh-smooth-model-picker.backup.v1',
        exportedAt: new Date().toISOString(),
        preferences: sanitizePrefs(prefs),
      }, null, 2)
    }

    function parseBackupPayload(text) {
      let parsed
      try {
        parsed = JSON.parse(String(text || ''))
      } catch (e) {
        return { ok: false, reason: 'json' }
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { ok: false, reason: 'shape' }
      }
      const candidate = parsed.schema === 'dsh-smooth-model-picker.backup.v1' && parsed.preferences && typeof parsed.preferences === 'object'
        ? parsed.preferences
        : parsed
      const knownKeys = ['language', 'providerOrder', 'modelOrder', 'favorites', 'recent', 'modelEfforts', 'providerAliases', 'providerColors', 'modelAliases', 'hiddenProviders', 'hiddenModels', 'customGroups', 'aliases']
      const hasKnown = knownKeys.some(k => Object.prototype.hasOwnProperty.call(candidate, k))
      if (!hasKnown) return { ok: false, reason: 'shape' }
      return { ok: true, prefs: sanitizePrefs(candidate) }
    }

    function readPrefs() {
      if (prefsCache !== undefined) return prefsCache
      let raw = null
      try {
        const text = window.localStorage.getItem(PREFS_KEY)
        if (text) {
          raw = JSON.parse(text)
        } else {
          // One-time non-destructive migration from dsh-model-quick-switch if present
          const legacyText = window.localStorage.getItem(LEGACY_KEY)
          if (legacyText) {
            const legacy = JSON.parse(legacyText)
            if (legacy && typeof legacy === 'object') {
              raw = {
                providerOrder: legacy.providerOrder,
                modelOrder: legacy.modelOrder,
                favorites: legacy.favorites,
                recent: legacy.recent,
                providerAliases: legacy.aliases,
                modelAliases: legacy.modelAliases,
                hiddenProviders: legacy.hiddenProviders,
              }
            }
          }
        }
      } catch (e) { raw = null }
      prefsCache = sanitizePrefs(raw)
      return prefsCache
    }

    function writePrefs(next) {
      prefsCache = sanitizePrefs(next)
      try { window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefsCache)) } catch (e) { /* ignore */ }
      for (const listener of prefsListeners) {
        try { listener() } catch (e) { /* ignore */ }
      }
    }

    function updatePrefs(mutate) {
      const base = readPrefs()
      const next = {
        language: base.language,
        providerOrder: base.providerOrder.slice(),
        modelOrder: Object.assign({}, base.modelOrder),
        favorites: base.favorites.slice(),
        recent: base.recent.slice(),
        modelEfforts: Object.assign({}, base.modelEfforts),
        providerAliases: Object.assign({}, base.providerAliases),
        providerColors: Object.assign({}, base.providerColors),
        modelAliases: Object.assign({}, base.modelAliases),
        hiddenProviders: base.hiddenProviders.slice(),
        hiddenModels: base.hiddenModels.slice(),
        customGroups: base.customGroups.map(g => ({
          id: g.id,
          name: g.name,
          color: g.color,
          models: g.models.slice(),
          modelAliases: Object.assign({}, g.modelAliases),
        })),
      }
      mutate(next)
      writePrefs(next)
    }

    function usePrefs() {
      const [, bump] = useState(0)
      useEffect(() => {
        const listener = () => bump(v => v + 1)
        prefsListeners.add(listener)
        return () => { prefsListeners.delete(listener) }
      }, [])
      return readPrefs()
    }

    /* --------------------------------------------------------------- helpers */

    function readSnapshot(store) {
      try {
        return store && typeof store.getSnapshot === 'function' ? store.getSnapshot() : undefined
      } catch (e) { return undefined }
    }

    function useSnapshot(store) {
      const [snapshot, setSnapshot] = useState(() => readSnapshot(store))
      useEffect(() => {
        setSnapshot(readSnapshot(store))
        if (!store || typeof store.subscribe !== 'function') return undefined
        const unsubscribe = store.subscribe(() => setSnapshot(readSnapshot(store)))
        return typeof unsubscribe === 'function' ? unsubscribe : undefined
      }, [store])
      return snapshot
    }

    function keyOf(providerId, modelId) {
      return providerId + '/' + modelId
    }

    function orderIds(saved, ids) {
      const known = new Set(ids)
      const seen = new Set()
      const head = []
      for (const id of saved || []) {
        if (!known.has(id) || seen.has(id)) continue
        head.push(id)
        seen.add(id)
      }
      for (const id of ids) {
        if (!seen.has(id)) head.push(id)
      }
      return head
    }

    function moveItem(list, from, to) {
      if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list
      const next = list.slice()
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    }

    function officialProviderOrder(groups) {
      return groups
        .map((group, index) => ({
          id: group.id,
          rank: group.id === 'deepseek-account' ? -2 : group.id === 'deepseek' ? -1 : index,
        }))
        .sort((a, b) => a.rank - b.rank)
        .map(entry => entry.id)
    }

    /**
     * Fuzzy & substring scorer. Returns score (>0 for match, 0 for no match).
     * Prefers exact substring matches and word-boundary matches over sparse subsequences.
     */
    function matchScore(query, text) {
      if (!query) return 1
      const q = String(query).toLowerCase()
      const t = String(text || '').toLowerCase()
      const subIdx = t.indexOf(q)
      if (subIdx >= 0) {
        return 1000 - subIdx * 2 - (t.length - q.length) * 0.1
      }
      let ti = 0
      let score = 0
      let streak = 0
      for (let qi = 0; qi < q.length; qi++) {
        const ch = q[qi]
        const found = t.indexOf(ch, ti)
        if (found < 0) return 0
        if (found === ti) {
          streak += 1
          score += 12 + streak * 4
        } else {
          streak = 0
          const prev = found > 0 ? t[found - 1] : ' '
          const boundary = prev === ' ' || prev === '-' || prev === '_' || prev === '/' || prev === '.'
          score += boundary ? 10 : 4
        }
        ti = found + 1
      }
      return Math.max(1, score - t.length * 0.05)
    }

    /** Return highlighted React children for a label matching query. */
    function highlightText(label, query) {
      const text = String(label || '')
      const q = String(query || '').trim().toLowerCase()
      if (!q || !text) return text
      const lower = text.toLowerCase()
      const subIdx = lower.indexOf(q)
      if (subIdx >= 0) {
        const end = subIdx + q.length
        return [
          text.slice(0, subIdx),
          h('mark', { key: 'm', className: 'smp-hl' }, text.slice(subIdx, end)),
          text.slice(end),
        ]
      }
      const indices = []
      let cursor = 0
      for (let i = 0; i < q.length; i++) {
        const idx = lower.indexOf(q[i], cursor)
        if (idx < 0) return text
        indices.push(idx)
        cursor = idx + 1
      }
      const parts = []
      let last = 0
      for (let i = 0; i < indices.length; i++) {
        const idx = indices[i]
        if (idx > last) parts.push(text.slice(last, idx))
        parts.push(h('mark', { key: 'm' + i, className: 'smp-hl' }, text[idx]))
        last = idx + 1
      }
      if (last < text.length) parts.push(text.slice(last))
      return parts
    }

    function resolveEffortList(model) {
      return model && model.reasoning && Array.isArray(model.reasoning.efforts)
        ? model.reasoning.efforts
        : []
    }

    function resolveEffortLabel(effort, resolveText) {
      if (!effort) return ''
      const raw = effort.name !== undefined && effort.name !== null ? effort.name : effort.id
      if (typeof raw === 'string') return raw
      try {
        if (typeof resolveText === 'function') {
          const resolved = resolveText(raw)
          if (typeof resolved === 'string' && resolved.trim() !== '') return resolved.trim()
        }
      } catch (e) { /* ignore */ }
      return String(effort.id || '')
    }

    function resolveRememberedEffort(model, savedEffort) {
      const efforts = resolveEffortList(model)
      if (efforts.length === 0) return undefined
      if (savedEffort && efforts.some(e => e.id === savedEffort)) return savedEffort
      if (model.reasoning && model.reasoning.defaultEffort !== undefined && model.reasoning.defaultEffort !== null) {
        return model.reasoning.defaultEffort
      }
      return efforts[0] ? efforts[0].id : undefined
    }

    function badgeLabel(model, resolveText) {
      const badge = model && model.badge
      if (!badge || badge.text === undefined || badge.text === null) return ''
      try {
        const text = typeof resolveText === 'function' ? resolveText(badge.text) : badge.text
        return typeof text === 'string' ? text.trim() : ''
      } catch (e) {
        return typeof badge.text === 'string' ? badge.text : ''
      }
    }

    const FALLBACK_VENDOR_PALETTE = ['#6366f1', '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899']

    /** Tasteful, light/dark-balanced micro-accent color per provider family. */
    function vendorAccent(groupId, groupName) {
      const s = `${groupId || ''} ${groupName || ''}`.toLowerCase()
      if (s.includes('deepseek')) return '#4d6bfe'
      if (s.includes('antigravity') || s.includes('gemini') || s.includes('google') || s.includes('vertex')) return '#3b82f6'
      if (s.includes('codex') || s.includes('openai') || s.includes('chatgpt') || s.includes('gpt')) return '#10b981'
      if (s.includes('claude') || s.includes('anthropic')) return '#d97757'
      if (s.includes('qwen') || s.includes('dashscope') || s.includes('aliyun') || s.includes('tongyi')) return '#8b5cf6'
      if (s.includes('kimi') || s.includes('moonshot')) return '#06b6d4'
      if (s.includes('glm') || s.includes('zhipu') || s.includes('bigmodel')) return '#6366f1'
      if (s.includes('grok') || s.includes('xai')) return '#94a3b8'
      if (s.includes('minimax')) return '#ec4899'
      if (s.includes('ollama') || s.includes('local')) return '#64748b'
      let hash = 0
      for (let i = 0; i < s.length; i++) hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0
      return FALLBACK_VENDOR_PALETTE[Math.abs(hash) % FALLBACK_VENDOR_PALETTE.length]
    }

    function resolveProviderAccent(groupId, groupName, providerColors) {
      const custom = providerColors && groupId ? providerColors[groupId] : ''
      if (typeof custom === 'string' && /^#[0-9a-fA-F]{6}$/.test(custom)) return custom
      return vendorAccent(groupId, groupName)
    }

    const EFFORT_TONE_LADDER = ['#94a3b8', '#38bdf8', '#6366f1', '#8b5cf6', '#f59e0b']

    /** Subtle visual progression across reasoning-effort tiers. */
    function effortTone(effortId, index, total) {
      const id = String(effortId || '').toLowerCase()
      if (id === 'none' || id === 'off' || id === 'disabled' || id === 'minimal') return '#94a3b8'
      if (id === 'low' || id === 'fast' || id === 'light') return '#38bdf8'
      if (id === 'medium' || id === 'med' || id === 'balanced' || id === 'standard' || id === 'auto' || id === 'default') return '#6366f1'
      if (id === 'high' || id === 'deep') return '#8b5cf6'
      if (id === 'xhigh' || id === 'extra_high' || id === 'max' || id === 'ultra' || id === 'highest') return '#f59e0b'
      if (typeof index === 'number' && typeof total === 'number' && total > 1) {
        const mapped = Math.round((Math.max(0, Math.min(total - 1, index)) / (total - 1)) * (EFFORT_TONE_LADDER.length - 1))
        return EFFORT_TONE_LADDER[mapped]
      }
      return '#6366f1'
    }

    /** Pure helper: find nearest effort segment index for a pointer X inside the track. */
    function computeEffortScrubIndex(segments, relX) {
      if (!segments || segments.length === 0) return 0
      let bestIdx = 0
      let bestDist = Infinity
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]
        const center = seg.left + seg.width / 2
        const dist = Math.abs(relX - center)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = i
        }
      }
      return bestIdx
    }

    /** Pure helper: clamp sliding thumb X strictly within the segmented track bounds. */
    function clampSliderLeft(relX, sliderWidth, minLeft, maxRight) {
      const maxLeft = Math.max(minLeft, maxRight - sliderWidth)
      return Math.max(minLeft, Math.min(maxLeft, relX - sliderWidth / 2))
    }

    /* ------------------------------------------- smooth drag-to-reorder math */

    /**
     * Pure helper: compute target index from dragged center Y (in scroll content space)
     * with small boundary hysteresis to eliminate micro-jitter.
     */
    function computeTargetIndex(items, currentTarget, centerContentY) {
      if (!items || items.length <= 1) return 0
      let next = currentTarget
      // Move downward?
      while (next < items.length - 1) {
        const below = items[next + 1]
        const threshold = below.contentTop + below.height * 0.52
        if (centerContentY > threshold) next += 1
        else break
      }
      // Move upward?
      while (next > 0) {
        const above = items[next - 1]
        const threshold = above.contentTop + above.height * 0.48
        if (centerContentY < threshold) next -= 1
        else break
      }
      return next
    }

    /**
     * Pure helper: compute target contentTop for the dragged item when moving from `from` to `to`.
     */
    function computeLandingContentTop(items, from, to) {
      if (to === from) return items[from].contentTop
      if (to > from) return items[to].contentTop + items[to].height - items[from].height
      return items[to].contentTop
    }

    /**
     * Silky Pointer Events + GPU-transform drag controller hook.
     * Zero React re-renders during drag; smooth lift -> elastic sibling glide -> settle landing.
     */
    function useSmoothDragSort({ enabled, containerRef, onReorder, dragActiveRef, suppressClickUntilRef }) {
      const activeCleanupRef = useRef(null)

      useEffect(() => () => {
        if (activeCleanupRef.current) activeCleanupRef.current()
      }, [])

      const startPointerDown = useCallback((event, fromIndex) => {
        if (!enabled) return
        if (event.button !== 0) return
        const target = event.target
        if (target && typeof target.closest === 'function' && target.closest('button, input, [data-no-drag="true"]')) {
          return
        }
        const container = containerRef.current
        if (!container) return
        const rowEl = event.currentTarget
        if (!rowEl) return

        const startX = event.clientX
        const startY = event.clientY
        let activated = false
        let settled = false
        let targetIndex = fromIndex
        let latestX = startX
        let latestY = startY
        let items = []
        let dragSpan = 0
        let startRect = null
        let ghost = null
        let rafScrollId = 0
        let settleTimer = 0

        const applyDisplacements = nextTarget => {
          const landingTop = computeLandingContentTop(items, fromIndex, nextTarget)
          const placeholderDelta = landingTop - items[fromIndex].contentTop
          for (let i = 0; i < items.length; i++) {
            const it = items[i]
            if (i === fromIndex) {
              it.el.style.transform = placeholderDelta !== 0 ? `translate3d(0px, ${placeholderDelta}px, 0)` : ''
            } else if (fromIndex < nextTarget && i > fromIndex && i <= nextTarget) {
              it.el.style.transform = `translate3d(0px, ${-dragSpan}px, 0)`
            } else if (fromIndex > nextTarget && i >= nextTarget && i < fromIndex) {
              it.el.style.transform = `translate3d(0px, ${dragSpan}px, 0)`
            } else {
              it.el.style.transform = ''
            }
          }
        }

        const updateGhostAndTarget = () => {
          if (!ghost || !startRect) return
          const rawDx = latestX - startX
          const dampedDx = Math.max(-14, Math.min(14, rawDx * 0.16))
          const dy = latestY - startY
          ghost.style.transform = `translate3d(${dampedDx}px, ${dy}px, 0) scale(1.024)`

          const cRect = container.getBoundingClientRect()
          const ghostCenterViewportY = startRect.top + dy + startRect.height / 2
          const centerContentY = ghostCenterViewportY - cRect.top + container.scrollTop
          const nextTarget = computeTargetIndex(items, targetIndex, centerContentY)
          if (nextTarget !== targetIndex) {
            targetIndex = nextTarget
            applyDisplacements(targetIndex)
          }
        }

        const stepAutoScroll = () => {
          if (!activated || settled) {
            rafScrollId = 0
            return
          }
          const cRect = container.getBoundingClientRect()
          const edge = 36
          let speed = 0
          if (latestY < cRect.top + edge && container.scrollTop > 0) {
            const ratio = Math.min(1, (cRect.top + edge - latestY) / edge)
            speed = -(2 + ratio * 7)
          } else if (latestY > cRect.bottom - edge && container.scrollTop < container.scrollHeight - container.clientHeight) {
            const ratio = Math.min(1, (latestY - (cRect.bottom - edge)) / edge)
            speed = 2 + ratio * 7
          }
          if (speed !== 0) {
            container.scrollTop += speed
            updateGhostAndTarget()
          }
          rafScrollId = window.requestAnimationFrame(stepAutoScroll)
        }

        const activate = () => {
          activated = true
          if (dragActiveRef) dragActiveRef.current = true
          const cRect = container.getBoundingClientRect()
          const nodes = Array.from(container.querySelectorAll('[data-drag-item="true"]'))
          items = nodes
            .map(el => {
              const r = el.getBoundingClientRect()
              return {
                index: Number(el.getAttribute('data-drag-index')),
                el,
                rect: r,
                height: r.height,
                contentTop: r.top - cRect.top + container.scrollTop,
              }
            })
            .sort((a, b) => a.index - b.index)

          if (!items[fromIndex]) {
            cleanupHard()
            return
          }
          startRect = items[fromIndex].rect
          if (items.length > 1) {
            dragSpan = fromIndex < items.length - 1
              ? items[fromIndex + 1].contentTop - items[fromIndex].contentTop
              : items[fromIndex].contentTop - items[fromIndex - 1].contentTop
          } else {
            dragSpan = startRect.height
          }

          // Clone floating card
          ghost = rowEl.cloneNode(true)
          ghost.removeAttribute('id')
          ghost.removeAttribute('data-drag-item')
          ghost.removeAttribute('data-drag-index')
          ghost.classList.add('smp-drag-ghost')
          ghost.style.position = 'fixed'
          ghost.style.left = startRect.left + 'px'
          ghost.style.top = startRect.top + 'px'
          ghost.style.width = startRect.width + 'px'
          ghost.style.height = startRect.height + 'px'
          ghost.style.margin = '0'
          ghost.style.zIndex = '2147482500'
          ghost.style.pointerEvents = 'none'
          ghost.style.transform = 'translate3d(0px, 0px, 0) scale(1)'
          document.body.appendChild(ghost)

          rowEl.classList.add('smp-drag-placeholder')
          container.classList.add('smp-dragging-container')
          document.body.classList.add('smp-dragging-body')

          // Trigger lift visual frame
          window.requestAnimationFrame(() => {
            if (ghost && !settled) {
              ghost.classList.add('smp-drag-ghost-lifted')
              updateGhostAndTarget()
            }
          })
          rafScrollId = window.requestAnimationFrame(stepAutoScroll)
        }

        const detachListeners = () => {
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerup', onUp)
          window.removeEventListener('pointercancel', onCancel)
          window.removeEventListener('keydown', onKeyDown, true)
        }

        const cleanupHard = () => {
          if (rafScrollId) {
            window.cancelAnimationFrame(rafScrollId)
            rafScrollId = 0
          }
          if (settleTimer) {
            window.clearTimeout(settleTimer)
            settleTimer = 0
          }
          detachListeners()
          container.classList.remove('smp-dragging-container')
          document.body.classList.remove('smp-dragging-body')
          for (const it of items) {
            it.el.style.transition = 'none'
            it.el.style.transform = ''
            it.el.classList.remove('smp-drag-placeholder')
          }
          // Flush layout so transition:none applies before removing inline override
          void container.offsetHeight
          for (const it of items) {
            it.el.style.transition = ''
          }
          if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost)
          ghost = null
          if (dragActiveRef) dragActiveRef.current = false
          activeCleanupRef.current = null
        }

        const finish = cancelled => {
          if (settled) return
          settled = true
          detachListeners()
          if (rafScrollId) {
            window.cancelAnimationFrame(rafScrollId)
            rafScrollId = 0
          }
          if (!activated) {
            activeCleanupRef.current = null
            return
          }
          if (suppressClickUntilRef) suppressClickUntilRef.current = Date.now() + 260

          const finalIndex = cancelled ? fromIndex : targetIndex
          if (cancelled) {
            for (const it of items) it.el.style.transform = ''
          }
          if (ghost && startRect) {
            const cRect = container.getBoundingClientRect()
            const landingContentTop = computeLandingContentTop(items, fromIndex, finalIndex)
            const landingViewportTop = cRect.top + landingContentTop - container.scrollTop
            const finalDy = landingViewportTop - startRect.top
            ghost.classList.remove('smp-drag-ghost-lifted')
            ghost.classList.add('smp-drag-ghost-settling')
            ghost.style.transform = `translate3d(0px, ${finalDy}px, 0) scale(1)`
          }

          settleTimer = window.setTimeout(() => {
            const shouldCommit = !cancelled && finalIndex !== fromIndex
            if (shouldCommit && typeof onReorder === 'function') {
              if (flushSync) {
                try { flushSync(() => { onReorder(fromIndex, finalIndex) }) } catch (e) { onReorder(fromIndex, finalIndex) }
              } else {
                onReorder(fromIndex, finalIndex)
              }
            }
            cleanupHard()
          }, 190)
        }

        const onMove = moveEvent => {
          latestX = moveEvent.clientX
          latestY = moveEvent.clientY
          if (!activated) {
            if (Math.hypot(latestX - startX, latestY - startY) < 5) return
            activate()
          }
          moveEvent.preventDefault()
          updateGhostAndTarget()
        }

        const onUp = () => finish(false)
        const onCancel = () => finish(true)
        const onKeyDown = keyEvent => {
          if (keyEvent.key === 'Escape' && activated) {
            keyEvent.preventDefault()
            keyEvent.stopPropagation()
            finish(true)
          }
        }

        activeCleanupRef.current = cleanupHard
        window.addEventListener('pointermove', onMove, { passive: false })
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onCancel)
        window.addEventListener('keydown', onKeyDown, true)
      }, [enabled, containerRef, onReorder, dragActiveRef, suppressClickUntilRef])

      return startPointerDown
    }

    /* ----------------------------------------------------------------- icons */

    function lineIcon(paths, size) {
      const w = size || 14
      return h('svg', {
        viewBox: '0 0 16 16',
        width: w,
        height: w,
        'aria-hidden': 'true',
        focusable: 'false',
        style: { flex: 'none' },
      }, paths.map((d, i) => h('path', {
        key: i,
        d,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      })))
    }

    const iconModels = () => lineIcon(['M3 4.5h10', 'M3 8h10', 'M3 11.5h6'])
    const iconChevron = () => lineIcon(['M4.5 6.5L8 10l3.5-3.5'], 12)
    const iconSearch = () => lineIcon(['M11 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z', 'M10.2 10.2L14 14'], 13)
    const iconCheck = () => lineIcon(['M3.5 8.5l3 3 6-6'], 12)
    const iconClose = () => lineIcon(['M4 4l8 8', 'M12 4l-8 8'], 12)
    const iconClock = () => lineIcon(['M8 4.2v4l2.6 1.6', 'M14 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z'], 12)
    const iconWarn = () => lineIcon(['M8 2.6l5.6 10.4H2.4L8 2.6Z', 'M8 6.6v3'], 12)
    const iconReload = () => lineIcon(['M13 8a5 5 0 1 1-1.7-3.75', 'M13.1 2.4v3.1H10'], 12)
    const iconSpark = () => lineIcon(['M8.8 2.2L4.2 8.6h3.4L7.2 13.8l4.6-6.4H8.4l.4-5.2Z'], 12)
    const iconGear = () => lineIcon([
      'M8 10.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z',
      'M8 2.2v1.3', 'M8 12.5v1.3', 'M2.2 8h1.3', 'M12.5 8h1.3',
      'M3.9 3.9l.95.95', 'M11.15 11.15l.95.95', 'M12.1 3.9l-.95.95', 'M4.85 11.15l-.95.95',
    ], 13)
    const iconPlus = () => lineIcon(['M8 3.2v9.6', 'M3.2 8h9.6'], 12)
    const iconTrash = () => lineIcon(['M3.2 4.6h9.6', 'M6 4.6V3.2h4v1.4', 'M4.6 4.6l.6 8.2h5.6l.6-8.2'], 12)
    const iconEdit = () => lineIcon(['M10.8 2.8l2.4 2.4-7.4 7.4-2.8.4.4-2.8 7.4-7.4Z'], 12)
    const iconBack = () => lineIcon(['M9.8 3.5L5.2 8l4.6 4.5'], 13)
    const iconDownload = () => lineIcon(['M8 2.8v7.4', 'M5.2 7.6L8 10.4l2.8-2.8', 'M3 12.6h10'], 12)
    const iconUpload = () => lineIcon(['M8 10.4V3', 'M5.2 5.6L8 2.8l2.8 2.8', 'M3 12.6h10'], 12)
    const iconCopy = () => lineIcon(['M5.5 5.5h7.3v7.3H5.5Z', 'M3.2 10.5V3.2h7.3'], 12)
    const iconLayers = () => lineIcon(['M8 2.5L2.4 5.5 8 8.5l5.6-3L8 2.5Z', 'M2.4 8.5L8 11.5l5.6-3', 'M2.4 11.2L8 14.2l5.6-3'], 13)

    function iconGrip() {
      return h('svg', {
        viewBox: '0 0 12 16',
        width: 10,
        height: 13,
        'aria-hidden': 'true',
        focusable: 'false',
        className: 'smp-grip',
      }, [
        h('circle', { key: '1', cx: 3.5, cy: 4.5, r: 1.1, fill: 'currentColor' }),
        h('circle', { key: '2', cx: 8.5, cy: 4.5, r: 1.1, fill: 'currentColor' }),
        h('circle', { key: '3', cx: 3.5, cy: 8, r: 1.1, fill: 'currentColor' }),
        h('circle', { key: '4', cx: 8.5, cy: 8, r: 1.1, fill: 'currentColor' }),
        h('circle', { key: '5', cx: 3.5, cy: 11.5, r: 1.1, fill: 'currentColor' }),
        h('circle', { key: '6', cx: 8.5, cy: 11.5, r: 1.1, fill: 'currentColor' }),
      ])
    }

    function starIcon(filled) {
      return h('svg', {
        viewBox: '0 0 16 16',
        width: 13,
        height: 13,
        'aria-hidden': 'true',
        focusable: 'false',
        style: { flex: 'none' },
      }, h('path', {
        d: 'M8 1.9l1.86 3.82 4.2.6-3.03 2.96.72 4.2L8 11.5l-3.75 1.98.72-4.2L1.94 6.32l4.2-.6L8 1.9Z',
        fill: filled ? 'currentColor' : 'none',
        stroke: 'currentColor',
        strokeWidth: filled ? 0.8 : 1.3,
        strokeLinejoin: 'round',
      }))
    }

    function spinner() {
      return h('span', { className: 'smp-spin', 'aria-hidden': 'true' })
    }

    /* ---------------------------------------------------------------- styles */

    const STYLE_ID = 'dsh-smooth-model-picker-styles'
    const CSS = `
.smp-seat{display:inline-flex;align-items:center;gap:5px;min-width:0}
.smp-trigger{display:inline-flex;align-items:center;gap:6px;min-width:0;height:28px;max-width:230px;padding:0 9px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1;cursor:pointer;transition:background-color 140ms ease,border-color 140ms ease}
.smp-trigger:hover{background:var(--dsw-alias-bg-layer-2)}
.smp-trigger[data-open="true"]{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1)}
.smp-trigger:disabled{opacity:.55;cursor:not-allowed}
.smp-trigger:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.smp-trigger[data-fallback="true"]{color:var(--dsw-alias-state-warn-primary);border-color:var(--dsw-alias-border-l1)}
.smp-trigger-icon{display:var(--dsh-composer-model-icon-display,inline-flex);color:var(--dsw-alias-label-secondary)}
.smp-trigger-dot{width:6px;height:6px;border-radius:50%;background:var(--smp-accent,var(--dsw-alias-brand-primary));box-shadow:0 0 0 2px color-mix(in srgb,var(--smp-accent,var(--dsw-alias-brand-primary)) 22%,transparent);flex:none}
.smp-trigger-text{display:var(--dsh-composer-model-text-display,inline);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.smp-chevron{display:inline-flex;color:var(--dsw-alias-label-secondary);transition:transform 180ms cubic-bezier(0.22,1,0.36,1)}
.smp-trigger[data-open="true"] .smp-chevron{transform:rotate(180deg)}

.smp-effort-pill{--smp-tone:#6366f1;display:inline-flex;align-items:center;gap:4px;height:26px;padding:0 9px;border:1px solid color-mix(in srgb,var(--smp-tone) 30%,var(--dsw-alias-border-l1));border-radius:999px;background:color-mix(in srgb,var(--smp-tone) 9%,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font:inherit;font-size:11.5px;font-weight:500;line-height:1;cursor:pointer;transition:background-color 150ms ease,border-color 150ms ease,color 150ms ease,transform 120ms ease,box-shadow 150ms ease;white-space:nowrap}
.smp-effort-pill:hover{background:color-mix(in srgb,var(--smp-tone) 15%,var(--dsw-alias-bg-layer-2));border-color:color-mix(in srgb,var(--smp-tone) 48%,var(--dsw-alias-border-l2))}
.smp-effort-pill[data-open="true"]{border-color:color-mix(in srgb,var(--smp-tone) 70%,transparent);box-shadow:0 0 0 2px color-mix(in srgb,var(--smp-tone) 18%,transparent);background:color-mix(in srgb,var(--smp-tone) 15%,var(--dsw-alias-bg-layer-2))}
.smp-effort-pill:active{transform:scale(0.96)}
.smp-effort-pill:disabled{opacity:.5;cursor:not-allowed}
.smp-effort-pill svg{color:var(--smp-tone);flex:none}
.smp-pill-label-wrap{display:inline-grid;place-items:center;min-width:0}
.smp-pill-label-sizer{grid-area:1/1;visibility:hidden;height:0;overflow:hidden;pointer-events:none;white-space:nowrap}
.smp-pill-label-text{grid-area:1/1;white-space:nowrap}

.smp-spin{width:12px;height:12px;border-radius:50%;border:1.6px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-brand-primary);animation:smp-rotate .7s linear infinite;flex:none}
@keyframes smp-rotate{to{transform:rotate(360deg)}}
@keyframes smp-pop-in{from{opacity:0;transform:translateY(6px) scale(0.975)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes smp-pop-out{from{opacity:1;transform:translateY(0) scale(1)}to{opacity:0;transform:translateY(4px) scale(0.98)}}

/* Frosted macOS-inspired panel (A) */
.smp-panel{box-sizing:border-box;position:fixed;z-index:2147482000;display:flex;flex-direction:column;overflow:hidden;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 84%,transparent);-webkit-backdrop-filter:blur(22px) saturate(165%);backdrop-filter:blur(22px) saturate(165%);color:var(--dsw-alias-label-primary);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l2) 85%,transparent);border-radius:14px;box-shadow:0 22px 58px rgba(0,0,0,.28),0 4px 14px rgba(0,0,0,.12),inset 0 1px 0 color-mix(in srgb,#ffffff 12%,transparent);font-size:13px;animation:smp-pop-in 170ms cubic-bezier(0.22,1,0.36,1);transform-origin:bottom left}
.smp-effort-popover{--smp-tone:#6366f1;box-sizing:border-box;position:fixed;z-index:2147482050;min-width:236px;max-width:min(380px,calc(100vw - 24px));display:flex;flex-direction:column;gap:8px;padding:10px 12px 11px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 86%,transparent);-webkit-backdrop-filter:blur(20px) saturate(165%);backdrop-filter:blur(20px) saturate(165%);color:var(--dsw-alias-label-primary);border:1px solid color-mix(in srgb,var(--smp-tone) 30%,var(--dsw-alias-border-l2));border-radius:13px;box-shadow:0 16px 40px rgba(0,0,0,.26),0 2px 8px rgba(0,0,0,.1),inset 0 1px 0 color-mix(in srgb,#ffffff 12%,transparent);font-size:12px;animation:smp-pop-in 145ms cubic-bezier(0.22,1,0.36,1);transition:border-color 220ms ease}
.smp-effort-popover[data-closing="true"]{animation:smp-pop-out 130ms ease forwards;pointer-events:none}
.smp-effort-popover-head{display:flex;align-items:center;justify-content:space-between;gap:12px;color:var(--dsw-alias-label-secondary);font-size:11px;padding:0 2px}
.smp-effort-popover-title{display:inline-flex;align-items:center;gap:5px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.smp-effort-popover-title svg{color:var(--smp-tone);transition:color 200ms ease}
.smp-effort-popover-hint{flex:none;font-size:10.5px;opacity:.65}

.smp-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none;transition:background-color 120ms ease,color 120ms ease}
.smp-icon-btn:hover{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 85%,transparent);color:var(--dsw-alias-label-primary)}
.smp-icon-btn[data-spinning="true"] svg{animation:smp-rotate .8s linear infinite}

.smp-body{display:flex;min-height:0;flex:1}
/* Two-tone depth: full-height softly recessed left rail column with pinned bottom Settings button (A) */
.smp-rail-col{width:198px;flex:none;display:flex;flex-direction:column;min-height:0;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 66%,transparent);border-right:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 80%,transparent)}
.smp-rail{flex:1;min-height:0;display:flex;flex-direction:column;gap:2px;padding:10px 7px 8px;overflow-y:auto;overflow-x:hidden}
.smp-rail-footer{flex:none;padding:7px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 70%,transparent)}
.smp-manage-btn{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;height:36px;padding:0 11px;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 85%,transparent);border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 56%,transparent);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;font-weight:500;cursor:pointer;transition:background-color 140ms ease,border-color 140ms ease,transform 110ms ease,box-shadow 140ms ease}
.smp-manage-btn:hover{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 92%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 42%,var(--dsw-alias-border-l2));box-shadow:0 2px 8px rgba(0,0,0,.08)}
.smp-manage-btn:active{transform:scale(0.98)}
.smp-manage-btn-left{display:inline-flex;align-items:center;gap:7px;min-width:0}
.smp-manage-btn-left svg{color:var(--dsw-alias-brand-primary);flex:none}
.smp-manage-btn-arrow{display:inline-flex;color:var(--dsw-alias-label-secondary);opacity:.7;transform:rotate(-90deg)}
.smp-rail-sep{height:1px;margin:6px 8px;background:color-mix(in srgb,var(--dsw-alias-border-l1) 75%,transparent);flex:none}
.smp-rail-providers{display:flex;flex-direction:column;gap:2px;position:relative}
.smp-rail-item{position:relative;display:flex;align-items:center;gap:7px;width:100%;box-sizing:border-box;padding:7px 9px;border:0;border-radius:9px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;text-align:left;cursor:pointer;user-select:none;transition:background-color 130ms ease,color 130ms ease}
.smp-rail-item:hover{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 72%,transparent);color:var(--dsw-alias-label-primary)}
.smp-rail-item[data-active="true"]{background:color-mix(in srgb,var(--smp-accent,var(--dsw-alias-brand-primary)) 13%,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary);font-weight:500}
.smp-rail-item[data-active="true"]::before{content:'';position:absolute;left:2px;top:50%;width:3px;height:16px;border-radius:999px;background:var(--smp-accent,var(--dsw-alias-brand-primary));transform:translateY(-50%)}
.smp-rail-item[data-failed="true"]{color:var(--dsw-alias-state-error-primary)}
.smp-rail-item:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.smp-rail-icon{display:inline-flex;color:var(--dsw-alias-label-secondary);transition:color 130ms ease}
.smp-rail-item[data-fav-tab="true"] .smp-rail-icon{color:#f59e0b}
.smp-rail-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.smp-vendor-dot{width:6px;height:6px;border-radius:50%;background:var(--smp-accent,var(--dsw-alias-brand-primary));opacity:.85;flex:none;transition:transform 140ms ease,box-shadow 140ms ease,opacity 140ms ease}
.smp-rail-item:hover .smp-vendor-dot,.smp-rail-item[data-active="true"] .smp-vendor-dot{opacity:1}
.smp-vendor-dot[data-current-prov="true"]{opacity:1;box-shadow:0 0 0 3px color-mix(in srgb,var(--smp-accent,var(--dsw-alias-brand-primary)) 26%,transparent)}
.smp-rail-count{flex:none;font-size:11px;color:var(--dsw-alias-label-secondary);opacity:.72;font-variant-numeric:tabular-nums}

.smp-list-wrap{display:flex;flex-direction:column;min-width:0;flex:1;background:transparent}
/* Unified right-pane toolbar: view title + subtle recessed search pill */
.smp-list-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px 8px 13px;border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 55%,transparent)}
.smp-list-head-left{display:inline-flex;align-items:center;gap:6px;min-width:0;color:var(--dsw-alias-label-secondary);font-size:12px}
.smp-list-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;color:var(--dsw-alias-label-primary)}
.smp-list-count{flex:none;font-size:11px;opacity:.68;font-variant-numeric:tabular-nums}
.smp-list-head-right{display:inline-flex;align-items:center;gap:4px;flex:none}
.smp-search-pill{display:inline-flex;align-items:center;gap:5px;width:132px;height:26px;padding:0 7px 0 8px;border-radius:8px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 54%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 70%,transparent);color:var(--dsw-alias-label-secondary);transition:width 210ms cubic-bezier(0.22,1,0.36,1),background-color 150ms ease,border-color 150ms ease,box-shadow 150ms ease}
.smp-search-pill:hover{background:color-mix(in srgb,var(--dsw-alias-bg-base) 74%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-border-l2) 80%,transparent)}
.smp-search-pill[data-active="true"]{width:176px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 88%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 42%,var(--dsw-alias-border-l2));box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent);color:var(--dsw-alias-label-primary)}
.smp-search-pill svg{flex:none;opacity:.68}
.smp-search-pill[data-active="true"] svg{opacity:.95}
.smp-search-pill input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:1}
.smp-search-pill input::placeholder{color:var(--dsw-alias-label-secondary);opacity:.72}
.smp-search-clear{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;padding:0;border:0;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-secondary) 16%,transparent);color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none;transition:background-color 120ms ease,color 120ms ease}
.smp-search-clear:hover{background:color-mix(in srgb,var(--dsw-alias-label-secondary) 28%,transparent);color:var(--dsw-alias-label-primary)}
.smp-list{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:6px 8px 9px;outline:0;display:flex;flex-direction:column;gap:2px}

/* Refined thin scrollbars */
.smp-rail::-webkit-scrollbar,.smp-list::-webkit-scrollbar{width:6px;height:6px}
.smp-rail::-webkit-scrollbar-track,.smp-list::-webkit-scrollbar-track{background:transparent}
.smp-rail::-webkit-scrollbar-thumb,.smp-list::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--dsw-alias-label-secondary) 24%,transparent);border-radius:999px}
.smp-rail::-webkit-scrollbar-thumb:hover,.smp-list::-webkit-scrollbar-thumb:hover{background:color-mix(in srgb,var(--dsw-alias-label-secondary) 42%,transparent)}

.smp-row{position:relative;display:flex;align-items:center;gap:6px;box-sizing:border-box;padding:7.5px 9px;border-radius:9px;cursor:pointer;color:var(--dsw-alias-label-primary);user-select:none;transition:background-color 130ms ease}
.smp-row:hover{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 72%,transparent)}
.smp-row[data-cursor="true"]{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 78%,transparent)}
.smp-row[data-current="true"]{background:color-mix(in srgb,var(--smp-accent,var(--dsw-alias-brand-primary)) 12%,var(--dsw-alias-bg-layer-2))}
.smp-row[data-current="true"]::before{content:'';position:absolute;left:2px;top:50%;width:3px;height:16px;border-radius:999px;background:var(--smp-accent,var(--dsw-alias-brand-primary));transform:translateY(-50%)}
.smp-row-main{display:flex;align-items:center;gap:7px;min-width:0;flex:1}
.smp-row-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.smp-row[data-current="true"] .smp-row-name{font-weight:500}
.smp-row-prov{display:inline-flex;align-items:center;gap:4px;flex:none;font-size:10.5px;padding:1.5px 7px;border-radius:999px;background:color-mix(in srgb,var(--smp-accent,var(--dsw-alias-brand-primary)) 10%,transparent);color:var(--dsw-alias-label-secondary);border:1px solid color-mix(in srgb,var(--smp-accent,var(--dsw-alias-brand-primary)) 24%,transparent)}
.smp-row-prov-dot{width:5px;height:5px;border-radius:50%;background:var(--smp-accent,var(--dsw-alias-brand-primary));flex:none}
.smp-row-check{display:inline-flex;color:var(--smp-accent,var(--dsw-alias-brand-primary));flex:none}
.smp-badge{flex:none;padding:1px 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:10px}
.smp-hl{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 24%,transparent);color:var(--dsw-alias-label-primary);border-radius:3px;padding:0 1px}

.smp-grip{flex:none;color:var(--dsw-alias-label-secondary);opacity:0;transition:opacity 140ms ease;margin-left:-2px}
.smp-row[data-draggable="true"]:hover .smp-grip,.smp-rail-item[data-draggable="true"]:hover .smp-grip{opacity:.5}
.smp-drag-ghost .smp-grip{opacity:.85}

/* Warm amber gold favorites star (A) */
.smp-star{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;opacity:.36;transition:opacity 130ms ease,color 140ms ease,transform 150ms cubic-bezier(0.22,1,0.36,1)}
.smp-row:hover .smp-star,.smp-star[aria-pressed="true"]{opacity:1}
.smp-star:hover{color:#f59e0b;transform:scale(1.12)}
.smp-star[aria-pressed="true"]{color:#f59e0b;filter:drop-shadow(0 0 4px rgba(245,158,11,.28))}
.smp-star:active{transform:scale(0.9)}

/* Smooth drag physics classes */
.smp-dragging-body,.smp-dragging-body *{cursor:grabbing !important;user-select:none !important}
.smp-dragging-container [data-drag-item="true"]{transition:transform 210ms cubic-bezier(0.22,1,0.36,1);will-change:transform}
.smp-dragging-container .smp-row:hover,.smp-dragging-container .smp-rail-item:hover{background:transparent}
.smp-drag-placeholder{background:color-mix(in srgb,var(--smp-accent,var(--dsw-alias-brand-primary)) 9%,transparent) !important;border:1px dashed color-mix(in srgb,var(--smp-accent,var(--dsw-alias-brand-primary)) 45%,transparent) !important;box-shadow:none !important}
.smp-drag-placeholder::before{display:none !important}
.smp-drag-placeholder > *{visibility:hidden !important}
.smp-drag-ghost{background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 92%,transparent) !important;-webkit-backdrop-filter:blur(16px) saturate(160%);backdrop-filter:blur(16px) saturate(160%);color:var(--dsw-alias-label-primary) !important;border:1px solid var(--dsw-alias-border-l2) !important;border-radius:9px !important;box-shadow:0 4px 12px rgba(0,0,0,.18);will-change:transform;transition:box-shadow 160ms ease,border-color 160ms ease}
.smp-drag-ghost-lifted{border-color:color-mix(in srgb,var(--smp-accent,var(--dsw-alias-brand-primary)) 68%,transparent) !important;box-shadow:0 18px 40px rgba(0,0,0,.32),0 4px 12px rgba(0,0,0,.14),0 0 0 1px color-mix(in srgb,var(--smp-accent,var(--dsw-alias-brand-primary)) 32%,transparent),inset 0 1px 0 color-mix(in srgb,#ffffff 16%,transparent) !important}
.smp-drag-ghost-settling{transition:transform 185ms cubic-bezier(0.22,1,0.36,1),box-shadow 185ms ease,border-color 185ms ease !important;box-shadow:0 2px 6px rgba(0,0,0,.1) !important;border-color:transparent !important}

/* Effort segmented track with tactile drag-slide & spring glide (B) */
.smp-effort-track{position:relative;display:flex;align-items:stretch;width:100%;box-sizing:border-box;padding:3px;border-radius:11px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 76%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 85%,transparent);touch-action:none;user-select:none;cursor:grab}
.smp-effort-track[data-scrubbing="true"]{cursor:grabbing}
.smp-effort-slider{position:absolute;top:3px;bottom:3px;left:0;border-radius:8px;background:color-mix(in srgb,var(--smp-tone,#6366f1) 16%,var(--dsw-alias-bg-overlay));border:1px solid color-mix(in srgb,var(--smp-tone,#6366f1) 56%,transparent);box-shadow:0 2px 8px rgba(0,0,0,.16),0 0 0 1px color-mix(in srgb,var(--smp-tone,#6366f1) 14%,transparent);pointer-events:none;will-change:transform,width}
.smp-effort-slider[data-animated="true"]{transition:transform 260ms cubic-bezier(0.22,1.15,0.36,1),width 240ms cubic-bezier(0.22,1.1,0.36,1),border-color 200ms ease,background-color 200ms ease,box-shadow 180ms ease,opacity 140ms ease}
.smp-effort-slider[data-scrubbing="true"]{transition:width 140ms ease,border-color 180ms ease,background-color 180ms ease,box-shadow 140ms ease;box-shadow:0 6px 18px rgba(0,0,0,.24),0 0 0 2px color-mix(in srgb,var(--smp-tone,#6366f1) 24%,transparent)}
.smp-effort-btn{position:relative;z-index:1;flex:1 1 0;min-width:max-content;display:inline-grid;place-items:center;padding:5px 12px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:1.2;cursor:inherit;white-space:nowrap;transition:color 160ms ease}
.smp-effort-btn:hover{color:var(--dsw-alias-label-primary)}
.smp-effort-btn[aria-pressed="true"]{color:var(--smp-tone,#6366f1);font-weight:600}
.smp-effort-btn-sizer{grid-area:1/1;visibility:hidden;font-weight:600;height:0;overflow:hidden;pointer-events:none;white-space:nowrap}
.smp-effort-btn-text{grid-area:1/1;white-space:nowrap}

.smp-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6.5px 12px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 65%,transparent);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 30%,transparent);color:var(--dsw-alias-label-secondary);font-size:11px}
.smp-foot-hint{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.78}
.smp-link{padding:2px 7px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;cursor:pointer;flex:none;transition:background-color 120ms ease,color 120ms ease}
.smp-link:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 85%,transparent);color:var(--dsw-alias-label-primary)}
.smp-link:disabled{opacity:.38;cursor:default}

/* Management Modal — spacious macOS frosted glass + two-tone A+B craft */
@keyframes smp-fade-in{from{opacity:0}to{opacity:1}}
@keyframes smp-modal-in{from{opacity:0;transform:translateY(10px) scale(0.975)}to{opacity:1;transform:translateY(0) scale(1)}}
.smp-mgr-backdrop{position:fixed;inset:0;z-index:2147482300;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.4);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:smp-fade-in 150ms ease}
.smp-mgr-dialog{box-sizing:border-box;display:flex;width:min(820px,92vw);height:min(620px,86vh);overflow:hidden;border-radius:16px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 88%,transparent);-webkit-backdrop-filter:blur(26px) saturate(165%);backdrop-filter:blur(26px) saturate(165%);color:var(--dsw-alias-label-primary);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l2) 85%,transparent);box-shadow:0 28px 72px rgba(0,0,0,.38),0 4px 16px rgba(0,0,0,.16),inset 0 1px 0 color-mix(in srgb,#ffffff 14%,transparent);font-size:13px;animation:smp-modal-in 190ms cubic-bezier(0.22,1,0.36,1)}
.smp-mgr-nav{width:190px;flex:none;display:flex;flex-direction:column;gap:3px;padding:16px 10px 12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 68%,transparent);border-right:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 80%,transparent)}
.smp-mgr-nav-top{display:flex;flex-direction:column;gap:3px;flex:1;min-height:0}
.smp-mgr-nav-foot{flex:none;padding-top:10px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 70%,transparent);display:flex;flex-direction:column;gap:5px}
.smp-lang-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:2px;border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 70%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 80%,transparent)}
.smp-lang-btn{height:26px;padding:0 6px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;cursor:pointer;transition:background-color 140ms ease,color 140ms ease,box-shadow 140ms ease}
.smp-lang-btn:hover{color:var(--dsw-alias-label-primary)}
.smp-lang-btn[aria-pressed="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 15%,var(--dsw-alias-bg-overlay));color:var(--dsw-alias-brand-primary);font-weight:600;box-shadow:0 1px 4px rgba(0,0,0,.14)}
.smp-mgr-brand{display:flex;align-items:center;gap:8px;padding:2px 9px 12px;font-size:13.5px;font-weight:600;color:var(--dsw-alias-label-primary)}
.smp-mgr-brand svg{color:var(--dsw-alias-brand-primary)}
.smp-mgr-tab{position:relative;display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:9px 11px;border:0;border-radius:9px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;text-align:left;cursor:pointer;transition:background-color 130ms ease,color 130ms ease}
.smp-mgr-tab:hover{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 72%,transparent);color:var(--dsw-alias-label-primary)}
.smp-mgr-tab[data-active="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary);font-weight:500}
.smp-mgr-tab[data-active="true"]::before{content:'';position:absolute;left:2px;top:50%;width:3px;height:18px;border-radius:999px;background:var(--dsw-alias-brand-primary);transform:translateY(-50%)}
.smp-mgr-tab-count{font-size:11.5px;opacity:.7;font-variant-numeric:tabular-nums}
.smp-mgr-main{display:flex;flex-direction:column;min-width:0;flex:1}
.smp-mgr-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 20px 14px;border-bottom:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 65%,transparent)}
.smp-mgr-head-text{display:flex;flex-direction:column;gap:4px;min-width:0}
.smp-mgr-title{font-size:15.5px;font-weight:600;color:var(--dsw-alias-label-primary)}
.smp-mgr-desc{font-size:12px;color:var(--dsw-alias-label-secondary);opacity:.85}
.smp-mgr-head-right{display:inline-flex;align-items:center;gap:8px;flex:none}
.smp-mgr-body{flex:1;min-height:0;overflow-y:auto;padding:16px 20px 20px;display:flex;flex-direction:column;gap:12px}
.smp-mgr-body::-webkit-scrollbar{width:6px}
.smp-mgr-body::-webkit-scrollbar-track{background:transparent}
.smp-mgr-body::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--dsw-alias-label-secondary) 24%,transparent);border-radius:999px}

.smp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 13px;border-radius:9px;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l2) 85%,transparent);background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 75%,transparent);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;font-weight:500;cursor:pointer;white-space:nowrap;transition:background-color 130ms ease,border-color 130ms ease,transform 110ms ease,color 130ms ease}
.smp-btn:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.smp-btn:active:not(:disabled){transform:scale(0.97)}
.smp-btn:disabled{opacity:.42;cursor:not-allowed}
.smp-btn-primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:#fff}
.smp-btn-primary:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-brand-primary) 88%,#fff);border-color:var(--dsw-alias-brand-primary)}
.smp-btn-danger{color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 35%,var(--dsw-alias-border-l1));background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent)}
.smp-btn-danger:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 16%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 60%,transparent)}

.smp-mgr-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.smp-mgr-input{height:32px;padding:0 10px;border-radius:8px;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 85%,transparent);background:color-mix(in srgb,var(--dsw-alias-bg-base) 65%,transparent);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;outline:0;transition:border-color 140ms ease,box-shadow 140ms ease,background-color 140ms ease}
.smp-mgr-input:focus{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);background:var(--dsw-alias-bg-base)}
.smp-mgr-select{height:32px;padding:0 10px;border-radius:8px;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 85%,transparent);background:color-mix(in srgb,var(--dsw-alias-bg-base) 65%,transparent);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;outline:0;cursor:pointer}
.smp-chip{display:inline-flex;align-items:center;gap:5px;height:32px;padding:0 12px;border-radius:999px;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 85%,transparent);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;transition:background-color 130ms ease,border-color 130ms ease,color 130ms ease}
.smp-chip:hover{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 70%,transparent);color:var(--dsw-alias-label-primary)}
.smp-chip[aria-pressed="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 50%,transparent);color:var(--dsw-alias-brand-primary);font-weight:500}

.smp-mgr-list{display:flex;flex-direction:column;gap:7px}
.smp-mgr-row{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:11px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 52%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 65%,transparent);transition:background-color 120ms ease,border-color 120ms ease,opacity 140ms ease}
.smp-mgr-row:hover{border-color:color-mix(in srgb,var(--dsw-alias-border-l2) 80%,transparent)}
.smp-mgr-row[data-hidden="true"]{opacity:.62}
.smp-mgr-row-info{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}
.smp-mgr-row-top{display:flex;align-items:center;gap:6px;min-width:0}
.smp-mgr-row-name{font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.smp-mgr-row-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary);opacity:.78;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.smp-mgr-alias-wrap{display:inline-flex;align-items:center;gap:4px;flex:none}
.smp-mgr-alias-input{width:176px;height:30px;padding:0 9px;font-size:12px}

/* Unified collapsible provider/folder tree cards */
.smp-tree-card{display:flex;flex-direction:column;border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 54%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 70%,transparent);overflow:hidden;transition:border-color 140ms ease,opacity 140ms ease}
.smp-tree-card:hover{border-color:color-mix(in srgb,var(--smp-accent,var(--dsw-alias-border-l2)) 38%,var(--dsw-alias-border-l2))}
.smp-tree-card[data-hidden="true"]{opacity:.64}
.smp-tree-head{display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;user-select:none;transition:background-color 120ms ease}
.smp-tree-head:hover{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 55%,transparent)}
.smp-tree-chevron{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;color:var(--dsw-alias-label-secondary);flex:none;transform:rotate(-90deg);transition:transform 180ms cubic-bezier(0.22,1,0.36,1),color 120ms ease}
.smp-tree-card[data-expanded="true"] .smp-tree-chevron{transform:rotate(0deg);color:var(--dsw-alias-label-primary)}
.smp-tree-children{display:flex;flex-direction:column;gap:4px;padding:6px 10px 10px 28px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 58%,transparent);background:color-mix(in srgb,var(--dsw-alias-bg-base) 38%,transparent)}
.smp-tree-child{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 46%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 55%,transparent);transition:border-color 120ms ease,opacity 140ms ease}
.smp-tree-child:hover{border-color:color-mix(in srgb,var(--dsw-alias-border-l2) 78%,transparent)}
.smp-tree-child[data-hidden="true"]{opacity:.56}
.smp-tree-empty{padding:10px 8px;font-size:12px;color:var(--dsw-alias-label-secondary);opacity:.78}

/* Clickable vendor/folder color dot + floating swatch popover */
.smp-color-trigger{position:relative;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:999px;background:transparent;cursor:pointer;flex:none;transition:background-color 130ms ease,transform 120ms ease}
.smp-color-trigger:hover{background:color-mix(in srgb,var(--smp-accent,var(--dsw-alias-brand-primary)) 16%,transparent);transform:scale(1.12)}
.smp-color-trigger-dot{width:10px;height:10px;border-radius:50%;background:var(--smp-accent,var(--dsw-alias-brand-primary));box-shadow:0 0 0 2px color-mix(in srgb,var(--smp-accent,var(--dsw-alias-brand-primary)) 26%,transparent)}
.smp-color-popover{position:fixed;z-index:2147482400;display:flex;flex-direction:column;gap:8px;padding:10px 11px;border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 92%,transparent);-webkit-backdrop-filter:blur(20px) saturate(165%);backdrop-filter:blur(20px) saturate(165%);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l2) 85%,transparent);box-shadow:0 16px 38px rgba(0,0,0,.32),inset 0 1px 0 color-mix(in srgb,#ffffff 12%,transparent);animation:smp-pop-in 130ms cubic-bezier(0.22,1,0.36,1)}
.smp-color-popover-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:6px;border-top:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 65%,transparent)}
.smp-color-native{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--dsw-alias-label-secondary);cursor:pointer}
.smp-color-native input[type="color"]{width:18px;height:18px;padding:0;border:0;border-radius:4px;background:transparent;cursor:pointer}

/* Tactile macOS/iOS toggle switch */
.smp-switch{position:relative;display:inline-flex;align-items:center;width:32px;height:18px;padding:2px;border:0;border-radius:999px;background:color-mix(in srgb,var(--dsw-alias-label-secondary) 28%,transparent);cursor:pointer;flex:none;transition:background-color 180ms ease}
.smp-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary)}
.smp-switch-knob{width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform 200ms cubic-bezier(0.22,1.15,0.36,1)}
.smp-switch[aria-checked="true"] .smp-switch-knob{transform:translateX(14px)}

/* Custom group cards & editor */
.smp-group-card{display:flex;flex-direction:column;gap:8px;padding:11px 12px;border-radius:11px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 58%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 70%,transparent);transition:border-color 130ms ease}
.smp-group-card:hover{border-color:color-mix(in srgb,var(--smp-accent,var(--dsw-alias-border-l2)) 42%,var(--dsw-alias-border-l2))}
.smp-group-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.smp-group-card-title{display:inline-flex;align-items:center;gap:7px;font-weight:600;min-width:0}
.smp-group-card-actions{display:inline-flex;align-items:center;gap:4px;flex:none}
.smp-group-tags{display:flex;flex-wrap:wrap;gap:5px}
.smp-group-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:999px;font-size:11px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 65%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 75%,transparent);color:var(--dsw-alias-label-secondary)}

.smp-editor{display:flex;flex-direction:column;gap:12px;min-height:0;flex:1}
.smp-editor-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.smp-field{display:flex;flex-direction:column;gap:5px}
.smp-field-label{font-size:11.5px;font-weight:500;color:var(--dsw-alias-label-secondary)}
.smp-swatches{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.smp-swatch{width:20px;height:20px;padding:0;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform 140ms ease,box-shadow 140ms ease}
.smp-swatch:hover{transform:scale(1.12)}
.smp-swatch[aria-pressed="true"]{box-shadow:0 0 0 2px var(--dsw-alias-bg-overlay),0 0 0 4px currentColor;transform:scale(1.06)}
.smp-pick-list{display:flex;flex-direction:column;gap:3px;max-height:220px;overflow-y:auto;padding:4px;border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-bg-base) 48%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 70%,transparent)}
.smp-pick-row{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;user-select:none;transition:background-color 110ms ease}
.smp-pick-row:hover{background:color-mix(in srgb,var(--dsw-alias-bg-layer-2) 70%,transparent)}
.smp-pick-row[data-checked="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 12%,transparent)}
.smp-checkbox{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:5px;border:1.5px solid color-mix(in srgb,var(--dsw-alias-label-secondary) 45%,transparent);background:transparent;color:#fff;flex:none;transition:background-color 130ms ease,border-color 130ms ease}
.smp-pick-row[data-checked="true"] .smp-checkbox{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}

/* Backup cards */
.smp-card{display:flex;flex-direction:column;gap:9px;padding:12px 13px;border-radius:12px;background:color-mix(in srgb,var(--dsw-alias-bg-layer-1) 56%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 72%,transparent)}
.smp-card-title{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}
.smp-card-hint{font-size:11.5px;color:var(--dsw-alias-label-secondary);opacity:.85;line-height:1.45}
.smp-card-stats{display:flex;flex-wrap:wrap;gap:6px}
.smp-card-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.smp-textarea{width:100%;box-sizing:border-box;min-height:74px;padding:8px 10px;border-radius:9px;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1) 85%,transparent);background:color-mix(in srgb,var(--dsw-alias-bg-base) 68%,transparent);color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.45;resize:vertical;outline:0}
.smp-textarea:focus{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent)}
.smp-notice{padding:7px 10px;border-radius:8px;font-size:11.5px;line-height:1.4}
.smp-notice[data-kind="ok"]{background:color-mix(in srgb,#10b981 14%,transparent);color:#10b981;border:1px solid color-mix(in srgb,#10b981 30%,transparent)}
.smp-notice[data-kind="err"]{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);color:var(--dsw-alias-state-error-primary);border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 30%,transparent)}

.smp-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;height:100%;min-height:130px;padding:0 18px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.6}
.smp-empty-detail{font-size:11px;opacity:.75;word-break:break-word}
.smp-fail{display:flex;gap:8px;margin:8px;padding:10px;border-radius:9px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.55}
.smp-fail svg{color:var(--dsw-alias-state-error-primary)}
.smp-fail-body{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0}
.smp-error{padding:6px 12px;border-top:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:1.45;word-break:break-word}
@media (max-width:560px){.smp-rail-col{width:144px}.smp-mgr-dialog{flex-direction:column}.smp-mgr-nav{width:auto;flex-direction:row;overflow-x:auto;border-right:0;border-bottom:1px solid var(--dsw-alias-border-l1)}.smp-mgr-nav-top{flex-direction:row}.smp-mgr-nav-foot{padding-top:0;border-top:0}}
`

    function installStyles() {
      if (typeof document === 'undefined') return () => {}
      if (document.getElementById(STYLE_ID)) return () => {}
      const el = document.createElement('style')
      el.id = STYLE_ID
      el.textContent = CSS
      document.head.appendChild(el)
      return () => { el.remove() }
    }

    /* -------------------------------------------------- EffortSegmentedTrack */

    function EffortSegmentedTrack({ efforts, activeId, resolveText, onPreview, onCommit, scrubbingRef }) {
      const trackRef = useRef(null)
      const btnRefs = useRef(new Map())
      const hasMeasuredRef = useRef(false)
      const [animated, setAnimated] = useState(false)
      const [scrubbing, setScrubbing] = useState(false)
      const [slider, setSlider] = useState({ left: 0, width: 0, visible: false })
      const cleanupRef = useRef(null)
      const lastWheelRef = useRef(0)

      useEffect(() => () => {
        if (cleanupRef.current) cleanupRef.current()
      }, [])

      const measure = useCallback(targetId => {
        const id = targetId !== undefined ? targetId : activeId
        const activeBtn = btnRefs.current.get(id)
        if (!activeBtn) {
          setSlider(prev => (prev.visible ? { left: 0, width: 0, visible: false } : prev))
          return
        }
        const left = activeBtn.offsetLeft
        const width = activeBtn.offsetWidth
        setSlider(prev => (
          prev.visible && prev.left === left && prev.width === width
            ? prev
            : { left, width, visible: width > 0 }
        ))
        if (!hasMeasuredRef.current && width > 0) {
          hasMeasuredRef.current = true
          window.requestAnimationFrame(() => setAnimated(true))
        }
      }, [activeId])

      useLayoutEffect(() => {
        if (!scrubbing) measure(activeId)
      }, [measure, efforts, activeId, scrubbing])

      useEffect(() => {
        if (scrubbing) return undefined
        const t = window.setTimeout(() => measure(activeId), 30)
        const track = trackRef.current
        if (!track || typeof ResizeObserver === 'undefined') {
          return () => window.clearTimeout(t)
        }
        const ro = new ResizeObserver(() => measure(activeId))
        ro.observe(track)
        return () => {
          window.clearTimeout(t)
          ro.disconnect()
        }
      }, [measure, efforts, activeId, scrubbing])

      const readSegments = useCallback(() => {
        return efforts.map(effort => {
          const btn = btnRefs.current.get(effort.id)
          return {
            id: effort.id,
            left: btn ? btn.offsetLeft : 0,
            width: btn ? btn.offsetWidth : 0,
          }
        })
      }, [efforts])

      const onTrackPointerDown = useCallback(event => {
        if (event.button !== 0 || efforts.length <= 1) return
        event.preventDefault()
        event.stopPropagation()
        const track = trackRef.current
        if (!track) return
        const segments = readSegments()
        if (segments.length === 0) return

        const trackRect = track.getBoundingClientRect()
        const minLeft = segments[0].left
        const lastSeg = segments[segments.length - 1]
        const maxRight = lastSeg.left + lastSeg.width
        const startX = event.clientX
        let dragged = false
        let currentIdx = Math.max(0, efforts.findIndex(e => e.id === activeId))

        // Immediate preview if pointer starts over a different segment
        const initialRelX = startX - trackRect.left
        const initialHit = computeEffortScrubIndex(segments, initialRelX)

        const finish = cancelled => {
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerup', onUp)
          window.removeEventListener('pointercancel', onCancel)
          cleanupRef.current = null
          if (scrubbingRef) scrubbingRef.current = false
          setScrubbing(false)

          if (cancelled) {
            if (typeof onPreview === 'function') onPreview(null)
            measure(activeId)
            return
          }
          const finalIdx = dragged ? currentIdx : initialHit
          const chosen = efforts[finalIdx]
          if (!chosen) return
          const seg = segments[finalIdx]
          if (seg && seg.width > 0) {
            setSlider({ left: seg.left, width: seg.width, visible: true })
          }
          if (typeof onCommit === 'function') onCommit(chosen.id, true)
        }

        const onMove = moveEvent => {
          const dx = moveEvent.clientX - startX
          if (!dragged && Math.abs(dx) < 4) return
          if (!dragged) {
            dragged = true
            if (scrubbingRef) scrubbingRef.current = true
            setScrubbing(true)
            setAnimated(true)
          }
          moveEvent.preventDefault()
          const relX = moveEvent.clientX - trackRect.left
          const hitIdx = computeEffortScrubIndex(segments, relX)
          const seg = segments[hitIdx]
          if (!seg) return
          if (hitIdx !== currentIdx) {
            currentIdx = hitIdx
            if (typeof onPreview === 'function') onPreview(efforts[hitIdx].id)
          }
          const thumbLeft = clampSliderLeft(relX, seg.width, minLeft, maxRight)
          setSlider({ left: thumbLeft, width: seg.width, visible: true })
        }

        const onUp = () => finish(false)
        const onCancel = () => finish(true)
        cleanupRef.current = () => {
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerup', onUp)
          window.removeEventListener('pointercancel', onCancel)
          if (scrubbingRef) scrubbingRef.current = false
        }

        window.addEventListener('pointermove', onMove, { passive: false })
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onCancel)
      }, [efforts, activeId, readSegments, measure, onPreview, onCommit, scrubbingRef])

      useEffect(() => {
        const track = trackRef.current
        if (!track || efforts.length <= 1) return undefined
        const handleWheel = event => {
          event.preventDefault()
          event.stopPropagation()
          const now = Date.now()
          if (now - lastWheelRef.current < 160) return
          const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
          if (Math.abs(delta) < 6) return
          lastWheelRef.current = now
          const curIdx = Math.max(0, efforts.findIndex(e => e.id === activeId))
          const nextIdx = Math.max(0, Math.min(efforts.length - 1, curIdx + (delta > 0 ? 1 : -1)))
          if (nextIdx !== curIdx && typeof onCommit === 'function') {
            onCommit(efforts[nextIdx].id, false)
          }
        }
        track.addEventListener('wheel', handleWheel, { passive: false })
        return () => { track.removeEventListener('wheel', handleWheel) }
      }, [efforts, activeId, onCommit])

      return h('div', {
        ref: trackRef,
        className: 'smp-effort-track',
        role: 'radiogroup',
        'data-scrubbing': scrubbing ? 'true' : 'false',
        onPointerDown: onTrackPointerDown,
      },
        h('div', {
          className: 'smp-effort-slider',
          'aria-hidden': 'true',
          'data-animated': animated ? 'true' : 'false',
          'data-scrubbing': scrubbing ? 'true' : 'false',
          style: {
            opacity: slider.visible ? 1 : 0,
            width: slider.width + 'px',
            transform: scrubbing
              ? `translate3d(${slider.left}px, 0, 0) scale(1.035)`
              : `translate3d(${slider.left}px, 0, 0) scale(1)`,
          },
        }),
        efforts.map(effort => {
          const pressed = activeId === effort.id
          const label = resolveEffortLabel(effort, resolveText)
          return h('button', {
            key: effort.id,
            ref: node => {
              if (node) btnRefs.current.set(effort.id, node)
              else btnRefs.current.delete(effort.id)
            },
            type: 'button',
            role: 'radio',
            className: 'smp-effort-btn',
            'aria-checked': pressed ? 'true' : 'false',
            'aria-pressed': pressed ? 'true' : 'false',
            onClick: event => {
              // Click selection is handled smoothly in onTrackPointerDown; keep keyboard Space/Enter working.
              if (event.detail === 0 && typeof onCommit === 'function') {
                event.stopPropagation()
                onCommit(effort.id, true)
              }
            },
          },
            h('span', { className: 'smp-effort-btn-sizer', 'aria-hidden': 'true' }, label),
            h('span', { className: 'smp-effort-btn-text' }, label),
          )
        }),
      )
    }

    /* ----------------------------------------------------------- ManageModal */

    function ManageModal({ copy, groups, modelIndex, prefs, rawProviderName, onClose }) {
      const [tab, setTab] = useState('catalog')
      const [catalogQuery, setCatalogQuery] = useState('')
      const [catalogFilter, setCatalogFilter] = useState('all') // 'all' | 'custom' | 'hidden'
      const [expanded, setExpanded] = useState(() => new Set())
      // Floating color swatch popover: null | { kind: 'provider'|'custom', id, color, hasCustom, left, top }
      const [colorPicker, setColorPicker] = useState(null)
      const colorPopoverRef = useRef(null)

      // Custom group editor state: null | { id, isNew, name, color, models: Array, modelAliases: Object }
      const [editor, setEditor] = useState(null)
      const [pickQuery, setPickQuery] = useState('')
      const [pickProv, setPickProv] = useState('all')

      // Backup / reset UI state
      const [importText, setImportText] = useState('')
      const [copied, setCopied] = useState(false)
      const [notice, setNotice] = useState(null)
      const [confirmResetAll, setConfirmResetAll] = useState(false)
      const fileInputRef = useRef(null)

      useEffect(() => {
        const onKeyDown = event => {
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            if (colorPicker) setColorPicker(null)
            else if (editor) setEditor(null)
            else onClose()
          }
        }
        document.addEventListener('keydown', onKeyDown, true)
        return () => document.removeEventListener('keydown', onKeyDown, true)
      }, [colorPicker, editor, onClose])

      useEffect(() => {
        if (!colorPicker) return undefined
        const onDown = event => {
          if (colorPopoverRef.current && colorPopoverRef.current.contains(event.target)) return
          setColorPicker(null)
        }
        document.addEventListener('pointerdown', onDown, true)
        return () => document.removeEventListener('pointerdown', onDown, true)
      }, [colorPicker])

      const hiddenProvSet = useMemo(() => new Set(prefs.hiddenProviders), [prefs.hiddenProviders])
      const hiddenModelSet = useMemo(() => new Set(prefs.hiddenModels), [prefs.hiddenModels])

      const allModels = useMemo(() => {
        const out = []
        for (const group of groups) {
          const pName = rawProviderName(group)
          const pAlias = prefs.providerAliases[group.id] || pName
          const accent = resolveProviderAccent(group.id, pName, prefs.providerColors)
          for (const model of Array.isArray(group.models) ? group.models : []) {
            const key = keyOf(group.id, model.id)
            out.push({
              key,
              group,
              model,
              providerName: pName,
              providerDisplay: pAlias,
              accent,
              rawModelName: model.name || model.id,
              alias: prefs.modelAliases[key] || '',
            })
          }
        }
        return out
      }, [groups, rawProviderName, prefs.providerAliases, prefs.modelAliases])

      const toggleExpand = id => {
        setExpanded(prev => {
          const next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      }

      const setProviderAlias = (providerId, value) => {
        const trimmed = String(value || '').trim().slice(0, 48)
        updatePrefs(next => {
          if (!trimmed) delete next.providerAliases[providerId]
          else next.providerAliases[providerId] = trimmed
        })
      }

      const setProviderColor = (providerId, hex) => {
        updatePrefs(next => {
          if (!hex) delete next.providerColors[providerId]
          else next.providerColors[providerId] = hex
        })
      }

      const setCustomGroupColor = (groupId, hex) => {
        if (!hex) return
        updatePrefs(next => {
          const cg = next.customGroups.find(g => g.id === groupId)
          if (cg) cg.color = hex
        })
      }

      const openColorPicker = (event, kind, id, currentColor, hasCustom) => {
        event.stopPropagation()
        const rect = event.currentTarget.getBoundingClientRect()
        const left = Math.max(12, Math.min(rect.left, window.innerWidth - 240))
        const top = Math.max(12, Math.min(rect.bottom + 6, window.innerHeight - 110))
        setColorPicker({ kind, id, color: currentColor, hasCustom, left, top })
      }

      const toggleHideProvider = providerId => {
        updatePrefs(next => {
          next.hiddenProviders = next.hiddenProviders.includes(providerId)
            ? next.hiddenProviders.filter(id => id !== providerId)
            : next.hiddenProviders.concat(providerId)
        })
      }

      const setModelAlias = (modelKey, value) => {
        const trimmed = String(value || '').trim().slice(0, 48)
        updatePrefs(next => {
          if (!trimmed) delete next.modelAliases[modelKey]
          else next.modelAliases[modelKey] = trimmed
        })
      }

      const setGroupModelAlias = (groupId, modelKey, value) => {
        const trimmed = String(value || '').trim().slice(0, 48)
        updatePrefs(next => {
          const cg = next.customGroups.find(g => g.id === groupId)
          if (!cg) return
          if (!cg.modelAliases) cg.modelAliases = {}
          if (!trimmed) delete cg.modelAliases[modelKey]
          else cg.modelAliases[modelKey] = trimmed
        })
      }

      const removeModelFromGroup = (groupId, modelKey) => {
        updatePrefs(next => {
          const cg = next.customGroups.find(g => g.id === groupId)
          if (!cg) return
          cg.models = cg.models.filter(k => k !== modelKey)
          if (cg.modelAliases) delete cg.modelAliases[modelKey]
        })
      }

      const toggleHideModel = modelKey => {
        updatePrefs(next => {
          next.hiddenModels = next.hiddenModels.includes(modelKey)
            ? next.hiddenModels.filter(k => k !== modelKey)
            : next.hiddenModels.concat(modelKey)
        })
      }

      const startCreateGroup = () => {
        setPickQuery('')
        setPickProv('all')
        setEditor({
          id: 'custom:' + Date.now().toString(36),
          isNew: true,
          name: '',
          color: CUSTOM_GROUP_PALETTE[prefs.customGroups.length % CUSTOM_GROUP_PALETTE.length],
          models: [],
          modelAliases: {},
        })
      }

      const startEditGroup = grp => {
        setPickQuery('')
        setPickProv('all')
        setEditor({
          id: grp.id,
          isNew: false,
          name: grp.name,
          color: grp.color,
          models: grp.models.slice(),
          modelAliases: Object.assign({}, grp.modelAliases),
        })
      }

      const saveEditorGroup = () => {
        if (!editor) return
        const name = editor.name.trim().slice(0, 40)
        if (!name) return
        const keptModels = uniqueStrings(editor.models)
        const keptSet = new Set(keptModels)
        const cleanedAliases = {}
        for (const k of Object.keys(editor.modelAliases || {})) {
          if (keptSet.has(k) && editor.modelAliases[k]) cleanedAliases[k] = editor.modelAliases[k]
        }
        const record = {
          id: editor.id,
          name,
          color: editor.color,
          models: keptModels,
          modelAliases: cleanedAliases,
        }
        updatePrefs(next => {
          const idx = next.customGroups.findIndex(g => g.id === record.id)
          if (idx >= 0) next.customGroups[idx] = record
          else {
            next.customGroups.push(record)
            if (next.providerOrder.length > 0 && !next.providerOrder.includes(record.id)) {
              next.providerOrder = [record.id].concat(next.providerOrder)
            }
          }
        })
        setExpanded(prev => {
          const next = new Set(prev)
          next.add(record.id)
          return next
        })
        setEditor(null)
      }

      const deleteCustomGroup = groupId => {
        updatePrefs(next => {
          next.customGroups = next.customGroups.filter(g => g.id !== groupId)
          next.providerOrder = next.providerOrder.filter(id => id !== groupId)
        })
      }

      const handleDownloadBackup = () => {
        const json = exportBackupPayload(prefs)
        try {
          const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'dsh-smooth-model-picker-backup.json'
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        } catch (e) { /* ignore */ }
      }

      const handleCopyBackup = () => {
        const json = exportBackupPayload(prefs)
        try {
          if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(json).then(() => {
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1800)
            }).catch(() => {})
          }
        } catch (e) { /* ignore */ }
      }

      const runImport = text => {
        const res = parseBackupPayload(text)
        if (!res.ok) {
          setNotice({ kind: 'err', text: res.reason === 'json' ? copy.importBadJson : copy.importBadShape })
          return
        }
        writePrefs(res.prefs)
        setImportText('')
        setNotice({ kind: 'ok', text: copy.importOk })
      }

      const handleFileImport = event => {
        const file = event.target && event.target.files && event.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => runImport(String(reader.result || ''))
        reader.readAsText(file)
        event.target.value = ''
      }

      /* --- tab contents --- */

      let headTitle = copy.tabCatalog
      let headDesc = copy.catalogDesc
      let headAction = null
      let content = null

      const allCardIds = useMemo(
        () => prefs.customGroups.map(g => g.id).concat(groups.map(g => g.id)),
        [prefs.customGroups, groups],
      )
      const allExpanded = allCardIds.length > 0 && allCardIds.every(id => expanded.has(id))

      if (tab === 'catalog') {
        headTitle = editor ? (editor.isNew ? copy.newGroup : copy.editGroup) : copy.tabCatalog
        headDesc = copy.catalogDesc
        if (!editor) {
          headAction = h('button', {
            type: 'button',
            className: 'smp-btn smp-btn-primary',
            onClick: startCreateGroup,
          }, iconPlus(), h('span', null, copy.newGroup))

          const q = catalogQuery.trim().toLowerCase()
          const hiddenTotalCount = prefs.hiddenProviders.length + prefs.hiddenModels.length

          const customCards = catalogFilter === 'hidden'
            ? []
            : prefs.customGroups.map(grp => {
              const folderAliases = grp.modelAliases || {}
              const resolvedModels = grp.models
                .map(mk => {
                  const entry = modelIndex.get(mk)
                  if (!entry) return null
                  const rawModel = entry.model.name || entry.model.id
                  const globalAlias = prefs.modelAliases[mk] || ''
                  const scopedAlias = folderAliases[mk] || ''
                  const provRaw = rawProviderName(entry.group)
                  const provDisp = prefs.providerAliases[entry.group.id] || provRaw
                  const accent = resolveProviderAccent(entry.group.id, provRaw, prefs.providerColors)
                  return { mk, entry, rawModel, globalAlias, scopedAlias, provDisp, accent }
                })
                .filter(Boolean)

              const groupNameMatches = !q || matchScore(q, grp.name) > 0
              const matchingChildren = q
                ? resolvedModels.filter(m => matchScore(q, `${m.scopedAlias} ${m.globalAlias} ${m.rawModel} ${m.entry.model.id} ${m.provDisp}`) > 0)
                : resolvedModels
              if (q && !groupNameMatches && matchingChildren.length === 0) return null

              const childrenToShow = q && !groupNameMatches ? matchingChildren : resolvedModels
              const isOpen = (q && matchingChildren.length > 0) || expanded.has(grp.id)

              return h('div', {
                key: grp.id,
                className: 'smp-tree-card',
                'data-expanded': isOpen ? 'true' : 'false',
                style: { '--smp-accent': grp.color },
              },
                h('div', {
                  className: 'smp-tree-head',
                  onClick: () => toggleExpand(grp.id),
                },
                  h('span', { className: 'smp-tree-chevron', 'aria-hidden': 'true' }, iconChevron()),
                  h('button', {
                    type: 'button',
                    className: 'smp-color-trigger',
                    title: copy.pickColor,
                    style: { '--smp-accent': grp.color },
                    onClick: e => openColorPicker(e, 'custom', grp.id, grp.color, false),
                  }, h('span', { className: 'smp-color-trigger-dot', 'aria-hidden': 'true' })),
                  h('div', { className: 'smp-mgr-row-info' },
                    h('div', { className: 'smp-mgr-row-top' },
                      h('span', { className: 'smp-mgr-row-name' }, grp.name),
                      h('span', { className: 'smp-badge' }, copy.customTag),
                      h('span', { className: 'smp-badge' }, copy.count(resolvedModels.length)),
                    ),
                  ),
                  h('div', {
                    className: 'smp-group-card-actions',
                    onClick: e => e.stopPropagation(),
                  },
                    h('button', {
                      type: 'button',
                      className: 'smp-btn',
                      onClick: () => startEditGroup(grp),
                    }, iconEdit(), h('span', null, copy.edit)),
                    h('button', {
                      type: 'button',
                      className: 'smp-btn smp-btn-danger',
                      onClick: () => deleteCustomGroup(grp.id),
                    }, iconTrash(), h('span', null, copy.remove)),
                  ),
                ),
                isOpen ? h('div', { className: 'smp-tree-children' },
                  childrenToShow.length === 0
                    ? h('div', { className: 'smp-tree-empty' }, copy.folderEmpty)
                    : childrenToShow.map(item => h('div', {
                      key: item.mk,
                      className: 'smp-tree-child',
                    },
                      h('span', { className: 'smp-vendor-dot', style: { '--smp-accent': item.accent }, 'aria-hidden': 'true' }),
                      h('div', { className: 'smp-mgr-row-info' },
                        h('div', { className: 'smp-mgr-row-top' },
                          h('span', { className: 'smp-mgr-row-name' }, item.scopedAlias || item.globalAlias || item.rawModel),
                          h('span', { className: 'smp-row-prov', style: { '--smp-accent': item.accent } },
                            h('span', { className: 'smp-row-prov-dot', 'aria-hidden': 'true' }),
                            item.provDisp,
                          ),
                        ),
                        h('span', { className: 'smp-mgr-row-sub' }, item.rawModel),
                      ),
                      h('div', { className: 'smp-mgr-alias-wrap' },
                        h('input', {
                          type: 'text',
                          className: 'smp-mgr-input smp-mgr-alias-input',
                          value: item.scopedAlias,
                          placeholder: copy.folderAliasPlaceholder,
                          onChange: e => setGroupModelAlias(grp.id, item.mk, e.target.value),
                        }),
                        item.scopedAlias ? h('button', {
                          type: 'button',
                          className: 'smp-icon-btn',
                          title: copy.restoreAlias,
                          onClick: () => setGroupModelAlias(grp.id, item.mk, ''),
                        }, iconClose()) : null,
                      ),
                      h('button', {
                        type: 'button',
                        className: 'smp-icon-btn',
                        title: copy.removeFromFolder,
                        onClick: () => removeModelFromGroup(grp.id, item.mk),
                      }, iconTrash()),
                    )),
                ) : null,
              )
            }).filter(Boolean)

          const providerCards = catalogFilter === 'custom'
            ? []
            : groups.map(g => {
              const rawName = rawProviderName(g)
              const alias = prefs.providerAliases[g.id] || ''
              const isProvHidden = hiddenProvSet.has(g.id)
              const hasCustomColor = Boolean(prefs.providerColors[g.id])
              const accent = resolveProviderAccent(g.id, rawName, prefs.providerColors)
              const models = Array.isArray(g.models) ? g.models : []

              const childItems = models.map(m => {
                const mk = keyOf(g.id, m.id)
                const rawModel = m.name || m.id
                const mAlias = prefs.modelAliases[mk] || ''
                const isHidden = hiddenModelSet.has(mk)
                return { mk, model: m, rawModel, mAlias, isHidden }
              })

              const hiddenChildren = childItems.filter(c => c.isHidden)
              if (catalogFilter === 'hidden' && !isProvHidden && hiddenChildren.length === 0) return null

              const baseChildren = catalogFilter === 'hidden' && !isProvHidden ? hiddenChildren : childItems
              const provMatches = !q || matchScore(q, `${alias} ${rawName} ${g.id}`) > 0
              const matchingChildren = q
                ? baseChildren.filter(c => matchScore(q, `${c.mAlias} ${c.rawModel} ${c.model.id}`) > 0)
                : baseChildren
              if (q && !provMatches && matchingChildren.length === 0) return null

              const childrenToShow = q && !provMatches ? matchingChildren : baseChildren
              const isOpen = (q && matchingChildren.length > 0)
                || (catalogFilter === 'hidden' && hiddenChildren.length > 0)
                || expanded.has(g.id)

              return h('div', {
                key: g.id,
                className: 'smp-tree-card',
                'data-expanded': isOpen ? 'true' : 'false',
                'data-hidden': isProvHidden ? 'true' : 'false',
                style: { '--smp-accent': accent },
              },
                h('div', {
                  className: 'smp-tree-head',
                  onClick: () => toggleExpand(g.id),
                },
                  h('span', { className: 'smp-tree-chevron', 'aria-hidden': 'true' }, iconChevron()),
                  h('button', {
                    type: 'button',
                    className: 'smp-color-trigger',
                    title: copy.pickColor,
                    style: { '--smp-accent': accent },
                    onClick: e => openColorPicker(e, 'provider', g.id, accent, hasCustomColor),
                  }, h('span', { className: 'smp-color-trigger-dot', 'aria-hidden': 'true' })),
                  h('div', { className: 'smp-mgr-row-info' },
                    h('div', { className: 'smp-mgr-row-top' },
                      h('span', { className: 'smp-mgr-row-name' }, alias || rawName),
                      h('span', { className: 'smp-badge' }, copy.count(models.length)),
                      isProvHidden ? h('span', { className: 'smp-badge' }, copy.hiddenTag) : null,
                    ),
                    h('span', { className: 'smp-mgr-row-sub' }, alias ? `${rawName} · ${g.id}` : g.id),
                  ),
                  h('div', {
                    className: 'smp-mgr-alias-wrap',
                    onClick: e => e.stopPropagation(),
                  },
                    h('input', {
                      type: 'text',
                      className: 'smp-mgr-input smp-mgr-alias-input',
                      value: alias,
                      placeholder: copy.aliasPlaceholder,
                      onChange: e => setProviderAlias(g.id, e.target.value),
                    }),
                    alias ? h('button', {
                      type: 'button',
                      className: 'smp-icon-btn',
                      title: copy.restoreAlias,
                      onClick: () => setProviderAlias(g.id, ''),
                    }, iconClose()) : null,
                  ),
                  h('button', {
                    type: 'button',
                    role: 'switch',
                    className: 'smp-switch',
                    'aria-checked': isProvHidden ? 'false' : 'true',
                    onClick: e => {
                      e.stopPropagation()
                      toggleHideProvider(g.id)
                    },
                  }, h('span', { className: 'smp-switch-knob' })),
                ),
                isOpen ? h('div', { className: 'smp-tree-children' },
                  childrenToShow.length === 0
                    ? h('div', { className: 'smp-tree-empty' }, copy.noMatchingItems)
                    : childrenToShow.map(item => h('div', {
                      key: item.mk,
                      className: 'smp-tree-child',
                      'data-hidden': item.isHidden ? 'true' : 'false',
                    },
                      h('div', { className: 'smp-mgr-row-info' },
                        h('div', { className: 'smp-mgr-row-top' },
                          h('span', { className: 'smp-mgr-row-name' }, item.mAlias || item.rawModel),
                          item.isHidden ? h('span', { className: 'smp-badge' }, copy.hiddenTag) : null,
                        ),
                        item.mAlias ? h('span', { className: 'smp-mgr-row-sub' }, item.rawModel) : null,
                      ),
                      h('div', { className: 'smp-mgr-alias-wrap' },
                        h('input', {
                          type: 'text',
                          className: 'smp-mgr-input smp-mgr-alias-input',
                          value: item.mAlias,
                          placeholder: copy.aliasPlaceholder,
                          onChange: e => setModelAlias(item.mk, e.target.value),
                        }),
                        item.mAlias ? h('button', {
                          type: 'button',
                          className: 'smp-icon-btn',
                          title: copy.restoreAlias,
                          onClick: () => setModelAlias(item.mk, ''),
                        }, iconClose()) : null,
                      ),
                      h('button', {
                        type: 'button',
                        role: 'switch',
                        className: 'smp-switch',
                        'aria-checked': item.isHidden ? 'false' : 'true',
                        onClick: () => toggleHideModel(item.mk),
                      }, h('span', { className: 'smp-switch-knob' })),
                    )),
                ) : null,
              )
            }).filter(Boolean)

          const allCards = customCards.concat(providerCards)
          content = h(React.Fragment, null,
            h('div', { className: 'smp-mgr-filters' },
              h('input', {
                type: 'text',
                className: 'smp-mgr-input',
                style: { flex: 1, minWidth: '150px' },
                value: catalogQuery,
                placeholder: copy.searchPlaceholder,
                onChange: e => setCatalogQuery(e.target.value),
              }),
              h('button', {
                type: 'button',
                className: 'smp-chip',
                'aria-pressed': catalogFilter === 'all' ? 'true' : 'false',
                onClick: () => setCatalogFilter('all'),
              }, copy.filterAll),
              h('button', {
                type: 'button',
                className: 'smp-chip',
                'aria-pressed': catalogFilter === 'custom' ? 'true' : 'false',
                onClick: () => setCatalogFilter('custom'),
              }, `${copy.filterCustom} (${prefs.customGroups.length})`),
              h('button', {
                type: 'button',
                className: 'smp-chip',
                'aria-pressed': catalogFilter === 'hidden' ? 'true' : 'false',
                onClick: () => setCatalogFilter('hidden'),
              }, `${copy.onlyHidden} (${hiddenTotalCount})`),
              h('button', {
                type: 'button',
                className: 'smp-link',
                onClick: () => setExpanded(allExpanded ? new Set() : new Set(allCardIds)),
              }, allExpanded ? copy.collapseAll : copy.expandAll),
            ),
            allCards.length === 0
              ? h('div', { className: 'smp-empty' }, catalogFilter === 'custom' ? copy.emptyGroups : copy.noMatchingItems)
              : h('div', { className: 'smp-mgr-list' }, allCards),
          )
        } else {
          const pickedSet = new Set(editor.models)
          const q = pickQuery.trim().toLowerCase()
          const filteredPick = allModels.filter(item => {
            if (pickProv !== 'all' && item.group.id !== pickProv) return false
            if (!q) return true
            return matchScore(q, `${item.alias} ${item.rawModelName} ${item.model.id} ${item.providerDisplay} ${item.providerName}`) > 0
          })
          const togglePickModel = mk => {
            setEditor(prev => {
              if (!prev) return prev
              const exists = prev.models.includes(mk)
              return Object.assign({}, prev, {
                models: exists ? prev.models.filter(k => k !== mk) : prev.models.concat(mk),
              })
            })
          }
          content = h('div', { className: 'smp-editor' },
            h('div', { className: 'smp-editor-top' },
              h('button', {
                type: 'button',
                className: 'smp-btn',
                onClick: () => setEditor(null),
              }, iconBack(), h('span', null, copy.back)),
              h('div', { className: 'smp-group-card-actions' },
                h('button', {
                  type: 'button',
                  className: 'smp-btn',
                  onClick: () => setEditor(null),
                }, copy.cancel),
                h('button', {
                  type: 'button',
                  className: 'smp-btn smp-btn-primary',
                  disabled: editor.name.trim() === '',
                  onClick: saveEditorGroup,
                }, copy.save),
              ),
            ),
            h('div', { className: 'smp-field' },
              h('span', { className: 'smp-field-label' }, copy.groupName),
              h('input', {
                type: 'text',
                className: 'smp-mgr-input',
                value: editor.name,
                autoFocus: true,
                placeholder: copy.groupNamePlaceholder,
                onChange: e => setEditor(prev => Object.assign({}, prev, { name: e.target.value })),
              }),
            ),
            h('div', { className: 'smp-field' },
              h('span', { className: 'smp-field-label' }, copy.groupColor),
              h('div', { className: 'smp-swatches' }, CUSTOM_GROUP_PALETTE.map(hex => h('button', {
                key: hex,
                type: 'button',
                className: 'smp-swatch',
                'aria-pressed': editor.color === hex ? 'true' : 'false',
                style: { backgroundColor: hex, color: hex },
                onClick: () => setEditor(prev => Object.assign({}, prev, { color: hex })),
              }))),
            ),
            h('div', { className: 'smp-field' },
              h('div', { className: 'smp-editor-top' },
                h('span', { className: 'smp-field-label' }, copy.groupModels),
                h('span', { className: 'smp-field-label' }, copy.groupSelectedCount(editor.models.length)),
              ),
              h('div', { className: 'smp-mgr-filters' },
                h('input', {
                  type: 'text',
                  className: 'smp-mgr-input',
                  style: { flex: 1, minWidth: '140px' },
                  value: pickQuery,
                  placeholder: copy.searchPlaceholder,
                  onChange: e => setPickQuery(e.target.value),
                }),
                h('select', {
                  className: 'smp-mgr-select',
                  value: pickProv,
                  onChange: e => setPickProv(e.target.value),
                },
                  h('option', { value: 'all' }, copy.allProviders),
                  groups.map(g => h('option', { key: g.id, value: g.id }, prefs.providerAliases[g.id] || rawProviderName(g))),
                ),
              ),
              h('div', { className: 'smp-pick-list' },
                filteredPick.length === 0
                  ? h('div', { className: 'smp-empty', style: { minHeight: '80px' } }, copy.noMatchingItems)
                  : filteredPick.map(item => {
                    const checked = pickedSet.has(item.key)
                    return h('div', {
                      key: item.key,
                      className: 'smp-pick-row',
                      'data-checked': checked ? 'true' : 'false',
                      onClick: () => togglePickModel(item.key),
                    },
                      h('span', { className: 'smp-checkbox', 'aria-hidden': 'true' }, checked ? iconCheck() : null),
                      h('span', { className: 'smp-row-name', style: { flex: 1 } }, item.alias || item.rawModelName),
                      h('span', { className: 'smp-row-prov', style: { '--smp-accent': item.accent } },
                        h('span', { className: 'smp-row-prov-dot', 'aria-hidden': 'true' }),
                        item.providerDisplay,
                      ),
                    )
                  }),
              ),
            ),
          )
        }
      } else {
        headTitle = copy.tabBackup
        headDesc = copy.backupDesc
        const folderAliasTotal = prefs.customGroups.reduce((sum, g) => sum + Object.keys(g.modelAliases || {}).length, 0)
        const aliasTotal = Object.keys(prefs.providerAliases).length + Object.keys(prefs.modelAliases).length + folderAliasTotal
        const hiddenTotal = prefs.hiddenProviders.length + prefs.hiddenModels.length
        const effortTotal = Object.keys(prefs.modelEfforts).length
        content = h(React.Fragment, null,
          notice ? h('div', { className: 'smp-notice', 'data-kind': notice.kind, role: 'status' }, notice.text) : null,
          h('div', { className: 'smp-card' },
            h('div', { className: 'smp-card-title' }, copy.langTitle),
            h('div', { className: 'smp-card-hint' }, copy.langHint),
            h('div', { className: 'smp-lang-seg', style: { maxWidth: '280px' } },
              [
                ['auto', copy.langAuto],
                ['zh', copy.langZh],
                ['en', copy.langEn],
              ].map(([val, lbl]) => h('button', {
                key: val,
                type: 'button',
                className: 'smp-lang-btn',
                'aria-pressed': prefs.language === val ? 'true' : 'false',
                onClick: () => updatePrefs(next => { next.language = val }),
              }, lbl)),
            ),
          ),
          h('div', { className: 'smp-card' },
            h('div', { className: 'smp-card-title' }, copy.exportTitle),
            h('div', { className: 'smp-card-hint' }, copy.exportHint),
            h('div', { className: 'smp-card-stats' },
              h('span', { className: 'smp-group-tag' }, copy.statGroups(prefs.customGroups.length)),
              h('span', { className: 'smp-group-tag' }, copy.statFavs(prefs.favorites.length)),
              h('span', { className: 'smp-group-tag' }, copy.statAliases(aliasTotal)),
              h('span', { className: 'smp-group-tag' }, copy.statHidden(hiddenTotal)),
              h('span', { className: 'smp-group-tag' }, copy.statEfforts(effortTotal)),
            ),
            h('div', { className: 'smp-card-actions' },
              h('button', { type: 'button', className: 'smp-btn smp-btn-primary', onClick: handleDownloadBackup }, iconDownload(), h('span', null, copy.downloadJson)),
              h('button', { type: 'button', className: 'smp-btn', onClick: handleCopyBackup }, iconCopy(), h('span', null, copied ? copy.copied : copy.copyJson)),
            ),
          ),
          h('div', { className: 'smp-card' },
            h('div', { className: 'smp-card-title' }, copy.importTitle),
            h('div', { className: 'smp-card-hint' }, copy.importHint),
            h('input', {
              ref: fileInputRef,
              type: 'file',
              accept: '.json,application/json',
              style: { display: 'none' },
              onChange: handleFileImport,
            }),
            h('textarea', {
              className: 'smp-textarea',
              value: importText,
              placeholder: copy.pastePlaceholder,
              onChange: e => setImportText(e.target.value),
            }),
            h('div', { className: 'smp-card-actions' },
              h('button', {
                type: 'button',
                className: 'smp-btn',
                onClick: () => { if (fileInputRef.current) fileInputRef.current.click() },
              }, iconUpload(), h('span', null, copy.chooseFile)),
              h('button', {
                type: 'button',
                className: 'smp-btn smp-btn-primary',
                disabled: importText.trim() === '',
                onClick: () => runImport(importText),
              }, copy.importBtn),
            ),
          ),
          h('div', { className: 'smp-card' },
            h('div', { className: 'smp-card-title' }, copy.resetTitle),
            h('div', { className: 'smp-card-actions' },
              h('button', {
                type: 'button',
                className: 'smp-btn',
                onClick: () => {
                  updatePrefs(next => { next.providerOrder = []; next.modelOrder = {} })
                  setNotice({ kind: 'ok', text: copy.resetDone })
                },
              }, copy.resetOrderOnly),
              h('button', {
                type: 'button',
                className: 'smp-btn',
                disabled: hiddenTotal === 0,
                onClick: () => {
                  updatePrefs(next => { next.hiddenProviders = []; next.hiddenModels = [] })
                  setNotice({ kind: 'ok', text: copy.resetDone })
                },
              }, copy.resetHiddenOnly),
              h('button', {
                type: 'button',
                className: 'smp-btn smp-btn-danger',
                onClick: () => {
                  if (!confirmResetAll) {
                    setConfirmResetAll(true)
                    return
                  }
                  writePrefs({})
                  setConfirmResetAll(false)
                  setNotice({ kind: 'ok', text: copy.resetDone })
                },
              }, confirmResetAll ? copy.resetAllConfirm : copy.resetAll),
            ),
          ),
        )
      }

      const navTab = (id, label, count) => h('button', {
        key: id,
        type: 'button',
        className: 'smp-mgr-tab',
        'data-active': tab === id ? 'true' : 'false',
        onClick: () => {
          setTab(id)
          setEditor(null)
          setNotice(null)
          setConfirmResetAll(false)
        },
      },
        h('span', null, label),
        count !== undefined ? h('span', { className: 'smp-mgr-tab-count' }, copy.count(count)) : null,
      )

      const colorPopoverNode = colorPicker
        ? h('div', {
          ref: colorPopoverRef,
          className: 'smp-color-popover',
          style: { left: colorPicker.left + 'px', top: colorPicker.top + 'px' },
          onClick: e => e.stopPropagation(),
        },
          h('div', { className: 'smp-swatches' }, CUSTOM_GROUP_PALETTE.map(hex => h('button', {
            key: hex,
            type: 'button',
            className: 'smp-swatch',
            'aria-pressed': colorPicker.color.toLowerCase() === hex ? 'true' : 'false',
            style: { backgroundColor: hex, color: hex },
            onClick: () => {
              if (colorPicker.kind === 'custom') setCustomGroupColor(colorPicker.id, hex)
              else setProviderColor(colorPicker.id, hex)
              setColorPicker(null)
            },
          }))),
          h('div', { className: 'smp-color-popover-foot' },
            h('label', { className: 'smp-color-native' },
              h('input', {
                type: 'color',
                value: colorPicker.color,
                onChange: e => {
                  const hex = e.target.value
                  if (colorPicker.kind === 'custom') setCustomGroupColor(colorPicker.id, hex)
                  else setProviderColor(colorPicker.id, hex)
                  setColorPicker(prev => (prev ? Object.assign({}, prev, { color: hex, hasCustom: true }) : null))
                },
              }),
              h('span', null, copy.customColor),
            ),
            colorPicker.kind === 'provider' && colorPicker.hasCustom
              ? h('button', {
                type: 'button',
                className: 'smp-link',
                onClick: () => {
                  setProviderColor(colorPicker.id, '')
                  setColorPicker(null)
                },
              }, copy.resetColor)
              : null,
          ),
        )
        : null

      return createPortal(
        h('div', {
          className: 'smp-mgr-backdrop',
          onMouseDown: e => { if (e.target === e.currentTarget) onClose() },
        },
          h('div', {
            className: 'smp-mgr-dialog',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': copy.manageTitle,
          },
            h('div', { className: 'smp-mgr-nav' },
              h('div', { className: 'smp-mgr-nav-top' },
                h('div', { className: 'smp-mgr-brand' }, iconLayers(), h('span', null, copy.manageTitle)),
                navTab('catalog', copy.tabCatalog, prefs.customGroups.length + groups.length),
                navTab('backup', copy.tabBackup),
              ),
              h('div', { className: 'smp-mgr-nav-foot' },
                h('div', { className: 'smp-lang-seg', role: 'group', 'aria-label': copy.langTitle },
                  [
                    ['auto', copy.langShortAuto],
                    ['zh', copy.langShortZh],
                    ['en', copy.langShortEn],
                  ].map(([val, lbl]) => h('button', {
                    key: val,
                    type: 'button',
                    className: 'smp-lang-btn',
                    'aria-pressed': prefs.language === val ? 'true' : 'false',
                    onClick: () => updatePrefs(next => { next.language = val }),
                  }, lbl)),
                ),
              ),
            ),
            h('div', { className: 'smp-mgr-main' },
              h('div', { className: 'smp-mgr-head' },
                h('div', { className: 'smp-mgr-head-text' },
                  h('div', { className: 'smp-mgr-title' }, headTitle),
                  h('div', { className: 'smp-mgr-desc' }, headDesc),
                ),
                h('div', { className: 'smp-mgr-head-right' },
                  headAction,
                  h('button', {
                    type: 'button',
                    className: 'smp-icon-btn',
                    'aria-label': copy.cancel,
                    onClick: onClose,
                  }, iconClose()),
                ),
              ),
              h('div', { className: 'smp-mgr-body' }, content),
            ),
          ),
          colorPopoverNode,
        ),
        document.body,
      )
    }

    /* --------------------------------------------------------- SmoothPicker */

    function SmoothPicker(props) {
      const resolveDirectory = typeof props.resolveDirectory === 'function' ? props.resolveDirectory : null
      const [directory, setDirectory] = useState(() => {
        try { return resolveDirectory ? resolveDirectory() : null } catch (e) { return null }
      })
      const state = useSnapshot(directory ? directory.store : props.directory)
      const prefs = usePrefs()
      const copy = resolveCopy(prefs.language, props.copy)

      const [open, setOpen] = useState(false)
      const [manageOpen, setManageOpen] = useState(false)
      const [effortOpen, setEffortOpen] = useState(false)
      const [effortClosing, setEffortClosing] = useState(false)
      const [previewEffortId, setPreviewEffortId] = useState(null)
      const [query, setQuery] = useState('')
      const [activeKey, setActiveKey] = useState(null)
      const [cursor, setCursor] = useState(0)
      const [keyboard, setKeyboard] = useState(false)
      const [box, setBox] = useState(null)
      const [effortBox, setEffortBox] = useState(null)
      const [busy, setBusy] = useState(false)
      const [reloading, setReloading] = useState(false)

      const triggerRef = useRef(null)
      const effortTriggerRef = useRef(null)
      const panelRef = useRef(null)
      const effortPopoverRef = useRef(null)
      const searchRef = useRef(null)
      const railRef = useRef(null)
      const listRef = useRef(null)
      const dragActiveRef = useRef(false)
      const effortScrubbingRef = useRef(false)
      const effortCloseTimersRef = useRef({ fade: 0, close: 0 })
      const suppressClickUntilRef = useRef(0)

      /* --- normalize directory snapshot --- */

      const rawGroups = state && Array.isArray(state.groups) ? state.groups : []
      const groups = useMemo(() => {
        const out = []
        const seen = new Set()
        for (const g of rawGroups) {
          if (!g || typeof g.id !== 'string' || seen.has(g.id)) continue
          seen.add(g.id)
          out.push(g)
        }
        return out
      }, [rawGroups])

      const failures = state && Array.isArray(state.failures) ? state.failures : []
      const current = state && state.current ? state.current : null
      const pending = state && state.pending ? state.pending : null
      const status = state ? state.status : 'idle'
      const error = state ? state.error : null

      const providerById = useMemo(() => {
        const map = new Map()
        for (const g of groups) map.set(g.id, g)
        return map
      }, [groups])

      const modelIndex = useMemo(() => {
        const map = new Map()
        for (const g of groups) {
          for (const m of Array.isArray(g.models) ? g.models : []) {
            map.set(keyOf(g.id, m.id), { group: g, model: m })
          }
        }
        return map
      }, [groups])

      const hiddenProviderSet = useMemo(() => new Set(prefs.hiddenProviders), [prefs.hiddenProviders])
      const hiddenModelSet = useMemo(() => new Set(prefs.hiddenModels), [prefs.hiddenModels])
      const customGroupById = useMemo(() => {
        const map = new Map()
        for (const cg of prefs.customGroups) map.set(cg.id, cg)
        return map
      }, [prefs.customGroups])

      const rawProviderName = useCallback(
        group => (group && group.id === 'deepseek-account' ? copy.account : (group && group.name) || ''),
        [copy.account],
      )

      const providerLabel = useCallback(group => {
        if (!group) return ''
        const alias = prefs.providerAliases[group.id]
        return typeof alias === 'string' && alias !== '' ? alias : rawProviderName(group)
      }, [prefs.providerAliases, rawProviderName])

      const modelLabel = useCallback((group, model, scopeGroupId) => {
        if (!group || !model) return ''
        const key = keyOf(group.id, model.id)
        if (scopeGroupId) {
          const cg = customGroupById.get(scopeGroupId)
          const scopedAlias = cg && cg.modelAliases ? cg.modelAliases[key] : ''
          if (typeof scopedAlias === 'string' && scopedAlias !== '') return scopedAlias
        }
        const alias = prefs.modelAliases[key]
        if (typeof alias === 'string' && alias !== '') return alias
        return model.name || model.id
      }, [prefs.modelAliases, customGroupById])

      const visibleRealProviderIds = useMemo(
        () => officialProviderOrder(groups).filter(id => !hiddenProviderSet.has(id)),
        [groups, hiddenProviderSet],
      )

      const providerOrder = useMemo(() => {
        const defaultIds = prefs.customGroups.map(g => g.id).concat(visibleRealProviderIds)
        return orderIds(prefs.providerOrder, defaultIds)
      }, [prefs.providerOrder, prefs.customGroups, visibleRealProviderIds])

      const isModelVisible = useCallback(
        (groupId, modelId) => !hiddenProviderSet.has(groupId) && !hiddenModelSet.has(keyOf(groupId, modelId)),
        [hiddenProviderSet, hiddenModelSet],
      )

      const modelsOf = useCallback(group => {
        if (!group) return []
        const models = (Array.isArray(group.models) ? group.models : []).filter(m => !hiddenModelSet.has(keyOf(group.id, m.id)))
        const order = orderIds(prefs.modelOrder[group.id] || [], models.map(m => m.id))
        const byId = new Map(models.map(m => [m.id, m]))
        return order.map(id => byId.get(id)).filter(Boolean)
      }, [prefs.modelOrder, hiddenModelSet])

      const rowsOfCustomGroup = useCallback(cg => {
        if (!cg) return []
        return cg.models.map(k => modelIndex.get(k)).filter(Boolean)
      }, [modelIndex])

      const favoriteRows = useMemo(
        () => prefs.favorites
          .map(k => modelIndex.get(k))
          .filter(entry => entry && isModelVisible(entry.group.id, entry.model.id)),
        [prefs.favorites, modelIndex, isModelVisible],
      )
      const recentRows = useMemo(
        () => prefs.recent
          .map(k => modelIndex.get(k))
          .filter(entry => entry && isModelVisible(entry.group.id, entry.model.id)),
        [prefs.recent, modelIndex, isModelVisible],
      )

      const knownViews = useMemo(() => new Set(providerOrder), [providerOrder])
      const failureIds = useMemo(() => new Set(failures.map(f => f.id)), [failures])
      const fallbackView = (current && knownViews.has(current.provider) ? current.provider : providerOrder[0]) || 'favorites'
      const view = activeKey === 'favorites' || activeKey === 'recent'
        ? activeKey
        : knownViews.has(activeKey) || failureIds.has(activeKey)
          ? activeKey
          : fallbackView

      const searching = query.trim().length > 0
      const needle = query.trim().toLowerCase()

      const { rows, headTitle } = useMemo(() => {
        if (searching) {
          const scored = []
          const seenKeys = new Set()
          // Search across visible real providers first
          for (const pid of visibleRealProviderIds) {
            const group = providerById.get(pid)
            const pLabel = providerLabel(group)
            const pRaw = rawProviderName(group)
            for (const model of modelsOf(group)) {
              const mk = keyOf(group.id, model.id)
              if (seenKeys.has(mk)) continue
              const mLabel = modelLabel(group, model)
              const aliasScore = matchScore(needle, mLabel)
              const nameScore = matchScore(needle, model.name || model.id)
              const idScore = matchScore(needle, model.id)
              const comboScore = matchScore(needle, `${pLabel} ${pRaw} ${mLabel} ${model.name || ''} ${model.id || ''} ${pid}`)
              const best = Math.max(aliasScore * 1.25, nameScore * 1.15, idScore * 1.05, comboScore * 0.85)
              if (best > 0) {
                seenKeys.add(mk)
                scored.push({ group, model, score: best })
              }
            }
          }
          // Also include models inside custom groups (matching folder-specific aliases too)
          for (const cg of prefs.customGroups) {
            for (const entry of rowsOfCustomGroup(cg)) {
              const mk = keyOf(entry.group.id, entry.model.id)
              const mLabel = modelLabel(entry.group, entry.model, cg.id)
              const pLabel = providerLabel(entry.group)
              const best = Math.max(
                matchScore(needle, mLabel) * 1.25,
                matchScore(needle, `${cg.name} ${mLabel} ${entry.model.name || ''} ${entry.model.id} ${pLabel}`) * 0.9,
              )
              if (best > 0 && !seenKeys.has(mk)) {
                seenKeys.add(mk)
                scored.push({ group: entry.group, model: entry.model, score: best, scopeGroupId: cg.id })
              }
            }
          }
          scored.sort((a, b) => b.score - a.score)
          return { rows: scored, headTitle: copy.results }
        }
        if (view === 'favorites') return { rows: favoriteRows, headTitle: copy.favorites }
        if (view === 'recent') return { rows: recentRows, headTitle: copy.recent }
        const customGrp = customGroupById.get(view)
        if (customGrp) {
          return { rows: rowsOfCustomGroup(customGrp), headTitle: customGrp.name }
        }
        const group = providerById.get(view)
        return {
          rows: modelsOf(group).map(model => ({ group, model })),
          headTitle: group ? providerLabel(group) : '',
        }
      }, [searching, needle, visibleRealProviderIds, providerById, providerLabel, rawProviderName, modelLabel, modelsOf, prefs.customGroups, rowsOfCustomGroup, customGroupById, view, favoriteRows, recentRows, copy.results, copy.favorites, copy.recent])

      const failed = !searching && view && !knownViews.has(view) && view !== 'favorites' && view !== 'recent'
        ? failures.find(f => f.id === view) || null
        : null

      const currentEntry = current ? modelIndex.get(keyOf(current.provider, current.model)) : undefined
      const currentEfforts = currentEntry ? resolveEffortList(currentEntry.model) : []
      const hasEfforts = currentEfforts.length > 1
      const currentEffortId = current && current.reasoningEffort
        ? current.reasoningEffort
        : currentEntry
          ? resolveRememberedEffort(currentEntry.model, prefs.modelEfforts[keyOf(currentEntry.group.id, currentEntry.model.id)])
          : undefined
      const visualEffortId = (previewEffortId && currentEfforts.some(e => e.id === previewEffortId))
        ? previewEffortId
        : currentEffortId
      const currentEffortObj = currentEfforts.find(e => e.id === visualEffortId) || currentEfforts[0]
      const currentEffortIdx = currentEffortObj ? currentEfforts.indexOf(currentEffortObj) : 0
      const currentEffortLabel = resolveEffortLabel(currentEffortObj, props.resolveText)
      const currentEffortTone = effortTone(currentEffortObj && currentEffortObj.id, currentEffortIdx, currentEfforts.length)
      const currentVendorAccent = currentEntry ? resolveProviderAccent(currentEntry.group.id, rawProviderName(currentEntry.group), prefs.providerColors) : null

      const triggerLabel = currentEntry ? modelLabel(currentEntry.group, currentEntry.model) : copy.selectModel
      const triggerTitle = currentEntry
        ? `${providerLabel(currentEntry.group)} · ${modelLabel(currentEntry.group, currentEntry.model)}`
        : copy.selectModel

      /* --- directory lifecycle --- */

      useEffect(() => {
        if (typeof props.load === 'function') {
          try { props.load() } catch (e) { /* ignore */ }
        }
      }, [props.load, directory])

      useEffect(() => {
        if (!resolveDirectory) return undefined
        let attempts = 0
        let timer = 0
        const tick = () => {
          let next = null
          try { next = resolveDirectory() } catch (e) { next = null }
          if (next !== directory) setDirectory(next)
          if (next) return
          attempts += 1
          if (attempts < 240) timer = window.setTimeout(tick, 250)
        }
        tick()
        return () => { if (timer) window.clearTimeout(timer) }
      }, [directory, resolveDirectory, open])

      /* --- geometry & open/close listeners --- */

      const placePanel = useCallback(() => {
        const el = triggerRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const width = Math.max(1, Math.min(580, window.innerWidth - 24))
        const height = Math.max(1, Math.min(436, window.innerHeight - 24))
        const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))
        const above = rect.top > height + 24
        const preferredTop = above ? rect.top - 8 - height : rect.bottom + 8
        const top = Math.max(12, Math.min(preferredTop, window.innerHeight - height - 12))
        setBox({ left, top, width, height })
      }, [])

      const placeEffortPopover = useCallback(() => {
        const el = effortTriggerRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const estWidth = Math.min(380, window.innerWidth - 24)
        const estHeight = 68
        const left = Math.max(12, Math.min(rect.left, window.innerWidth - estWidth - 12))
        const above = rect.top > estHeight + 16
        const top = above ? rect.top - 8 - estHeight : rect.bottom + 8
        setEffortBox({ left, top: Math.max(12, top) })
      }, [])

      useEffect(() => {
        if (!open) return undefined
        placePanel()
        const onPointerDown = event => {
          if (dragActiveRef.current) return
          if (panelRef.current && panelRef.current.contains(event.target)) return
          if (triggerRef.current && triggerRef.current.contains(event.target)) return
          setOpen(false)
        }
        const onKeyDown = event => {
          if (event.key !== 'Escape') return
          if (dragActiveRef.current) return
          event.stopPropagation()
          setOpen(false)
        }
        const onReflow = () => placePanel()
        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('keydown', onKeyDown, true)
        window.addEventListener('resize', onReflow)
        window.addEventListener('scroll', onReflow, true)
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true)
          document.removeEventListener('keydown', onKeyDown, true)
          window.removeEventListener('resize', onReflow)
          window.removeEventListener('scroll', onReflow, true)
        }
      }, [open, placePanel])

      const cancelEffortCloseTimers = useCallback(() => {
        const timers = effortCloseTimersRef.current
        if (timers.fade) { window.clearTimeout(timers.fade); timers.fade = 0 }
        if (timers.close) { window.clearTimeout(timers.close); timers.close = 0 }
      }, [])

      useEffect(() => () => { cancelEffortCloseTimers() }, [cancelEffortCloseTimers])

      const closeEffortImmediately = useCallback(() => {
        cancelEffortCloseTimers()
        setEffortClosing(false)
        setPreviewEffortId(null)
        setEffortOpen(false)
      }, [cancelEffortCloseTimers])

      useEffect(() => {
        if (!open) return undefined
        // Land on current model's provider when opening fresh
        if (current && knownViews.has(current.provider)) {
          setActiveKey(current.provider)
        }
        setQuery('')
        const t = window.setTimeout(() => {
          if (searchRef.current) searchRef.current.focus({ preventScroll: true })
          if (typeof props.load === 'function') {
            try { props.load(true) } catch (e) { /* ignore */ }
          }
        }, 0)
        return () => window.clearTimeout(t)
      }, [open])

      useEffect(() => {
        setCursor(0)
        setKeyboard(false)
      }, [query, view])

      /* --- actions --- */

      const rememberSwitch = useCallback((providerId, modelId, effortId) => {
        const key = keyOf(providerId, modelId)
        updatePrefs(next => {
          next.recent = [key].concat(next.recent.filter(item => item !== key)).slice(0, 12)
          if (effortId !== undefined && effortId !== null && effortId !== '') {
            next.modelEfforts[key] = effortId
          }
        })
      }, [])

      const selectModel = useCallback((row, explicitEffort, closeOnSuccess) => {
        if (!row || typeof props.select !== 'function') return
        const { group, model } = row
        const key = keyOf(group.id, model.id)
        const sameRoute = current !== null && current.provider === group.id && current.model === model.id
        let effortId
        if (explicitEffort !== undefined) {
          effortId = explicitEffort
        } else if (sameRoute && current.reasoningEffort !== undefined) {
          effortId = current.reasoningEffort
        } else {
          effortId = resolveRememberedEffort(model, prefs.modelEfforts[key])
        }
        const selection = { provider: group.id, model: model.id }
        if (effortId !== undefined && effortId !== null) selection.reasoningEffort = effortId

        setBusy(true)
        let res
        try {
          res = props.select(selection)
        } catch (e) {
          setBusy(false)
          return
        }
        Promise.resolve(res).then(outcome => {
          setBusy(false)
          if (!outcome || outcome.ok) {
            rememberSwitch(group.id, model.id, effortId)
            if (closeOnSuccess) {
              setOpen(false)
              setEffortOpen(false)
            }
          }
        }).catch(() => { setBusy(false) })
      }, [props, current, prefs.modelEfforts, rememberSwitch])

      const commitEffortSlide = useCallback((effortId, autoClose) => {
        if (!currentEntry || !effortId) return
        cancelEffortCloseTimers()
        setEffortClosing(false)
        setPreviewEffortId(effortId)
        selectModel(currentEntry, effortId, false)
        if (autoClose) {
          effortCloseTimersRef.current.fade = window.setTimeout(() => {
            setEffortClosing(true)
            effortCloseTimersRef.current.close = window.setTimeout(() => {
              setEffortOpen(false)
              setEffortClosing(false)
              setPreviewEffortId(null)
            }, 130)
          }, 340)
        }
      }, [currentEntry, cancelEffortCloseTimers, selectModel])

      useEffect(() => {
        if (!effortOpen) return undefined
        placeEffortPopover()
        const onPointerDown = event => {
          if (effortScrubbingRef.current) return
          if (effortPopoverRef.current && effortPopoverRef.current.contains(event.target)) return
          if (effortTriggerRef.current && effortTriggerRef.current.contains(event.target)) return
          closeEffortImmediately()
        }
        const onKeyDown = event => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            closeEffortImmediately()
            return
          }
          if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && currentEfforts.length > 1) {
            event.preventDefault()
            event.stopPropagation()
            const curIdx = Math.max(0, currentEfforts.findIndex(e => e.id === visualEffortId))
            const nextIdx = Math.max(0, Math.min(currentEfforts.length - 1, curIdx + (event.key === 'ArrowRight' ? 1 : -1)))
            if (nextIdx !== curIdx) commitEffortSlide(currentEfforts[nextIdx].id, false)
          }
        }
        const onReflow = () => placeEffortPopover()
        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('keydown', onKeyDown, true)
        window.addEventListener('resize', onReflow)
        window.addEventListener('scroll', onReflow, true)
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true)
          document.removeEventListener('keydown', onKeyDown, true)
          window.removeEventListener('resize', onReflow)
          window.removeEventListener('scroll', onReflow, true)
        }
      }, [effortOpen, placeEffortPopover, closeEffortImmediately, currentEfforts, visualEffortId, commitEffortSlide])

      const toggleFavorite = useCallback((providerId, modelId) => {
        const key = keyOf(providerId, modelId)
        updatePrefs(next => {
          next.favorites = next.favorites.includes(key)
            ? next.favorites.filter(item => item !== key)
            : next.favorites.concat(key)
        })
      }, [])

      const reorderProviders = useCallback((from, to) => {
        updatePrefs(next => {
          const visibleReal = officialProviderOrder(groups).filter(id => !next.hiddenProviders.includes(id))
          const defaultIds = next.customGroups.map(g => g.id).concat(visibleReal)
          const base = orderIds(next.providerOrder, defaultIds)
          next.providerOrder = moveItem(base, from, to)
        })
      }, [groups])

      const reorderModelRows = useCallback((from, to) => {
        if (searching) return
        const fromRow = rows[from]
        const toRow = rows[to]
        if (!fromRow || !toRow) return
        if (view === 'favorites') {
          const fromKey = keyOf(fromRow.group.id, fromRow.model.id)
          const toKey = keyOf(toRow.group.id, toRow.model.id)
          updatePrefs(next => {
            const a = next.favorites.indexOf(fromKey)
            const b = next.favorites.indexOf(toKey)
            if (a >= 0 && b >= 0) next.favorites = moveItem(next.favorites, a, b)
          })
          return
        }
        if (view === 'recent') return
        if (customGroupById.has(view)) {
          const fromKey = keyOf(fromRow.group.id, fromRow.model.id)
          const toKey = keyOf(toRow.group.id, toRow.model.id)
          updatePrefs(next => {
            const cg = next.customGroups.find(g => g.id === view)
            if (!cg) return
            const a = cg.models.indexOf(fromKey)
            const b = cg.models.indexOf(toKey)
            if (a >= 0 && b >= 0) cg.models = moveItem(cg.models, a, b)
          })
          return
        }
        const group = providerById.get(view)
        if (!group) return
        const ids = (Array.isArray(group.models) ? group.models : []).map(m => m.id)
        updatePrefs(next => {
          const order = orderIds(next.modelOrder[group.id] || [], ids)
          const a = order.indexOf(fromRow.model.id)
          const b = order.indexOf(toRow.model.id)
          if (a >= 0 && b >= 0) next.modelOrder[group.id] = moveItem(order, a, b)
        })
      }, [searching, rows, view, providerById, customGroupById])

      const resetOrder = useCallback(() => {
        updatePrefs(next => {
          next.providerOrder = []
          next.modelOrder = {}
        })
      }, [])

      const reloadCatalog = useCallback(() => {
        if (typeof props.load !== 'function') return
        setReloading(true)
        Promise.resolve(props.load(true))
          .catch(() => {})
          .finally(() => { setReloading(false) })
      }, [props])

      const hasCustomOrder = prefs.providerOrder.length > 0 || Object.keys(prefs.modelOrder).length > 0
      const canDragProviders = !searching && providerOrder.length > 1
      const canDragRows = !searching && view !== 'recent' && rows.length > 1

      const onProviderPointerDown = useSmoothDragSort({
        enabled: canDragProviders,
        containerRef: railRef,
        onReorder: reorderProviders,
        dragActiveRef,
        suppressClickUntilRef,
      })

      const onRowPointerDown = useSmoothDragSort({
        enabled: canDragRows,
        containerRef: listRef,
        onReorder: reorderModelRows,
        dragActiveRef,
        suppressClickUntilRef,
      })

      const onKeyNav = useCallback(event => {
        if (rows.length === 0) return
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setKeyboard(true)
          setCursor(c => Math.min(rows.length - 1, c + 1))
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          setKeyboard(true)
          setCursor(c => Math.max(0, c - 1))
        } else if (event.key === 'Enter') {
          const row = rows[cursor]
          if (row) {
            event.preventDefault()
            selectModel(row, undefined, true)
          }
        }
      }, [rows, cursor, selectModel])

      /* --- render --- */

      if (props.available === false || props.subagent === true) return null

      const seat = h('div', { className: 'smp-seat' },
        h('button', {
          ref: triggerRef,
          type: 'button',
          className: 'smp-trigger',
          'data-open': open ? 'true' : 'false',
          disabled: props.locked === true,
          title: triggerTitle,
          'aria-haspopup': 'dialog',
          'aria-expanded': open ? 'true' : 'false',
          style: currentVendorAccent ? { '--smp-accent': currentVendorAccent } : undefined,
          onMouseDown: e => e.preventDefault(),
          onClick: () => {
            closeEffortImmediately()
            setOpen(v => !v)
          },
        },
          currentVendorAccent
            ? h('span', { className: 'smp-trigger-dot', 'aria-hidden': 'true' })
            : h('span', { className: 'smp-trigger-icon' }, iconModels()),
          h('span', { className: 'smp-trigger-text' }, triggerLabel),
          busy || status === 'selecting' ? spinner() : h('span', { className: 'smp-chevron' }, iconChevron()),
        ),
        hasEfforts ? h('button', {
          ref: effortTriggerRef,
          type: 'button',
          className: 'smp-effort-pill',
          'data-open': effortOpen ? 'true' : 'false',
          disabled: props.locked === true || busy,
          title: copy.effortTooltip,
          'aria-haspopup': 'dialog',
          'aria-expanded': effortOpen ? 'true' : 'false',
          style: { '--smp-tone': currentEffortTone },
          onMouseDown: e => e.preventDefault(),
          onClick: () => {
            setOpen(false)
            if (effortOpen) {
              closeEffortImmediately()
            } else {
              cancelEffortCloseTimers()
              setEffortClosing(false)
              setPreviewEffortId(null)
              setEffortOpen(true)
            }
          },
        },
          iconSpark(),
          h('span', { className: 'smp-pill-label-wrap' },
            currentEfforts.map(effort => h('span', {
              key: 'sz-' + effort.id,
              className: 'smp-pill-label-sizer',
              'aria-hidden': 'true',
            }, resolveEffortLabel(effort, props.resolveText))),
            h('span', { className: 'smp-pill-label-text' }, currentEffortLabel || copy.effortLabel),
          ),
        ) : null,
      )

      const effortPopoverNode = effortOpen && hasEfforts && currentEntry
        ? createPortal(
          h('div', {
            ref: effortPopoverRef,
            className: 'smp-effort-popover',
            'data-closing': effortClosing ? 'true' : 'false',
            role: 'dialog',
            'aria-label': copy.effortLabel,
            style: effortBox
              ? { left: effortBox.left + 'px', top: effortBox.top + 'px', '--smp-tone': currentEffortTone }
              : { left: '-9999px', top: '-9999px', visibility: 'hidden', '--smp-tone': currentEffortTone },
          },
            h('div', { className: 'smp-effort-popover-head' },
              h('span', { className: 'smp-effort-popover-title' },
                iconSpark(),
                h('span', null, `${copy.effortLabel} · ${currentEntry.model.name || currentEntry.model.id}`),
              ),
              h('span', { className: 'smp-effort-popover-hint' }, copy.effortSlideHint),
            ),
            h(EffortSegmentedTrack, {
              efforts: currentEfforts,
              activeId: visualEffortId,
              resolveText: props.resolveText,
              scrubbingRef: effortScrubbingRef,
              onPreview: id => {
                cancelEffortCloseTimers()
                setEffortClosing(false)
                setPreviewEffortId(id)
              },
              onCommit: (effortId, autoClose) => commitEffortSlide(effortId, autoClose),
            }),
          ),
          document.body,
        )
        : null

      const manageModalNode = manageOpen
        ? h(ManageModal, {
          copy,
          groups,
          modelIndex,
          prefs,
          rawProviderName,
          onClose: () => setManageOpen(false),
        })
        : null

      if (!open) {
        return h(React.Fragment, null, seat, effortPopoverNode, manageModalNode)
      }

      const fixedRailRow = (id, label, count, icon) => h('div', {
        key: 'rail-' + id,
        role: 'tab',
        tabIndex: 0,
        className: 'smp-rail-item',
        'data-fav-tab': id === 'favorites' ? 'true' : undefined,
        'data-active': !searching && view === id ? 'true' : 'false',
        'aria-selected': !searching && view === id ? 'true' : 'false',
        style: id === 'favorites' ? { '--smp-accent': '#f59e0b' } : undefined,
        onClick: () => {
          setActiveKey(id)
          setQuery('')
        },
        onKeyDown: e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setActiveKey(id)
            setQuery('')
          }
        },
      },
        h('span', { className: 'smp-rail-icon' }, icon),
        h('span', { className: 'smp-rail-name' }, label),
        h('span', { className: 'smp-rail-count' }, copy.count(count)),
      )

      const providerNodes = providerOrder.map((pid, idx) => {
        const customGrp = customGroupById.get(pid)
        const group = customGrp ? null : providerById.get(pid)
        if (!customGrp && !group) return null
        const label = customGrp ? customGrp.name : providerLabel(group)
        const count = customGrp ? rowsOfCustomGroup(customGrp).length : modelsOf(group).length
        const isActiveView = !searching && view === pid
        const hasCurrentModel = customGrp
          ? (current !== null && customGrp.models.includes(keyOf(current.provider, current.model)))
          : (current !== null && current.provider === pid)
        const accent = customGrp ? customGrp.color : resolveProviderAccent(pid, rawProviderName(group), prefs.providerColors)
        return h('div', {
          key: 'prov-' + pid,
          role: 'tab',
          tabIndex: 0,
          className: 'smp-rail-item',
          'data-drag-item': canDragProviders ? 'true' : undefined,
          'data-drag-index': canDragProviders ? String(idx) : undefined,
          'data-draggable': canDragProviders ? 'true' : 'false',
          'data-active': isActiveView ? 'true' : 'false',
          'aria-selected': isActiveView ? 'true' : 'false',
          style: { '--smp-accent': accent },
          onPointerDown: e => onProviderPointerDown(e, idx),
          onClick: () => {
            if (Date.now() < suppressClickUntilRef.current) return
            setActiveKey(pid)
            setQuery('')
          },
          onKeyDown: e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setActiveKey(pid)
              setQuery('')
            }
          },
        },
          canDragProviders ? iconGrip() : null,
          h('span', {
            className: 'smp-vendor-dot',
            'data-current-prov': hasCurrentModel ? 'true' : 'false',
            'aria-hidden': 'true',
          }),
          h('span', { className: 'smp-rail-name' }, label),
          h('span', { className: 'smp-rail-count' }, copy.count(count)),
        )
      })

      const renderRow = (row, idx) => {
        const { group, model } = row
        const key = keyOf(group.id, model.id)
        const isCurrent = current !== null && current.provider === group.id && current.model === model.id
        const isPending = pending !== null && pending.provider === group.id && pending.model === model.id
        const isFav = prefs.favorites.includes(key)
        const badgeText = badgeLabel(model, props.resolveText)
        const showProvBadge = searching || view === 'favorites' || view === 'recent' || customGroupById.has(view)
        const rowScope = row.scopeGroupId || (customGroupById.has(view) ? view : null)
        const displayName = modelLabel(group, model, rowScope)
        const accent = resolveProviderAccent(group.id, rawProviderName(group), prefs.providerColors)

        return h('div', {
          key: key + '@' + view,
          role: 'option',
          className: 'smp-row',
          'data-drag-item': canDragRows ? 'true' : undefined,
          'data-drag-index': canDragRows ? String(idx) : undefined,
          'data-draggable': canDragRows ? 'true' : 'false',
          'data-current': isCurrent ? 'true' : 'false',
          'data-cursor': keyboard && idx === cursor ? 'true' : 'false',
          'aria-selected': isCurrent ? 'true' : 'false',
          style: { '--smp-accent': accent },
          onPointerDown: e => onRowPointerDown(e, idx),
          onMouseEnter: () => { if (keyboard) setCursor(idx) },
          onClick: () => {
            if (Date.now() < suppressClickUntilRef.current) return
            if (!isCurrent) selectModel(row, undefined, true)
          },
        },
          canDragRows ? iconGrip() : null,
          h('div', { className: 'smp-row-main' },
            h('span', { className: 'smp-row-name' }, searching ? highlightText(displayName, needle) : displayName),
            badgeText ? h('span', { className: 'smp-badge' }, badgeText) : null,
            showProvBadge ? h('span', { className: 'smp-row-prov' },
              h('span', { className: 'smp-row-prov-dot', 'aria-hidden': 'true' }),
              providerLabel(group),
            ) : null,
            isCurrent && !isPending ? h('span', { className: 'smp-row-check' }, iconCheck()) : null,
            isPending ? spinner() : null,
          ),
          h('button', {
            type: 'button',
            className: 'smp-star',
            'data-no-drag': 'true',
            'aria-pressed': isFav ? 'true' : 'false',
            'aria-label': isFav ? copy.unstar : copy.star,
            title: isFav ? copy.unstar : copy.star,
            onClick: e => {
              e.stopPropagation()
              toggleFavorite(group.id, model.id)
            },
          }, starIcon(isFav)),
        )
      }

      const lookupError = typeof props.lookupError === 'function' ? props.lookupError() : null
      let body
      if (failed) {
        body = h('div', { className: 'smp-fail' },
          iconWarn(),
          h('div', { className: 'smp-fail-body' },
            h('span', null, `${failed.name || failed.id}: ${failed.message || copy.failed}`),
            h('button', { type: 'button', className: 'smp-link', onClick: reloadCatalog }, copy.retry),
          ),
        )
      } else if (rows.length > 0) {
        body = rows.map(renderRow)
      } else if (searching) {
        body = h('div', { className: 'smp-empty' }, copy.emptySearch)
      } else if (view === 'favorites') {
        body = h('div', { className: 'smp-empty' }, copy.emptyFavorites)
      } else if (view === 'recent') {
        body = h('div', { className: 'smp-empty' }, copy.emptyRecent)
      } else {
        body = h('div', { className: 'smp-empty' },
          h('span', null, status === 'loading' || status === 'idle' ? copy.loading : copy.emptyCatalog),
          lookupError ? h('span', { className: 'smp-empty-detail' }, lookupError) : null,
          h('button', { type: 'button', className: 'smp-link', onClick: reloadCatalog }, copy.retry),
        )
      }

      const activeCustomGroup = !searching && view ? customGroupById.get(view) : null
      const activeProviderGroup = !searching && !activeCustomGroup && view && view !== 'favorites' && view !== 'recent'
        ? providerById.get(view)
        : null
      const activeHeadAccent = activeCustomGroup
        ? activeCustomGroup.color
        : activeProviderGroup
          ? resolveProviderAccent(activeProviderGroup.id, rawProviderName(activeProviderGroup), prefs.providerColors)
          : view === 'favorites' && !searching
            ? '#f59e0b'
            : null

      const panelNode = createPortal(
        h('div', {
          ref: panelRef,
          className: 'smp-panel',
          role: 'dialog',
          'aria-label': copy.title,
          'aria-busy': busy ? 'true' : 'false',
          style: box
            ? { left: box.left + 'px', top: box.top + 'px', width: box.width + 'px', height: box.height + 'px' }
            : { left: '-9999px', top: '-9999px', width: '580px', height: '436px', visibility: 'hidden' },
        },
          h('div', { className: 'smp-body' },
            h('div', { className: 'smp-rail-col' },
              h('div', { ref: railRef, className: 'smp-rail', role: 'tablist', 'aria-orientation': 'vertical' },
                fixedRailRow('favorites', copy.favorites, favoriteRows.length, starIcon(false)),
                fixedRailRow('recent', copy.recent, recentRows.length, iconClock()),
                h('div', { className: 'smp-rail-sep', key: 'sep' }),
                h('div', { className: 'smp-rail-providers' }, providerNodes),
              ),
              h('div', { className: 'smp-rail-footer' },
                h('button', {
                  type: 'button',
                  className: 'smp-manage-btn',
                  onClick: () => {
                    setOpen(false)
                    setManageOpen(true)
                  },
                },
                  h('span', { className: 'smp-manage-btn-left' }, iconGear(), h('span', null, copy.manage)),
                  h('span', { className: 'smp-manage-btn-arrow', 'aria-hidden': 'true' }, iconChevron()),
                ),
              ),
            ),
            h('div', { className: 'smp-list-wrap' },
              h('div', { className: 'smp-list-toolbar' },
                h('div', { className: 'smp-list-head-left' },
                  activeHeadAccent
                    ? h('span', { className: 'smp-vendor-dot', style: { '--smp-accent': activeHeadAccent }, 'aria-hidden': 'true' })
                    : null,
                  h('span', { className: 'smp-list-title' }, headTitle),
                  h('span', { className: 'smp-list-count' }, copy.count(rows.length)),
                ),
                h('div', { className: 'smp-list-head-right' },
                  h('div', {
                    className: 'smp-search-pill',
                    'data-active': searching ? 'true' : 'false',
                  },
                    iconSearch(),
                    h('input', {
                      ref: searchRef,
                      type: 'text',
                      value: query,
                      spellCheck: false,
                      placeholder: copy.searchPlaceholder,
                      'aria-label': copy.searchAria,
                      onChange: e => setQuery(e.target.value),
                      onKeyDown: onKeyNav,
                    }),
                    query ? h('button', {
                      type: 'button',
                      className: 'smp-search-clear',
                      'aria-label': copy.clear,
                      title: copy.clear,
                      onClick: () => {
                        setQuery('')
                        if (searchRef.current) searchRef.current.focus({ preventScroll: true })
                      },
                    }, iconClose()) : null,
                  ),
                  h('button', {
                    type: 'button',
                    className: 'smp-icon-btn',
                    'data-spinning': reloading ? 'true' : 'false',
                    'aria-label': copy.reload,
                    title: copy.reload,
                    onClick: reloadCatalog,
                  }, iconReload()),
                ),
              ),
              h('div', {
                ref: listRef,
                className: 'smp-list',
                role: 'listbox',
                tabIndex: 0,
                'aria-label': headTitle,
                onKeyDown: onKeyNav,
                onMouseMove: () => { if (keyboard) setKeyboard(false) },
              }, body),
              h('div', { className: 'smp-foot' },
                h('span', { className: 'smp-foot-hint' }, copy.dragHint),
                h('button', {
                  type: 'button',
                  className: 'smp-link',
                  disabled: !hasCustomOrder,
                  onClick: resetOrder,
                }, copy.resetOrder),
              ),
            ),
          ),
          error ? h('div', { className: 'smp-error', role: 'alert' }, error) : null,
        ),
        document.body,
      )

      return h(React.Fragment, null, seat, panelNode, effortPopoverNode, manageModalNode)
    }

    /* -------------------------------------------------------- error boundary */

    class SeatBoundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { failed: false, epoch: 0 }
      }

      static getDerivedStateFromError() {
        return { failed: true }
      }

      render() {
        if (this.state.failed) {
          const copy = this.props.copy || COPY.zh
          return h('div', { className: 'smp-seat' },
            h('button', {
              type: 'button',
              className: 'smp-trigger',
              'data-fallback': 'true',
              title: copy.broken,
              onClick: () => this.setState(s => ({ failed: false, epoch: s.epoch + 1 })),
            },
              h('span', { className: 'smp-trigger-icon' }, iconModels()),
              h('span', { className: 'smp-trigger-text' }, copy.selectModel),
            ),
          )
        }
        return h(React.Fragment, { key: `${this.props.sessionId}:${this.state.epoch}` }, h(SmoothPicker, this.props))
      }
    }

    /* ----------------------------------------------------------------- apply */

    return {
      inject: ['slots', 'sessions', 'modelDirectories', 'locale'],
      __testExports: {
        orderIds,
        moveItem,
        officialProviderOrder,
        matchScore,
        resolveRememberedEffort,
        computeTargetIndex,
        computeLandingContentTop,
        vendorAccent,
        resolveProviderAccent,
        effortTone,
        computeEffortScrubIndex,
        clampSliderLeft,
        exportBackupPayload,
        parseBackupPayload,
        resolveCopy,
        sanitizePrefs,
        readPrefs,
        writePrefs,
      },
      apply(ctx) {
        ctx.effect(() => installStyles(), 'smooth-model-picker: styles')
        ctx.inject(
          ['slots', 'sessions', 'modelDirectories', 'locale'],
          scope => {
            const models = scope.modelDirectories
            const sessions = scope.sessions
            const locale = scope.locale

            const isSubagent = sessionId => {
              try {
                if (!sessions || typeof sessions.subagentAddress !== 'function') return false
                return sessions.subagentAddress(sessionId) !== undefined
              } catch (e) { return false }
            }

            scope.slots.inject('conversation.input.model', () => scope.slots.register({
              name: 'conversation.input.model',
              priority: -1,
              inject: sessionId => {
                const copy = pickCopy(locale)
                let lookupError = null
                const directoryFor = () => {
                  try {
                    const directory = models.directoryFor(sessionId)
                    lookupError = null
                    return directory && directory.store ? directory : null
                  } catch (e) {
                    lookupError = e && e.message ? e.message : String(e)
                    return null
                  }
                }
                return {
                  sessionId,
                  copy,
                  subagent: isSubagent(sessionId),
                  resolveDirectory: () => directoryFor(),
                  lookupError: () => lookupError,
                  load: force => {
                    const directory = directoryFor()
                    if (!directory) return undefined
                    const run = typeof directory.load === 'function'
                      ? () => directory.load(force === true)
                      : directory.store && typeof directory.store.load === 'function'
                        ? () => directory.store.load(force === true)
                        : null
                    if (!run) return undefined
                    try {
                      const res = run()
                      if (res && typeof res.catch === 'function') res.catch(() => {})
                      return res
                    } catch (e) { return undefined }
                  },
                  resolveText: text => {
                    if (typeof text === 'string') return text
                    try {
                      if (locale && typeof locale.resolveText === 'function') return locale.resolveText(text)
                    } catch (e) { /* ignore */ }
                    return (text && typeof text === 'object' && (text.zh || text.en)) || ''
                  },
                  select: selection => {
                    const directory = directoryFor()
                    if (!directory || typeof directory.select !== 'function') return Promise.resolve(undefined)
                    try { return directory.select(selection) } catch (e) { return Promise.resolve(undefined) }
                  },
                }
              },
            }, SeatBoundary))
          },
        )
      },
    }
  },
})
