function createFunction(code, errors) {
  try {
    return new Function(code);
  } catch (err) {
    errors.push({ err: err, code: code });
    return noop;
  }
}

function createCompileToFunctionFn(compile) {
  var cache = Object.create(null);

  return function compileToFunctions(template, options, vm) {
    options = extend({}, options);
    // compile
    var compiled = compile(template, options);

    // turn code into functions
    var res = {};
    var fnGenErrors = [];
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
      return createFunction(code, fnGenErrors);
    });

    return (cache[key] = res);
  };
}

function createCompilerCreator(baseCompile) {
  return function createCompiler(baseOptions) {
    function compile(template, options) {
      var finalOptions = Object.create(baseOptions);
      var compiled = baseCompile(template, finalOptions);
      return compiled;
    }

    return {
      compile: compile,
      compileToFunctions: createCompileToFunctionFn(compile),
    };
  };
}
var createCompiler = createCompilerCreator(function baseCompile(
  template,
  options
) {
  var ast = parse(template.trim(), options);
  if (options.optimize !== false) {
    optimize(ast, options);
  }
  var code = generate(ast, options);
  return {
    ast: ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns,
  };
});

var ref$1 = createCompiler(baseOptions);
var compileToFunctions = ref$1.compileToFunctions;

Vue.compile = compileToFunctions;
