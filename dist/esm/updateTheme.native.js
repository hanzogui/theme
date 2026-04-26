import { _mutateTheme } from "./_mutateTheme.native.js";
function updateTheme(param) {
  var {
    name,
    theme
  } = param;
  return _mutateTheme({
    name,
    theme,
    insertCSS: true,
    mutationType: "update"
  });
}
export { updateTheme };
//# sourceMappingURL=updateTheme.native.js.map
