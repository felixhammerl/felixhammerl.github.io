---
layout: post
title: Evergreen Dependencies With Dependabot and GitHub Actions
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: Updating dependencies is a chore at best and a source of vulnerabilities at worst. Let's look at a better way with Github Actions and Dependabot, and examine the pros and cons.
---

In the world of modern software engineering, and thanks to transitive dependencies, even small services easily have hundreds of dependencies, seemingly downloading half of Github. That's a lot of moving parts the need to be kept up to date!

At best, you'd see an engineer sit down once a quarter and do the dreadful work of keeping the lockfile up to date, while mentally preparing for the flurry of breaking changes. Let's not sugarcoat it, this task just sucked. You had a day or two of fun with compatibility issues, breaking changes, regression bugs, testing overhead, and version conflicts – just to name a few.

Hence the [Greenkeeper](https://greenkeeper.io/) team coined the term "Hauptversionsnummernerhöhungsangst": The fear of bumping the major version number because of the breakage it might induce. The Germans have a word for everything, don't they?

In 2015 [Greenkeeper](https://greenkeeper.io/) was one of the first dependency upgrade services, and it was brilliant: If it detected an outdated dependency in your package manager's lockfile, it would bump up that dependency and open a Pull Request. If everything was good, it would get automatically merged. If something broke, you would get notified. In short order, competitors appeared and soon after dependency upgrades were elevated to platform level.

# Embrace the Flow

This flipped the entire approach to dependencies on its head. Instead of viewing dependencies as something fixed, they only ever exist in a transitory state, where only those that for various reasons you'd really need to pin would get pinned.

If a dependency upgrade actually broke your application, you'd immediately know which one it is, instead of triaging it among two dozen all-new dependencies. But there is a whole treasure trove of other benefits:

- You benefit from the latest stability and performance improvements.
- You have a reduced likelihood of encountering bugs.
- You get consistency across different environments, which greatly reduces the "It works on my machine?!"-factor.
- Technical debt incurred by outdated dependencies automagically goes away.
- You stay current and compatibile with other tools and libraries in the ecosystem, and compatibility issues are generally caught early.

All of this is due to the fact that dependencies are typically developed as "fix forward", a strategy used to address bugs or issues by creating new changes or upgrades rather than rolling back to a previous, stable version. Dependencies these days typically don't support older releases, let alone backporting fixes. Instead of reverting the code to a prior state where the issue did not exist, developers implement a fix in the current codebase and move forward.

# Possible Issues

In order to get any mileage out of auto-upgraded dependencies, you need to embrace [continuous integration](https://martinfowler.com/articles/continuousIntegration.html) and have a decent [test pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) that runs fully automated in your [deployment pipeline](https://martinfowler.com/bliki/DeploymentPipeline.html). If you cannot rely on your pipeline to tell whether your code works as intended, please don't even think about auto-upgrading dependencies.

The most likely problem you'll face is that the library introduced a breaking change and your code will either not compile or crash during execution. This is expected and actually a good thing that prompts you to invesigate and fix things.

Version conflicts may still arise, in which case you may need to pin individual dependencies, as mentioned above.

That being said, there is one more thing I would like to address. Greenkeeper adopted a stance I would like to call "evergreen maximalist", where they would not only alert you to new dependencies, but also straight up merge them into your codebase. I agree with this stance to the fullest extent. But Github's Dependabot team seems to disagree.

# Security Issues

Github's Dependabot does not offer an auto-merge option by default. The reason is problems are supply chain attacks like [this](https://github.com/dominictarr/event-stream/issues/116), [this](https://github.com/hugeglass/flatmap-stream/issues/2), [this](https://en.wikipedia.org/wiki/Npm_left-pad_incident), [this](https://www.cisa.gov/news-events/alerts/2021/10/22/malware-discovered-popular-npm-package-ua-parser-js), or [that](https://www.bleepingcomputer.com/news/security/popular-coa-npm-library-hijacked-to-steal-user-passwords/). And I understand this stance, I truly do. But we have to be honest here...

If you had upgraded your dependencies manually, would you have caught it? I don't think I would have. 

If you, like me, would not have caught it, how long would you have been exposed? Would you have upgraded right away a couple of seconds after the new depency version came out? I don't think I would have.

In the grand scheme of things, supply chain attacks happen, but are luckily not the norm. And when they do get publicized, the maintainers are usually motivated to provide fixes in a timely manner. So while it may not make sense to upgrade everything right the second it gets published, it does make sense to upgrade regularly. You will have to find your own sweet spot, but mine is typically once a week on a day when not a lot of other things happen and the pipeline runners are not backlogged, e.g. over the weekend.

Had I upgraded the dependencies linked above on some set time, I may or may not have ingested the vulnerabilities, but I would have definitely ingested the fix. If that does not give you peace of mind, not sure what else will.

# The Truth Is in the Code

For the purposes of this post, let's assume we have a Python project with the `pip` ecosystem. I'm using `pipenv`, but dependabot supports most package managers. 

Here's the project layout:

```
.
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── dependabot.yml
│       └── pipeline.yml
├── Pipfile
└── Pipfile.lock
```

You want weekly, grouped dependency upgrades. Let's create `.github/dependabot.yml` to reflect that:

```
version: 2
updates:
  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "sunday"
      time: "00:00"
    groups:
       updates:
          patterns:
            - "*"
    rebase-strategy: "auto"
    labels:
      - "security"
      - "dependencies"
```

You want to automatically merge the upgrades when the build is successful. Action on a Pull Request being takes is luckily default behavior, so nothing needs to be added there. So let's merge the Pull Request via the Github CLI. 

Also, you want to kick off the `main` branch's pipeline after a successful merge. For this, you need to manually trigger the main pipeline. It is important to note that Github does not run a workflow with a `push` trigger when a Pull Request is merged! `push` events are only generated when a git client executes a `git push` command. While `GITHUB_TOKEN` has sufficient privileges to merge a PR, it does not have sufficient privileges to trigger other workflows. Hence, you will have to generate a personal access token and add that to your repository secrets as `PERSONAL_ACCESS_TOKEN`.

Let's create `.github/workflows/dependabot.yml` to reflect that:

```
name: Dependabot auto-merge
on: pull_request_target

jobs:
  dependabot:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Enable auto-merge for Dependabot PRs
        run: gh pr merge --auto --rebase "$PR_URL"
        env:
          PR_URL: ${{github.event.pull_request.html_url}}
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
      - name: Run pipeline
        run: |
          curl -L \
          -X POST \
          -H "Accept: application/vnd.github+json" \
          -H "Authorization: Bearer ${{ secrets.PERSONAL_ACCESS_TOKEN }}" \
          -H "X-GitHub-Api-Version: 2022-11-28" \
          https://api.github.com/repos/<ORG>/<REPO>/actions/workflows/pipeline.yml/dispatches \
          -d '{"ref":"main"}'
```

There's only one last step left: You need to configure your `pipeline` workflow to respond to `workflow_dispatch` triggers. Let's update `.github/workflows/pipeline.yml` to fix this:

```
name: Pipeline
on:
  push:
  workflow_dispatch:
```

That's it. Should an upgrade now fail, you will receive a Pull Request alerting you to the fact that you need to take action!

