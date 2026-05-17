# Issue tracker: Linear

Issues for this repo live in **Linear** under the **WHO SRHR** project.

- **Workspace**: Advaita Software
- **Team**: Advaita Software (team key: ADV)
- **Project**: WHO SRHR
- **Project URL**: https://linear.app/advaita-software/project/who-srhr-1d370a105fbd

## Workflow statuses

Issues move through these statuses:

- **Backlog** — created but not yet evaluated
- **Todo** — specified and ready to start
- **In Progress** — currently being worked on
- **In Review** — implementation complete, under review
- **Done** — completed
- **Canceled** — will not be actioned (or duplicate)

## When creating a new issue

Use the Linear MCP tool `mcp__plugin_linear_linear__save_issue` with:
- `team`: "Advaita Software"
- `project`: "WHO SRHR"
- `title` and `description` as appropriate
- `state`: appropriate workflow status (default "Backlog")

## When a skill says "publish to the issue tracker"

Create a new issue in Linear under the WHO SRHR project (Backlog status by default).

## When a skill says "fetch the relevant ticket"

Use `mcp__plugin_linear_linear__get_issue` or `mcp__plugin_linear_linear__list_issues` filtered to project "WHO SRHR".

## Triage labels

Triage labels (needs-triage, needs-info, etc.) are applied as Linear **labels** on issues, separate from workflow statuses. Create them in Linear if they don't exist yet.
