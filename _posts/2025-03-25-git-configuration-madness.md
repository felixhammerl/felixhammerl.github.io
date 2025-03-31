---
layout: post
title: Per-Client Git Configurations for Consultants
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: In this post, I will show you how to configure git to use different names and emails, and keys for different repositories.
---

# Per-Client Git Configurations for Consultants

Throughtout my career, I've often stumbled across the following problem:

* I use Github for my private projects, using my personal email address, signing commits with my private SSH key. 
* My company uses Github for my company projects, where I author commits with my company email address and sign them with my company SSH key. 
* My clients use Github and Gitlab for client projects, where I author commits with my client email address and sign them with my client SSH key. 
* My private SSH keys are not authorized for the client Github repositories. 
* All my SSH keys are on my Yubikey, and I don't want to switch keys all the time.

## Default configuration

Most folks only ever use a single top-level `~/.gitconfig`. However, git allows you to define multiple configuration files and load them conditionally based on the path of the repository you are working in. 

To get started, I created a default configuration file in `~/.gitconfig`:

```
[user]
    name = Felix Hammerl
    email = <company email>
    signingkey = ~/.ssh/id_ed25519_sk_work

[gpg]
    format = ssh

[commit]
    gpgsign = true

[color]
    ui = true
    branch = auto
    diff = auto
    interactive = auto
    status = auto

[core]
    editor = vim

[push]
    default = simple
      autoSetupRemote = true

[pull]
    rebase = true

[help]
    autocorrect = 0

[init]
    defaultBranch = main
```

Given that this is my company's machine, by default I am using my company identity. 

## My Machine's Folder Structure

In order to use different identities and keys, you need to:

* Split your projects into directories that match the client or project you are working on.
* Initialize empty git repositories in each of these directories. These are never actually used, but they allow you to load the correct configuration file.
* Create additional git configuration files for each client or project you are working on.

```
~/Projects/
    private/
        .git/ <- initialized, but unused
        .gitconfig.private <- personal configuration
        project-a/
            .git/
        project-b/
            .git/
    <company>/
        .git/ <- initialized, but unused
        .gitconfig.<company> <- company-specific configuration
        project-c/
            .git/
        project-d/
            .git/
    <client>/
        .git/ <- initialized, but unused
        .gitconfig.<client> <- client-specific configuration
        project-e/
            .git/
        project-f/
            .git/
```

Please note that the angled brackets `<...>` are placeholders for the actual names, which I will not disclose here for obvious reasons.

## Handling multiple .gitconfig Files

The `private` directory is for my personal projects, the `company` directory is for my company projects, and the `client` directory is for my client projects. Notice that each category has its own `.gitconfig` file. 

Here is a configuration for my personal projects, at `~/.gitconfig.private`:

```
[user]
    name = Felix Hammerl
    email = felix.hammerl@gmail.com
    signingkey = ~/.ssh/id_ed25519_sk_private

[url "git@github-private:"]
    insteadOf = git@github.com:
```

This I have a configuration for a client where I sign my commits with , at `~/.gitconfig.<client>`:

```
[user]
    name = <client identity>
    email = <client email>
    signingkey = ~/.ssh/id_ed25519_sk_<company>

[url "git@github-<client>:"]
    insteadOf = git@github.com:/

[url "git@github-<client>:"]
    insteadOf = https://github.com/
```

What I am doing here is instruct git which SSH key to use for signing and I am rewriting the host names so that I can use different SSH keys for the same Github host.

So now let's conditionally load these configurations:

* Add the `includeIf` lines to your `~/.gitconfig` file, matching the paths of the directories containing the empty repositories. 
* Specify the path to the corresponding configuration file for each directory.
* Within the client directories we created per client, clone the actual repositories you are working on as you normally would.

Here is how this looks at the end of my `~/.gitconfig` file:

```
[includeIf "gitdir:~/Projects/private/"]
    path = ~/Projects/private/.gitconfig.private

[includeIf "gitdir:~/Projects/<client>/"]
    path = ~/Projects/<client>/.gitconfig.<client>
```

Also, please do not forget the trailing slash in the path!

## SSH Configuration

Here is where it gets interesting. How do you differentiate which SSH key to use for the same host (Github), where some keys have access to the client Github Enterprise, while others do not?

```
Host github-private
    HostName github.com
    IdentityFile ~/.ssh/id_ed25519_sk_private
    IdentitiesOnly yes
    IdentityAgent none

Host github-<client>
    HostName github.com
    IdentityFile ~/.ssh/id_ed25519_sk_<client>
    IdentitiesOnly yes
    IdentityAgent none

Host *
    IdentityFile ~/.ssh/id_ed25519_sk_<company>
    IdentitiesOnly yes
    IdentityAgent none

```

When I `git clone` a repositoy from the client, `git clone/pull/push/...` git rewrites replaces the hostname `github.com` with `github-<client>` as instructed in the client-specific .gitconfig file, and uses the corresponding SSH key.

In case you wonder why I am using `IdentitiesOnly yes` and `IdentityAgent none`: I am using a Yubikey to store my SSH keys, so if you don't set `IdentityAgent none`, you will not get the prompt `Confirm user presence for key` when pushing, which can be annoying. I am not sure where this bug originates from, but it is a known issue. Also, you will not ever need the SSH Agent when using Github.

## Multiple SSH Keys on a Yubikey

Now some of you might ask: "But my Yubikey can only store a single SSH resident key, how do you manage to use multiple keys?"

The solution is to use different scopes for the keys, like so:

* To create my personal key: `ssh-keygen -t ed25519-sk -O resident -O application=ssh:private -C "felix.hammerl@gmail.com" -f ~/.ssh/id_ed25519_sk_private`
* To create my company key: `ssh-keygen -t ed25519-sk -O resident -O application=ssh:<company> -C "<company email>" -f ~/.ssh/id_ed25519_sk_<company>`
* To create my client key: `ssh-keygen -t ed25519-sk -O resident -O application=ssh:<client> -C "<client email>" -f ~/.ssh/id_ed25519_sk_<client>`

This way, the Yubikey will hold the SSH keys without conflict and SSH discovers them correctly.

## Gotchas

```
[url "git@github.com:"]
    insteadOf = https://github.com/
```

If you think of putting a global `https` to `ssh` rewriting rule into your global `.gitconfig`, you will break Homebrew. Rather do it on a per-folder basis as I showed above.

## Conclusion

Et voilà! You can now work on different projects with different identities, without having to worry about accidentally using the wrong identity or the wrong key to push a commit. 

