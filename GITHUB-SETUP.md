# GITHUB-SETUP.md — optional, 5 minutes, removes the last machine dependency

The repo is now a git repository. It does not need a remote to work — everything in
`WEEKLY.md` runs locally. This file is the upgrade path if you ever want the weekly
loop to run **without you opening Claude Code at all.**

## Why this is the only real fix for full autonomy

Three machines, and until now no single one could do the whole job:

| | Sees the repo | Has a browser |
|---|---|---|
| Cloud scheduled task | no | **yes** |
| Mac desktop sandbox | **yes** | no, and `cdn.playwright.dev` is blocked so it can never get one |
| Claude Code on your Mac | **yes** | **yes** |

A scheduled task needs device binding to see the repo, and binding requires an approval
signed on your Mac at task-creation time that a remote session cannot produce. Two
attempts, both refused.

**GitHub sidesteps the whole problem.** Both machines can reach it over HTTPS — verified.
A cloud task clones the repo, renders with the Chromium it already has, and pushes. No
binding, no bridge, no approval.

## The five minutes

1. **Create a private repo** on github.com named `contengine`. No README, no .gitignore.
2. **Push**, from Terminal on your Mac:
   ```bash
   cd ~/Desktop/contengine
   git branch -M main
   git remote add origin https://github.com/<you>/contengine.git
   git push -u origin main
   ```
3. **Create a fine-grained personal access token** — Settings → Developer settings →
   Personal access tokens → Fine-grained. Scope it to **only** this repository, with
   **Contents: Read and write**. Nothing else. Set an expiry you will actually renew.
4. Tell me the repo URL. I will rewrite the loop task to clone, render and push. **Do
   not paste the token into this chat or into a task prompt** — it belongs in the task's
   environment variables, which you set from the task's own settings.

## What changes afterwards

Your Sunday tap becomes: `git pull`, post, log, `git push`. The building and rendering
already happened overnight.

**Until you do this, nothing is broken** — Claude Code does the same work on demand, and
`WEEKLY.md` is written for that. This only buys you the difference between "runs when I
sit down" and "already ran."

## One thing that is tracked on purpose

`.gitignore` keeps `node_modules/` and the TikTok render set out of history, but **tracks
the Instagram slides**. They are the deliverable and they have to travel between machines.
About 1.5 MB a post. The 9:16 set re-renders from the same spec in six seconds, so it is
not worth carrying.
