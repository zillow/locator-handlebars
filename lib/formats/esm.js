/*jslint nomen:true, node:true */

"use strict";

module.exports = function (bundleName, templateName, moduleName, precompiled, partials, prefix) {

    // base dependency
    var dependencies = ["template-base", "handlebars-base"],
        // Used to store both the original file path and the dashed name
        partialModuleToPathMap = {};

    // each partial should be provisioned thru another yui module
    // and the name of the partial should translate into a yui module
    // to become a dependency
    partials = partials || [];
    partials.map(function (filePath) {
        // transform paths to custom naming convention
        var moduleSuffix = filePath.replace(/\//g, '-');
        // map dashed module suffix to original file name
        // Ex: { "path-to-mustache-file" : "path/to/mustache/file" }
        partialModuleToPathMap[moduleSuffix] = filePath;
        // add dependency
        var dep = (prefix || bundleName + '-tmpl-') + moduleSuffix;
        dependencies.push(dep);
    });
    var imports = dependencies.map(function (dep) {
        return "import '" + dep + "';";
    });
    return [
        '// @module ' + moduleName + '',
    ].concat(imports).concat([
        'import Y from \'yui-instance\';',
        'var fn = Y.Template.Handlebars.revive(' + precompiled + '),',
        '    partials = {};',
        '',
        'Y.Object.each(' + JSON.stringify(partialModuleToPathMap) + ', function (filePath, moduleSuffix) {',
        '    var fn = Y.Template.get("' + bundleName + '/" + moduleSuffix);',
        '    if (fn) {',
        '        partials[filePath] = fn;',
        '        partials[moduleSuffix] = fn;',
        '    }',
        '});',
        '',
        'Y.Template.register("' + bundleName + '/' + templateName + '", function (data, options) {',
        '    options = options || {};',
        '    options.partials = options.partials ? Y.merge(partials, options.partials) : partials;',
        '    return fn(data, options);',
        '});'
    ]).join('\n');

};
