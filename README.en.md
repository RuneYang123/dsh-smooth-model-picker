<p align="center">
  <img src="assets/logo.svg" width="88" alt="dsh-smooth-model-picker logo">
</p>

# dsh-smooth-model-picker

[中文](README.md) | English

A smooth two-pane model and reasoning-effort picker plugin for **DeepSeek Harness (`DSH`)**. Replaces the `conversation.input.model` composer slot with Pointer Events + FLIP drag-to-reorder animations, a full-track sliding reasoning-effort scrubber, tree-based folder & alias management, customizable vendor color dots, and instant bilingual (`中文` / `English`) switching.

---

## Highlights

- **macOS Frosted Glass & Dual-Theme Adaptation**
  - Translucent frosted glass panel with subtle top inner highlights, a recessed left provider rail, a crisp right model list, warm amber favorite stars, and 6px vendor accent dots that adapt automatically to DSH light and dark themes.
- **Two-Pane Layout with Instant Search**
  - Left rail organizes **Favorites / Recent / Custom Folders / Providers**; right toolbar embeds a low-profile search pill that filters across all providers immediately on typing (matching custom aliases, folder-scoped aliases, and original model IDs).
- **Pointer Events + FLIP Smooth Drag-to-Reorder**
  - Replaces native HTML5 `draggable` with a custom Pointer Events engine: hold and move past `5px` to lift a frosted floating card while siblings displace elastically via GPU `translate3d`, settling seamlessly on release with edge auto-scroll and `Esc` to cancel.
  - Reorder providers and custom folders in the left rail, models within each provider or custom folder, and your Favorites list.
- **External Sliding Reasoning-Effort Capsule + Per-Model Memory**
  - Whenever the active model exposes `reasoning.efforts`, an adjacent width-locked capsule appears next to the model trigger in the composer;
  - Opens an equal-width segmented scrubber supporting **press-and-drag horizontal scrubbing, click, mouse wheel, and arrow keys**, automatically remembering your last selected effort per model.
- **Tree-Based Settings & Management Modal (`⚙ Settings & Manage`)**
  - **Custom Folders (Virtual Providers)**: Group models across different providers into custom folders, and assign **folder-specific model aliases** without overwriting the model's alias in its original provider or other folders;
  - **Inline Provider & Model Controls**: Expand or collapse any provider or folder to rename aliases inline or toggle visibility (affects picker display only; never mutates underlying DSH configuration);
  - **Customizable Vendor Accent Colors**: Click any provider or folder color dot to pick from 10 curated swatches or use the native full-spectrum color picker, with one-click reset to default brand colors;
  - **Instant Bilingual UI (`Auto / 中文 / English`)**: Switch display language live from either the manage modal header or the Settings & Backup tab;
  - **JSON Backup & Granular Reset**: Download or copy JSON backups, import from file or pasted JSON with schema validation, and reset ordering only, unhide all items, or full reset with two-step confirmation.

---

## Installation

### Option 1: Install from the DSH Plugin Market (Recommended)

Open **Plugins → Plugin Market** (or **Discover**) inside DSH, search for **`dsh-smooth-model-picker`**, and click **Install**.

### Option 2: Install from GitHub Release Prebuilt Tarball (Fastest, Zero Build)

```sh
# Replace <profile> with your active DSH profile (e.g. web or desktop)
dsh plugin --profile <profile> add https://github.com/RuneYang123/dsh-smooth-model-picker/releases/latest/download/dsh-smooth-model-picker-0.1.0.tgz
```

### Option 3: Install Directly from GitHub Repository

```sh
dsh plugin --profile <profile> add github:RuneYang123/dsh-smooth-model-picker
```

---

## Keyboard & Pointer Shortcuts

| Context | Action | Behavior |
|---|---|---|
| Search input / Model list | `↑` / `↓` | Move highlight across model rows |
| Search input / Model list | `←` / `→` | Switch focus between left rail and right model list |
| Search input / Model list | `Enter` | Select highlighted model and close popover |
| Any reorderable row | Press & drag (`>5px`) | Start FLIP drag-to-reorder (`Esc` cancels active drag) |
| Reasoning-effort capsule | Click / Wheel / Arrows / Scrub | Adjust active model reasoning effort and save per model |

---

## Notes & Troubleshooting

1. **Slot Exclusivity (`conversation.input.model`)**: This plugin registers the `conversation.input.model` slot (`priority: -1`). If you have another model-picker plugin installed (such as `dsh-model-quick-switch`), disable or uninstall it first so the slots do not conflict. (Existing favorites, recents, and ordering from `dsh-model-quick-switch` are migrated automatically on first load.)
2. **Missing a provider or model?**: Open **`⚙ Settings & Manage` → `Providers & Models`** and toggle **`Hidden Only`** in the filter bar to check whether that provider or model was hidden.
3. **Zero Dependencies & Local Privacy**: Pure client-side UI module with zero runtime dependencies and no network calls. All preferences are stored locally in browser `localStorage` under `dsh.smooth-model-picker.v1`.

---

## Development & Verification

```sh
# Syntax check
npm run check

# Run sandbox smoke & unit tests
npm test
```

## License

[MIT](LICENSE)
