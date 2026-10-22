"""Shared browser runner and exercise checker. Student code runs only in a worker."""
import ast
import builtins
import contextlib
import io
import json
import traceback


class LimitedOutput(io.StringIO):
    def write(self, value):
        if self.tell() + len(value) > 16000:
            raise RuntimeError("Гаралт хэт урт байна. Давталтын нөхцөлөө шалгаарай.")
        return super().write(value)


def normalize_output(value):
    return "\n".join(line.rstrip() for line in value.replace("\r\n", "\n").split("\n")).strip("\n")


def error_message(error):
    if isinstance(error, EOFError):
        return "Оролт хүрэлцэхгүй байна. input() бүрийн утгыг оролтын талбарт тусдаа мөрөнд оруулаарай."
    if isinstance(error, SyntaxError):
        return f"{type(error).__name__}: {error.msg} (мөр {error.lineno})"
    frames = traceback.extract_tb(error.__traceback__)
    line = next((frame.lineno for frame in reversed(frames) if frame.filename == "main.py"), None)
    suffix = f" (мөр {line})" if line else ""
    return f"{type(error).__name__}: {error}{suffix}"


class InitialValues(ast.NodeTransformer):
    """Change only the first top-level initialization of each test variable."""
    def __init__(self, values):
        self.values = values
        self.seen = set()

    def visit_Module(self, tree):
        for statement in tree.body:
            if isinstance(statement, (ast.Assign, ast.AnnAssign)):
                targets = statement.targets if isinstance(statement, ast.Assign) else [statement.target]
                names = [target.id for target in targets if isinstance(target, ast.Name)]
                replacements = [name for name in names if name in self.values and name not in self.seen]
                if replacements:
                    statement.value = ast.copy_location(ast.Constant(self.values[replacements[0]]), statement.value)
                    self.seen.update(replacements)
        return tree


def execute(code, inputs, variables=None):
    output = LimitedOutput()
    lines = iter(inputs)

    def read_input(prompt=""):
        try:
            return str(next(lines))
        except StopIteration:
            raise EOFError() from None

    try:
        tree = ast.parse(code, filename="main.py")
        if variables:
            tree = InitialValues(variables).visit(tree)
            ast.fix_missing_locations(tree)
        scope = {"__builtins__": dict(vars(builtins)), "__name__": "__main__", "input": read_input}
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
            exec(compile(tree, "main.py", "exec"), scope)
        return {"output": normalize_output(output.getvalue())}
    except BaseException as error:
        return {"output": normalize_output(output.getvalue()), "error": error_message(error)}


def requirement_passed(tree, requirement):
    kind, name = requirement["kind"], requirement["name"]
    nodes = list(ast.walk(tree))
    if kind == "node":
        return any(type(node).__name__ == name for node in nodes)
    if kind == "call":
        return any(isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == name for node in nodes)
    if kind == "assign":
        return any(isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store) and node.id == name for node in nodes)
    if kind == "nested":
        return any(type(node).__name__ == name and any(type(child).__name__ == name for statement in node.body for child in ast.walk(statement)) for node in nodes if isinstance(node, (ast.For, ast.While)))
    return False


def run_request(request):
    code = request.get("code", "")
    if len(code) > 50000:
        return {"output": "", "error": "Код 50,000 тэмдэгтээс урт байна.", "checks": []}
    if request.get("mode") != "check":
        return {**execute(code, request.get("inputs", [])), "checks": []}
    try:
        tree = ast.parse(code, filename="main.py")
    except SyntaxError as error:
        return {"output": "", "error": error_message(error), "checks": []}
    checks = [{"label": requirement["label"], "passed": requirement_passed(tree, requirement)} for requirement in request.get("requirements", [])]
    for case in request.get("tests", []):
        actual = execute(code, case.get("inputs", []), case.get("variables"))
        checks.append({"label": case["label"], "passed": not actual.get("error") and actual["output"] == normalize_output(case["expected"]), "actual": actual["output"], "expected": case["expected"], **({"error": actual["error"]} if actual.get("error") else {})})
    return {"output": "", "checks": checks}
