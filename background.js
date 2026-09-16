/**
 * Tab Shift — service worker (Manifest V3)
 * iTerm-like shortcuts to rearrange tabs / move between windows.
 * Pinned and unpinned tabs are separate strips.
 */

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab || null;
}

/** Bounds of the pinned or unpinned strip that `tab` belongs to in `tabs` (sorted by index). */
function stripBounds(tabs, tab) {
  const pinned = !!tab.pinned;
  const group = tabs.filter((t) => !!t.pinned === pinned);
  if (group.length === 0) {
    return { min: tab.index, max: tab.index };
  }
  const indices = group.map((t) => t.index);
  return { min: Math.min(...indices), max: Math.max(...indices) };
}

async function moveWithinStrip(delta) {
  const tab = await getActiveTab();
  if (!tab || tab.index == null || tab.windowId == null) return;

  const tabs = await chrome.tabs.query({ windowId: tab.windowId });
  tabs.sort((a, b) => a.index - b.index);
  const { min, max } = stripBounds(tabs, tab);
  const target = Math.max(min, Math.min(max, tab.index + delta));
  if (target === tab.index) return;
  await chrome.tabs.move(tab.id, { index: target });
}

async function moveToStripEdge(toStart) {
  const tab = await getActiveTab();
  if (!tab || tab.index == null || tab.windowId == null) return;

  const tabs = await chrome.tabs.query({ windowId: tab.windowId });
  tabs.sort((a, b) => a.index - b.index);
  const { min, max } = stripBounds(tabs, tab);
  const target = toStart ? min : max;
  if (target === tab.index) return;
  await chrome.tabs.move(tab.id, { index: target });
}

async function extractToNewWindow() {
  const tab = await getActiveTab();
  if (!tab) return;
  await chrome.windows.create({ tabId: tab.id, focused: true });
}

async function moveToNextWindow() {
  const tab = await getActiveTab();
  if (!tab || tab.windowId == null) return;

  const windows = await chrome.windows.getAll({ windowTypes: ["normal"] });
  if (!windows.length) return;

  // Stable order by id
  windows.sort((a, b) => a.id - b.id);

  if (windows.length === 1) {
    await chrome.windows.create({ tabId: tab.id, focused: true });
    return;
  }

  const curIdx = windows.findIndex((w) => w.id === tab.windowId);
  const next = windows[(curIdx < 0 ? 0 : curIdx + 1) % windows.length];
  if (next.id === tab.windowId) {
    await chrome.windows.create({ tabId: tab.id, focused: true });
    return;
  }

  // Append to end of target window (-1). Pinned state is preserved by Chrome.
  await chrome.tabs.move(tab.id, { windowId: next.id, index: -1 });
  await chrome.windows.update(next.id, { focused: true });
  await chrome.tabs.update(tab.id, { active: true });
}

chrome.commands.onCommand.addListener((command) => {
  const run = async () => {
    switch (command) {
      case "move-tab-left":
        await moveWithinStrip(-1);
        break;
      case "move-tab-right":
        await moveWithinStrip(1);
        break;
      case "move-tab-to-start":
        await moveToStripEdge(true);
        break;
      case "move-tab-to-end":
        await moveToStripEdge(false);
        break;
      case "extract-tab-new-window":
        await extractToNewWindow();
        break;
      case "move-tab-next-window":
        await moveToNextWindow();
        break;
      default:
        break;
    }
  };
  run().catch((err) => console.error("Tab Shift command failed:", command, err));
});
