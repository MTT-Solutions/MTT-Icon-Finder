import Fuse from "fuse.js";

let icons: any[];
let fuse: Fuse<any>;
let searchTimeout: number;
let currentSuggestionIndex = -1;

Office.onReady(async (info: { host: any }) => {
  if (info.host === Office.HostType.PowerPoint) {
    await loadIcons();
    await initializeFuse();
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    const searchBox = document.getElementById("searchBox");
    searchBox.oninput = handleSearchInput;
    searchBox.onkeypress = handleSearchKeyPress;
    searchBox.onkeydown = handleSearchKeyDown;
    searchBox.onblur = handleSearchBlur;
    searchBox.onfocus = handleSearchInput;
    searchBox.focus();
    document.getElementById("search-icon").onclick = searchIcons;
    searchIcons();
  }
});

async function insertIcon(icon) {
  const [iconType, iconData] = (icon.base64 ?? await fetchAsBase64(icon.url)).split(",");
  const coercionType = iconType.includes("svg") ? Office.CoercionType.Image : Office.CoercionType.Image;

  Office.context.document.setSelectedDataAsync(iconData, { coercionType }, (asyncResult) => {
    if (asyncResult.status === Office.AsyncResultStatus.Failed) {
      setMessage("Error: " + asyncResult.error.message);
    }
  });
}

async function fetchAsBase64(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function loadIcons() {
  const response = await fetch("assets/icons.json");
  icons = (await response.json()).icons;
}

async function initializeFuse() {
  fuse = new Fuse(icons, {
    keys: ["name", "tags"],
    threshold: 0.3,
  });
}

function handleSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(showSuggestions, 300);
}

function handleSearchKeyPress(event) {
  if (event.key === "Enter") {
    if (currentSuggestionIndex >= 0) {
      const suggestions = document.getElementsByClassName("suggestion-item");
      if (suggestions[currentSuggestionIndex]) {
        suggestions[currentSuggestionIndex].click();
      }
    } else {
      searchIcons();
    }
  }
}

function handleSearchKeyDown(event) {
  const suggestions = document.getElementsByClassName("suggestion-item");
  if (event.key === "ArrowDown" || event.key === "Tab") {
    currentSuggestionIndex = (currentSuggestionIndex + 1) % suggestions.length;
    updateSuggestionHighlight(suggestions);
  } else if (event.key === "ArrowUp") {
    currentSuggestionIndex = (currentSuggestionIndex - 1 + suggestions.length) % suggestions.length;
    updateSuggestionHighlight(suggestions);
  } else if (event.key === "Escape") {
    closeSuggestions();
  } else if (event.key === "Enter") {
    suggestions[currentSuggestionIndex]?.click();
  }
}

function updateSuggestionHighlight(suggestions) {
  for (let i = 0; i < suggestions.length; i++) {
    suggestions[i].classList.toggle("highlight", i === currentSuggestionIndex);
    if (i === currentSuggestionIndex) {
      suggestions[i].scrollIntoView({ block: "nearest" });
    }
  }
}

function handleSearchBlur() {
  setTimeout(() => {
    const suggestionsDiv = document.getElementById("suggestions");
    const activeElement = document.activeElement;
    if (!suggestionsDiv.contains(activeElement) && activeElement.id !== "searchBox") {
      closeSuggestions();
    }
  }, 100);
}

function closeSuggestions() {
  document.getElementById("suggestions").innerHTML = "";
  currentSuggestionIndex = -1;
}

async function showSuggestions() {
  const query = document.getElementById("searchBox").value.toLowerCase();
  const suggestionsDiv = document.getElementById("suggestions");
  suggestionsDiv.innerHTML = "";

  const results = fuse.search(query).slice(0, 7);

  results.forEach(({ item }) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.className = "suggestion-item";
    suggestionItem.textContent = `${item.name} (${item.tags.join(", ")})`;
    suggestionItem.onclick = () => {
      document.getElementById("searchBox").value = item.name;
      closeSuggestions();
      searchIcons();
    };
    suggestionItem.tabIndex = 0;
    suggestionItem.onkeydown = (event) => {
      if (event.key === "Enter") {
        suggestionItem.click();
      }
    };
    suggestionsDiv.appendChild(suggestionItem);
  });
}

async function searchIcons() {
  const query = document.getElementById("searchBox").value.toLowerCase();
  const resultsDiv = document.getElementById("iconResults");
  resultsDiv.innerHTML = "";

  const results = query.trim() ? fuse.search(query) : fuse._docs.slice(0, 30).map((item) => ({ item }));

  results.forEach(({ item }) => {
    const img = document.createElement("img");
    img.src = item.base64 ?? item.url;
    img.style.width = "50px";
    img.style.margin = "5px";
    img.style.cursor = "pointer";
    img.title = item.name;
    img.tabIndex = 0; // Make icon focusable
    img.onclick = () => insertIcon(item);
    img.onkeydown = (event) => {
      if (event.key === "Enter") {
        img.click();
      }
    };
    resultsDiv.appendChild(img);
  });
}
