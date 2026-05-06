# Graph Report - .  (2026-05-06)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 107 nodes · 56 edges · 53 communities (26 shown, 27 thin omitted)
- Extraction: 64% EXTRACTED · 34% INFERRED · 2% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5c1cd09d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 44|Community 44]]

## God Nodes (most connected - your core abstractions)
1. `routes/index.js` - 2 edges
2. `TaskCacheService` - 2 edges
3. `Zustand Global State Management` - 2 edges
4. `Database Initialization` - 1 edges
5. `Full-Text Search Implementation` - 1 edges
6. `Socket.IO Integration` - 1 edges
7. `Analytics Engine` - 1 edges
8. `Real-time Notifications` - 1 edges
9. `File Attachment Management` - 1 edges
10. `Notification Lifecycle` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (53 total, 27 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.4
Nodes (3): Recurring Task Logic, Task Caching Strategy, Task Reordering System

## Ambiguous Edges - Review These
- `ProjectActivity.jsx` → `ProjectActivity.jsx`  [AMBIGUOUS]
  frontend/src/features/projects/ProjectActivity.jsx · relation: references

## Knowledge Gaps
- **32 isolated node(s):** `Database Initialization`, `Full-Text Search Implementation`, `Socket.IO Integration`, `Analytics Engine`, `Channel & Category Hierarchy` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `ProjectActivity.jsx` and `ProjectActivity.jsx`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Are the 2 inferred relationships involving `TaskCacheService` (e.g. with `socketService.js` and `Redis-backed Cache Invalidation`) actually correct?**
  _`TaskCacheService` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Database Initialization`, `Full-Text Search Implementation`, `Socket.IO Integration` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._