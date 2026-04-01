
  # OpenShift Management Engine Prototype

  This is a code bundle for OpenShift Management Engine Prototype. The original project is available at https://www.figma.com/design/iNxDPuPCcQkyTexHp55ybt/OME---Deployments, though this project has had change since then. It was moved from Figma to the repo on April 1, 2026.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Collaboration (Git)

  Two people may work on this prototype at the same time. A light branch workflow keeps `main` stable and reduces surprise conflicts.

  - **Treat `main` as the shared good state** — what we are comfortable running and demoing.
  - **Use short-lived branches** for changes — e.g. `feature/…` or `fix/…`, one focused change per branch when practical.
  - **Open a pull request** before merging into `main`, even for small edits, so the other person can see what landed and catch overlaps.
  - **Update from `main` often** — before starting work and before pushing, merge or rebase the latest `main` into your branch so conflicts are small and early.
  - **Say when you touch the same area** — if two people edit the same files or features, coordinate in chat or on the PR so work does not collide blindly.
  - **Optional:** In GitHub repository settings, enable branch protection on `main` (e.g. require a pull request before merging) if you want an extra guardrail.
