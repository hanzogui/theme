import { isServer } from "@hanzogui/constants";
import { startTransition } from "@hanzogui/start-transition";
import { ensureThemeVariable, forceUpdateThemes, getConfig, getThemeCSSRules, mutatedAutoVariables, proxyThemeToParents, simpleHash, updateConfig } from "@hanzogui/web";
function mutateThemes({
  themes,
  batch,
  insertCSS = true,
  ...props
}) {
  const allThemesProxied = {};
  const allThemesRaw = {};
  for (const {
    name,
    theme
  } of themes) {
    const res = _mutateTheme({
      ...props,
      name,
      theme,
      // we'll do one update at the end
      avoidUpdate: true,
      // always add which also replaces but doesnt fail first time
      mutationType: "add"
    });
    if (res) {
      allThemesProxied[name] = res.theme;
      allThemesRaw[name] = res.themeRaw;
    }
  }
  const cssRules = insertCSS ? insertThemeCSS(allThemesRaw, batch) : [];
  startTransition(() => {
    for (const themeName in allThemesProxied) {
      const theme = allThemesProxied[themeName];
      updateThemeConfig(themeName, theme);
    }
    updateThemeStates();
  });
  return {
    themes: allThemesProxied,
    themesRaw: allThemesRaw,
    cssRules
  };
}
function _mutateTheme(props) {
  if (isServer) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Theme mutation is not supported on server side");
    }
    return;
  }
  const config = getConfig();
  const {
    name: themeName,
    theme: themeIn,
    insertCSS,
    mutationType
  } = props;
  if (process.env.NODE_ENV === "development") {
    if (!config) {
      throw new Error("No config");
    }
    const theme2 = config.themes[props.name];
    if (mutationType !== "add" && !theme2) {
      throw new Error(`${mutationType === "replace" ? "Replace" : "Update"} theme failed! Theme ${props.name} does not exist`);
    }
  }
  const theme = {
    ...(mutationType === "update" ? config.themes[themeName] ?? {} : {}),
    ...themeIn
  };
  for (const key in theme) {
    ensureThemeVariable(theme, key);
  }
  const themeProxied = proxyThemeToParents(themeName, theme);
  const response = {
    themeRaw: theme,
    theme: themeProxied,
    cssRules: []
  };
  if (props.avoidUpdate) {
    return response;
  }
  if (insertCSS) {
    response.cssRules = insertThemeCSS({
      [themeName]: theme
    });
  }
  updateThemeConfig(themeName, themeProxied);
  updateThemeStates();
  return response;
}
function updateThemeConfig(themeName, theme) {
  const config = getConfig();
  config.themes[themeName] = theme;
  updateConfig("themes", config.themes);
}
function updateThemeStates() {
  forceUpdateThemes();
}
function insertThemeCSS(themes, batch = false) {
  if (false) {
    return [];
  }
  const config = getConfig();
  let cssRules = [];
  for (const themeName in themes) {
    const theme = themes[themeName];
    const rules = getThemeCSSRules({
      config,
      themeName,
      names: [themeName],
      hasDarkLight: true,
      theme,
      // Use mutated variable creator which starts from high index to avoid conflicts
      useMutatedVariables: true
    });
    cssRules = [...cssRules, ...rules];
    if (!batch) {
      updateStyle(`t_theme_style_${themeName}`, rules);
    }
  }
  if (mutatedAutoVariables.length > 0) {
    const autoVarCSS = `:root{${mutatedAutoVariables.map(v => `--${v.name}:${v.val}`).join(";")}}`;
    updateStyle(`t_mutate_vars`, [autoVarCSS]);
  }
  if (batch) {
    const id = typeof batch == "string" ? batch : simpleHash(Object.keys(themes).join(""));
    updateStyle(`t_theme_style_${id}`, cssRules);
  }
  return cssRules;
}
function updateStyle(id, rules) {
  const existing = document.querySelector(`#${id}`);
  const style = document.createElement("style");
  style.id = id;
  style.appendChild(document.createTextNode(rules.join("\n")));
  document.head.appendChild(style);
  if (existing) {
    existing.parentElement?.removeChild(existing);
  }
}
export { _mutateTheme, mutateThemes };
//# sourceMappingURL=_mutateTheme.mjs.map
