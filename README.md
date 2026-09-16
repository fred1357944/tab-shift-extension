# Tab Shift

用類似 iTerm 的鍵盤快捷鍵，在 Chrome 中重新排列分頁，或在視窗之間移動分頁。

**Privacy policy:** https://fred1357944.github.io/tab-shift-extension/privacy.html

**版本：** 1.0.1 · Manifest V3 · Chrome on macOS, Windows, and Linux

## 功能

1. **左右移動**：將目前分頁在同一視窗內向左／向右移動一格。
2. **移到開頭／結尾**：將目前分頁移到其所屬分頁帶的最左或最右。
3. **抽成新視窗**：把目前分頁抽到一個新的、已聚焦的瀏覽器視窗。
4. **移到下一個視窗**：依視窗 id 順序循環，把目前分頁移到下一個一般視窗；若只有一個視窗，則改為抽成新視窗。

**釘選分頁感知：** 釘選與未釘選分頁視為兩條獨立的分頁帶——不會把未釘選分頁移入釘選區，也不會把釘選分頁移出釘選區。左右／開頭／結尾移動皆在同一帶內進行，且不循環（到邊界即停止）。

## 預設快捷鍵

| 指令 | Mac | Windows / Linux |
| --- | --- | --- |
| 向左移動分頁 | ⇧⌘← | Ctrl+Shift+Left |
| 向右移動分頁 | ⇧⌘→ | Ctrl+Shift+Right |
| 移到分頁帶開頭 | ⇧⌘↑ | Ctrl+Shift+Up |
| 移到分頁帶結尾 | ⇧⌘↓ | Ctrl+Shift+Down |
| 抽成新視窗 | （未預設；請到 shortcuts 頁自行綁定） | 同上 |
| 移到下一個視窗 | （未預設；請到 shortcuts 頁自行綁定） | 同上 |

> **Chrome 限制：** 擴充功能最多只能在清單中預設綁定 **4** 組快捷鍵。因此左右／最前／最後有預設鍵；「抽成新視窗」「移到下一個視窗」請到 `chrome://extensions/shortcuts` 自行設定（建議：⌥⇧N、⌥⇧→）。
>
> **刻意未綁定：** Ctrl+⌘←/→（以及任何 Ctrl+Command+方向鍵）不會被此擴充功能使用。也未使用 ⌘⇧N（避免與「開新視窗／無痕」等系統或瀏覽器快捷鍵衝突）。

## 安裝（載入未封裝擴充功能）

1. 開啟 Chrome，前往 `chrome://extensions`
2. 右上角開啟 **開發人員模式（Developer mode）**
3. 點 **載入未封裝項目（Load unpacked）**
4. 選擇本資料夾：`tab-shift-extension`（內含 `manifest.json` 的那一層）

安裝後即可立即使用上述快捷鍵。

## 重新綁定快捷鍵

前往 `chrome://extensions/shortcuts`，找到 **Tab Shift**，即可自訂各指令的按鍵組合。

## 注意事項與已知限制

- 當焦點在網頁的輸入欄（文字框、內容可編輯區等）時，⇧⌘←／→ 可能會被瀏覽器或系統用於**文字選取**，導致擴充功能快捷鍵無法觸發。可先點一下分頁列或地址列，或到 `chrome://extensions/shortcuts` 改綁其他鍵。
- 左右移動**不循環**：已在該分頁帶最左／最右時再按不會跳到另一端。
- 移到「下一個視窗」時，分頁會附加到目標視窗的結尾（`-1`）；釘選狀態由 Chrome 保留。
- 僅操作 `normal` 類型視窗（一般瀏覽器視窗），不含開發者工具、彈出式小視窗等。
- 不請求 `tabs` / `host_permissions`，無 content scripts。只使用 Chrome 的 commands 與分頁／視窗移動 API（讀 id、index、pinned、windowId，不讀網址）。

---

## English (brief)

**Tab Shift** adds iTerm-style shortcuts to rearrange the active tab within its window (left/right, start/end of the pinned or unpinned strip) and to extract it to a new window or cycle it to the next normal window.

Load unpacked from `chrome://extensions` → Developer mode → Load unpacked. Rebind at `chrome://extensions/shortcuts`.

Works on Chrome for macOS, Windows, and Linux (same `chrome.tabs` / `chrome.windows` APIs; Windows/Linux defaults are Ctrl+Shift+arrows).

**Caveats:** Chrome allows at most 4 default shortcuts in the manifest — extract / next-window must be bound at chrome://extensions/shortcuts. ⇧⌘←/→ and Ctrl+Shift+Left/Right may conflict with text selection when focus is in an input field. Ctrl+⌘ arrow keys are intentionally unused. Cmd+Shift+N is not used.
