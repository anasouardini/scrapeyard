import ts, { type CreateProgramOptions } from 'typescript';

export function compile(
  filenames: string[],
  options: ts.CompilerOptions,
): void {
  var host = ts.createCompilerHost(options);
  var program = ts.createProgram(filenames, options, host);
  var checker = ts.createTypeChecker(program, /*produceDiagnostics*/ true);
  var result = checker.emitFiles();

  var allDiagnostics = program
    .getDiagnostics()
    .concat(checker.getDiagnostics())
    .concat(result.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    var lineChar = diagnostic.file.getLineAndCharacterFromPosition(
      diagnostic.start,
    );
    console.log(
      `${diagnostic.file.filename} (${lineChar.line},${lineChar.character}): ${diagnostic.messageText}`,
    );
  });

  console.log(`Process exiting with code '${result.emitResultStatus}'.`);
  process.exit(result.emitResultStatus);
}

function compileCode() {
  compile([`${path.join(__dirname, 'botsActionsGen.ts')}`], {
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });
}

// testing...
import path from 'path';
compileCode();
