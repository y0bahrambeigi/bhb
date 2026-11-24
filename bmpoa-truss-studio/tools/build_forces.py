"""Run with a path to Dissertation-Truss-Optimization/problems from the reference commit."""
import hashlib
import json
import re
import sys
from pathlib import Path

import numpy as np

DIST = Path(__file__).resolve().parents[1]
COMMIT = "723bdc81d198a7895ce5401c083620c709897307"
SOURCES = {
    "DiscreteDynamicSteelTruss": "ab9ab6eaab83822ed0271558be4531de84d9f46a",
    "SeventyTwoBarSpaceTruss": "7aeaeea42537531fa3a2bb45ce4a67d661191af1",
    "OneHundredTwentyBarDomeTruss": "bb8310f2a9cd6c087f4cc57a9f2e844bec57a67a",
}


def read_sources(directory):
    sources = {}
    for name, digest in SOURCES.items():
        raw = (directory / (name + ".m")).read_bytes()
        assert hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest() == digest, name
        sources[name] = raw.decode()
    return sources


def matrix(source, name):
    body = re.search(r"\b" + name + r" = \[([^\]]+)\];", source)[1]
    return np.array([row.split() for row in body.replace("...", "").replace(",", " ").split(";")], dtype=int)


def definition(model, sources):
    if model == "72-bar":
        source = sources["SeventyTwoBarSpaceTruss"]
        base = matrix(source, "base")
        nodes = np.vstack([base + [0, 0, 60 * level] for level in range(5)])
        storey = matrix(source, "storeyElements")
        bars = np.vstack([storey + 4 * level for level in range(4)])
        groups = np.repeat(np.arange(16), [4, 8, 4, 2] * 4)
        loads = np.zeros((20, 3, 2))
        loads[16:20, 2, 0] = -5000
        loads[16, :, 1] = [5000, 5000, -5000]
        return nodes, bars, groups, loads, np.arange(4), np.arange(1, 31) / 10, 29e6, 0.2836

    # The dynamic dome overrides the static benchmark's coordinates only.
    rings = [[0, 0, 7.0]]
    for count, radius, elevation in [(12, 6.94, 5.85), (24, 12.04, 3.0), (12, 15.89, 0)]:
        for angle in np.arange(count) * (2 * np.pi / count):
            rings.append([radius * np.cos(angle), radius * np.sin(angle), elevation])
    nodes = np.array(rings) / 0.0254
    bars = matrix(sources["OneHundredTwentyBarDomeTruss"], "elements")
    groups = np.repeat(np.arange(7), [12, 12, 12, 24, 24, 12, 24])
    loads = np.zeros((49, 3, 1))
    loads[0, 2] = -13490
    loads[1:14, 2] = -6744
    loads[14:37, 2] = -2248
    return nodes, bars, groups, loads, np.arange(37, 49), np.r_[0.775, np.arange(1, 20.25, 0.25)], 30450000, 0.288


def solve_model(model, rows, sources):
    nodes, bars, groups, loads, fixed, catalog, young, density = definition(model, sources)
    load_cases = loads.reshape(len(nodes) * 3, -1)
    start, end = (bars - 1).T
    delta = nodes[end] - nodes[start]
    lengths = np.linalg.norm(delta, axis=1)
    directions = delta / lengths[:, None]
    # B maps nodal displacements to signed elongations in source member order.
    B = np.zeros((len(bars), len(nodes) * 3))
    for axis in range(3):
        B[np.arange(len(bars)), 3 * start + axis] = -directions[:, axis]
        B[np.arange(len(bars)), 3 * end + axis] = directions[:, axis]
    free = np.flatnonzero(np.repeat(~np.isin(np.arange(len(nodes)), fixed), 3))
    designs = {}
    worst = 0.0
    for row in rows:
        indices = row["best_indices"]
        choice = np.array(indices.strip("[]").split(), dtype=int)
        assert len(choice) == max(groups)+1 and np.all((choice >= 1) & (choice <= len(catalog)))
        area = catalog[choice - 1][groups]
        assert np.isclose(density * np.dot(area, lengths), float(row["weight"]), rtol=1e-11, atol=1e-9)
        if indices in designs:
            continue
        axial_stiffness = young * area / lengths
        K = B.T @ (axial_stiffness[:, None] * B)
        displacement = np.zeros_like(load_cases)
        displacement[free] = np.linalg.solve(K[np.ix_(free, free)], load_cases[free])
        forces = axial_stiffness[:, None] * (B @ displacement)
        # Independent nodal assembly from member end forces, including reactions.
        balance = np.zeros_like(loads)
        for member, (i, j) in enumerate(bars - 1):
            end_force = directions[member, :, None] * forces[member]
            balance[i] -= end_force
            balance[j] += end_force
        balance -= loads
        for case in range(load_cases.shape[1]):
            external = loads[:, :, case]
            scale = np.linalg.norm(external)
            reactions = balance[fixed, :, case]
            residual = np.linalg.norm(balance[:, :, case].ravel()[free]) / scale
            worst = max(worst, residual)
            assert residual < 1e-10
            assert np.linalg.norm(reactions.sum(axis=0) + external.sum(axis=0)) < 1e-10 * scale
            moment = np.cross(nodes[fixed], reactions).sum(axis=0) + np.cross(nodes, external).sum(axis=0)
            assert np.linalg.norm(moment) < 1e-10 * scale * lengths.max()
        assert np.isfinite(forces).all()
        designs[indices] = {"groupAreas": catalog[choice - 1].tolist(), "cases": forces.T.tolist()}
    print(model, len(rows), "runs;", len(designs), "distinct designs; max relative residual", worst)
    return {"nodes": nodes.tolist(), "members": bars.tolist(), "groups": (groups+1).tolist(),
            "supports": (fixed+1).tolist(), "designs": designs}


if __name__ == "__main__":
    sources = read_sources(Path(sys.argv[1]))
    dataset = json.loads((DIST / "data.json").read_text())
    assert dataset["source_commit"] == COMMIT and len(dataset["rows"]) == 40
    result = {"source_commit": COMMIT, "models": {}}
    for model in ["72-bar", "120-bar"]:
        runs = [r for r in dataset["rows"] if r["benchmark"] == model + "-steel-dynamic-discrete"]
        assert len(runs) == 20
        result["models"][model] = solve_model(model, runs, sources)
    (DIST / "member-forces.json").write_text(json.dumps(result, allow_nan=False, separators=(",", ":")) + "\n")
