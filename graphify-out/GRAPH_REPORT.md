# Graph Report - ManageWork  (2026-05-06)

## Corpus Check
- 239 files · ~102,486 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 858 nodes · 1051 edges · 131 communities (100 shown, 31 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 54 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e5a04808`
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
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]

## God Nodes (most connected - your core abstractions)
1. `ActivityLog` - 17 edges
2. `ManageWork - Full Stack Application` - 17 edges
3. `Notification` - 14 edges
4. `Task` - 14 edges
5. `ChatRoomMembers` - 11 edges
6. `Message` - 11 edges
7. `File` - 11 edges
8. `Project` - 11 edges
9. `Tag` - 11 edges
10. `Channel` - 10 edges

## Surprising Connections (you probably didn't know these)
- `createPost()` --calls--> `notifyMentions()`  [INFERRED]
  backend/src/modules/channels/channelPost.controller.js → backend/src/shared/utils/mentionUtils.js
- `createComment()` --calls--> `notifyMentions()`  [INFERRED]
  backend/src/modules/tasks/comment.controller.js → backend/src/shared/utils/mentionUtils.js
- `TaskStatus()` --calls--> `getStatusOptionsForDisplay()`  [INFERRED]
  frontend/src/features/tasks/TaskStatus.jsx → frontend/src/utils/taskColors.js
- `Chat()` --calls--> `useChatRooms()`  [INFERRED]
  frontend/src/pages/chat/Chat.jsx → frontend/src/hooks/chat_hook/useChatRooms.js
- `createReply()` --calls--> `emitNotification()`  [INFERRED]
  backend/src/modules/channels/channelPost.controller.js → backend/src/shared/sockets/socketEmitter.js

## Communities (131 total, 31 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (35): KanBanView(), MonthView(), RecurrenceSection(), getTodayDateTimeLocal(), isSameDayString(), parseDateTimeLocal(), useTaskForm(), useTaskRealtime() (+27 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (24): createPost(), createReply(), emitNotification(), emitTaskReordered(), emitTaskUpdated(), emitToProject(), emitToUser(), createComment() (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (37): 1) DEV LOCAL (Backend local + Docker Redis + Docker Postgres), 2) PRODUCTION (Full Docker: FE + BE + DB + Redis), 🌐 Access the Application, 🔧 API Endpoints, Authentication, Backend Development, code:bash (docker compose -f docker-compose.dev.yml up -d), code:block13 (my-fullstack-app/) (+29 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (17): ChannelMembersModal(), ChannelView(), useChannelSocket(), useSocketRegister(), getToken(), emitDeleteMessage(), emitEditMessage(), emitGetMessages() (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (19): TaskApplyToModal(), useTaskDetail(), formatDateTimeLocal(), AttachmentManager(), CompletedTaskCard(), formatRelativeTime(), DependencyManager(), TagManager() (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (4): addMemberToChatRoom(), createChatRoom(), leaveChatRoom(), sendSystemMessage()

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (11): confirm(), ProjectCardSkeleton(), Projects(), ProjectSettings(), addProjectMemberAPI(), createProjectAPI(), deleteProjectAPI(), getProjectMembersAPI() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (5): Login(), PeopleDirectory(), createUserAPI(), getUsersAPI(), loginAPI()

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (17): 1. Clone the repository, 2. Install dependencies, 3. Database Setup, 4. Start the Application, code:bash (cd backend), code:bash (# From root directory), code:bash (# Terminal 1 - Backend), code:bash (git clone <repository-url>) (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (9): Dashboard(), Home(), isDateToday(), isTaskInToday(), Layout(), getBurndownChartAPI(), getPerformanceMetricsAPI(), getVelocityChartAPI() (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (4): AuthWrapper(), SocketProvider(), useSocket(), ThemeProvider()

### Community 21 - "Community 21"
Cohesion: 0.23
Nodes (10): createUser(), getAccount(), getUsers(), login(), updateProfile(), createUserService(), getAccountService(), getUsersService() (+2 more)

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (5): useChatRooms(), useChatSearch(), usePrivateChat(), RoomList(), UserItem()

### Community 23 - "Community 23"
Cohesion: 0.23
Nodes (7): ProjectActivity(), ProjectDetail(), getProjectAPI(), searchTasksAPI(), applyProjectFilters(), getDateHelpers(), ProjectTaskFilters()

### Community 28 - "Community 28"
Cohesion: 0.31
Nodes (6): addProjectMember(), getProject(), getProjectMembers(), getProjectStats(), removeProjectMember(), updateProject()

### Community 29 - "Community 29"
Cohesion: 0.36
Nodes (7): cloudinaryConfig(), createStorage(), deleteFile(), getAvatarUrls(), getFolder(), getTransformedUrl(), uploadSingle()

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (7): createSubtaskAPI(), deleteSubtaskAPI(), getTaskSubtasksAPI(), toggleSubtaskAPI(), updateSubtaskAPI(), SubtaskItem(), SubtaskList()

### Community 40 - "Community 40"
Cohesion: 0.43
Nodes (3): ActivityLog(), Chat(), Settings()

### Community 62 - "Community 62"
Cohesion: 0.5
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

## Knowledge Gaps
- **33 isolated node(s):** `code:bash (docker compose -f docker-compose.dev.yml up -d)`, `code:bash (cd backend)`, `code:bash (npm run dev)`, `code:bash (cd backend)`, `code:bash (docker compose up -d --build)` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Chat()` connect `Community 40` to `Community 22`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `useChatRooms()` connect `Community 22` to `Community 40`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `code:bash (docker compose -f docker-compose.dev.yml up -d)`, `code:bash (cd backend)`, `code:bash (npm run dev)` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._