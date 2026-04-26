import { isServer } from "@hanzogui/constants";
import { startTransition } from "@hanzogui/start-transition";
import { ensureThemeVariable, forceUpdateThemes, getConfig, getThemeCSSRules, mutatedAutoVariables, proxyThemeToParents, simpleHash, updateConfig } from "@hanzogui/web";
function mutateThemes(param) {
  var {
    themes,
    batch,
    insertCSS = true,
    ...props
  } = param;
  var allThemesProxied = {};
  var allThemesRaw = {};
  var _iteratorNormalCompletion = true,
    _didIteratorError = false,
    _iteratorError = void 0;
  try {
    for (var _iterator = themes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var {
        name,
        theme
      } = _step.value;
      var res = _mutateTheme({
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
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
  var cssRules = insertCSS ? insertThemeCSS(allThemesRaw, batch) : [];
  startTransition(function () {
    for (var themeName in allThemesProxied) {
      var theme2 = allThemesProxied[themeName];
      updateThemeConfig(themeName, theme2);
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
  var config = getConfig();
  var {
    name: themeName,
    theme: themeIn,
    insertCSS,
    mutationType
  } = props;
  if (process.env.NODE_ENV === "development") {
    if (!config) {
      throw new Error("No config");
    }
    var theme = config.themes[props.name];
    if (mutationType !== "add" && !theme) {
      throw new Error(`${mutationType === "replace" ? "Replace" : "Update"} theme failed! Theme ${props.name} does not exist`);
    }
  }
  var _config_themes_themeName;
  var theme1 = {
    ...(mutationType === "update" ? (_config_themes_themeName = config.themes[themeName]) !== null && _config_themes_themeName !== void 0 ? _config_themes_themeName : {} : {}),
    ...themeIn
  };
  for (var key in theme1) {
    ensureThemeVariable(theme1, key);
  }
  var themeProxied = proxyThemeToParents(themeName, theme1);
  var response = {
    themeRaw: theme1,
    theme: themeProxied,
    cssRules: []
  };
  if (props.avoidUpdate) {
    return response;
  }
  if (insertCSS) {
    response.cssRules = insertThemeCSS({
      [themeName]: theme1
    });
  }
  updateThemeConfig(themeName, themeProxied);
  updateThemeStates();
  return response;
}
function updateThemeConfig(themeName, theme) {
  var config = getConfig();
  config.themes[themeName] = theme;
  updateConfig("themes", config.themes);
}
function updateThemeStates() {
  forceUpdateThemes();
}
function insertThemeCSS(themes) {
  var batch = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
  if (true) {
    return [];
  }
  var config = getConfig();
  var cssRules = [];
  for (var themeName in themes) {
    var theme = themes[themeName];
    var rules = getThemeCSSRules({
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
    var autoVarCSS = `:root{${mutatedAutoVariables.map(function (v) {
      return `--${v.name}:${v.val}`;
    }).join(";")}}`;
    updateStyle(`t_mutate_vars`, [autoVarCSS]);
  }
  if (batch) {
    var id = typeof batch == "string" ? batch : simpleHash(Object.keys(themes).join(""));
    updateStyle(`t_theme_style_${id}`, cssRules);
  }
  return cssRules;
}
function updateStyle(id, rules) {
  var existing = document.querySelector(`#${id}`);
  var style = document.createElement("style");
  style.id = id;
  style.appendChild(document.createTextNode(rules.join("\n")));
  document.head.appendChild(style);
  if (existing) {
    var _existing_parentElement;
    (_existing_parentElement = existing.parentElement) === null || _existing_parentElement === void 0 ? void 0 : _existing_parentElement.removeChild(existing);
  }
}
export { _mutateTheme, mutateThemes };
//# sourceMappingURL=_mutateTheme.native.js.map
