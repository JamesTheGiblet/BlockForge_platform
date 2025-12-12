# Studio Migration Guide

## Phase A: Audit (10 min)

- [ ] Identify unique algorithms
- [ ] Map input types
- [ ] List export formats
- [ ] Note dependencies

## Phase B: Setup (5 min)

- [ ] Copy STUDIO_TEMPLATE
- [ ] Rename files
- [ ] Fill manifest.json

## Phase C: Extract (30 min)

- [ ] Core logic → plugin
- [ ] Shared code → library
- [ ] Assets → assets/

## Phase D: Test (10 min)

- [ ] npm run scan-plugins
- [ ] Load in browser
- [ ] Test all exports

## Phase E: Document (5 min)

- [ ] Update README.md
- [ ] Commit & push

```txt

### 3. `SHARED_LIBRARY_DECISION_TREE.md`
When to extract vs. keep local:
```

Is it used by 2+ studios?
  YES → Extract to shared
  NO  → Keep in plugin

Does it manipulate voxels/bricks?
  YES → Belongs in Voxelizer/BrickOptimizer
  NO  → Keep in plugin

Is it UI rendering?
  YES → Always plugin-specific
  NO  → Consider shared utils
