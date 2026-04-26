"use strict";

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
  (0, import_start_transition.startTransition)(function () {
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
  if (import_constants.isServer) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Theme mutation is not supported on server side");
    }
    return;
  }
  var config = (0, import_web.getConfig)();
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
    (0, import_web.ensureThemeVariable)(theme1, key);
  }
  var themeProxied = (0, import_web.proxyThemeToParents)(themeName, theme1);
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
  var config = (0, import_web.getConfig)();
  config.themes[themeName] = theme;
  (0, import_web.updateConfig)("themes", config.themes);
}
function updateThemeStates() {
  (0, import_web.forceUpdateThemes)();
}
function insertThemeCSS(themes) {
  var batch = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
  if (true) {
    return [];
  }
  var config = (0, import_web.getConfig)();
  var cssRules = [];
  for (var themeName in themes) {
    var theme = themes[themeName];
    var rules = (0, import_web.getThemeCSSRules)({
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
    var autoVarCSS = `:root{${import_web.mutatedAutoVariables.map(function (v) {
      return `--${v.name}:${v.val}`;
    }).join(";")}}`;
    updateStyle(`t_mutate_vars`, [autoVarCSS]);
  }
  if (batch) {
    var id = typeof batch == "string" ? batch : (0, import_web.simpleHash)(Object.keys(themes).join(""));
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
//# sourceMappingURL=_mutateTheme.native.js.map
