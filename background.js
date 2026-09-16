/**
 * Tab Shift — service worker (Manifest V3)
 * Uses only chrome.tabs / chrome.windows / chrome.commands.
 * Same code path on Chrome for macOS, Windows, and Linux.
 */

async function resolveTab(eventTab) {
  if (eventTab?.id != null && eventTab.index != null && eventTab.windowId != null) {
    return eventTab;
  }
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab ?? null;
}

function stripBounds(tabs, tab) {
  const pinned = Boolean(tab.pinned);
  const indices = tabs
    .filter((t) => Boolean(t.pinned) === pinned)
    .map((t) => t.index);
  if (indices.length === 0) {
    return { min: tab.index, max: tab.index };
  }
  return { min: Math.min(...indices), max: Math.max(...indices) };
}

async function tabsInWindow(windowId) {
  const tabs = await chrome.tabs.query({ windowId });
  tabs.sort((a, b) => a.index - b.index);
  return tabs;
}

async function moveWithinStrip(tab, delta) {
  if (tab.index == null || tab.windowId == null) return;
  const tabs = await tabsInWindow(tab.windowId);
  const { min, max } = stripBounds(tabs, tab);
  const target = Math.max(min, Math.min(max, tab.index + delta));
  if (target === tab.index) return;
  await chrome.tabs.move(tab.id, { index: target });
}

async function moveToStripEdge(tab, toStart) {
  if (tab.index == null || tab.windowId == null) return;
  const tabs = await tabsInWindow(tab.windowId);
  const { min, max } = stripBounds(tabs, tab);
  const target = toStart ? min : max;
  if (target === tab.index) return;
  await chrome.tabs.move(tab.id, { index: target });
}

async function extractToNewWindow(tab) {
  await chrome.windows.create({ tabId: tab.id, focused: true });
}

async function moveToNextWindow(tab) {
  if (tab.windowId == null) return;

  const windows = await chrome.windows.getAll({ windowTypes: ["normal"] });
  if (!windows.length) return;
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

  await chrome.tabs.move(tab.id, { windowId: next.id, index: -1 });
  await chrome.windows.update(next.id, { focused: true });
  await chrome.tabs.update(tab.id, { active: true });
}

async function handleCommand(command, eventTab) {
  const tab = await resolveTab(eventTab);
  if (tab?.id == null) return;

  switch (command) {
    case "move-tab-left":
      await moveWithinStrip(tab, -1);
      break;
    case "move-tab-right":
      await moveWithinStrip(tab, 1);
      break;
    case "move-tab-to-start":
      await moveToStripEdge(tab, true);
      break;
    case "move-tab-to-end":
      await moveToStripEdge(tab, false);
      break;
    case "extract-tab-new-window":
      await extractToNewWindow(tab);
      break;
    case "move-tab-next-window":
      await moveToNextWindow(tab);
      break;
    default:
      break;
  }
}

chrome.commands.onCommand.addListener((command, tab) =>
  handleCommand(command, tab).catch((err) => {
    console.error("Tab Shift command failed:", command, err);
  }),
);
