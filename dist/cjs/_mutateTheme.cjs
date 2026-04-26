var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all) __defProp(target, name, {
    get: all[name],
    enumerable: true
  });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    });
  }
  return to;
};
var __toCommonJS = mod => __copyProps(__defProp({}, "__esModule", {
  value: true
}), mod);
var mutateTheme_exports = {};
__export(mutateTheme_exports, {
  _mutateTheme: () => _mutateTheme,
  mutateThemes: () => mutateThemes
});
module.exports = __toCommonJS(mutateTheme_exports);
var import_constants = require("@hanzogui/constants");
var import_start_transition = require("@hanzogui/start-transition");
var import_web = require("@hanzogui/web");
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
  (0, import_start_transition.startTransition)(() => {
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
  if (import_constants.isServer) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Theme mutation is not supported on server side");
    }
    return;
  }
  const config = (0, import_web.getConfig)();
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
    (0, import_web.ensureThemeVariable)(theme, key);
  }
  const themeProxied = (0, import_web.proxyThemeToParents)(themeName, theme);
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
  const config = (0, import_web.getConfig)();
  config.themes[themeName] = theme;
  (0, import_web.updateConfig)("themes", config.themes);
}
function updateThemeStates() {
  (0, import_web.forceUpdateThemes)();
}
function insertThemeCSS(themes, batch = false) {
  if (false) {
    return [];
  }
  const config = (0, import_web.getConfig)();
  let cssRules = [];
  for (const themeName in themes) {
    const theme = themes[themeName];
    const rules = (0, import_web.getThemeCSSRules)({
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
  if (import_web.mutatedAutoVariables.length > 0) {
    const autoVarCSS = `:root{${import_web.mutatedAutoVariables.map(v => `--${v.name}:${v.val}`).join(";")}}`;
    updateStyle(`t_mutate_vars`, [autoVarCSS]);
  }
  if (batch) {
    const id = typeof batch == "string" ? batch : (0, import_web.simpleHash)(Object.keys(themes).join(""));
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