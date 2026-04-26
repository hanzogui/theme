import { _mutateTheme } from "./_mutateTheme.native.js";
function replaceTheme(param) {
  var {
    name,
    theme
  } = param;
  var next = _mutateTheme({
    name,
    theme,
    insertCSS: true,
    mutationType: "replace"
  });
  return next;
}
export { replaceTheme };
//# sourceMappingURL=replaceTheme.native.js.map
