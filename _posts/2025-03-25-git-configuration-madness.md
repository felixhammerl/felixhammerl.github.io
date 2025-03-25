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

* I use Github for my private projects, using my personal email address, signing commits with my personal PGP key. 
* My company uses Github for my company projects, where I author commits with my work email address and sign them with a work PGP key. 
* My clients use Github and Gitlab for client projects, where I author commits with my client email address and sign them with my client SSH key. 
* My private SSH keys are not authorized for the client Github repositories. 
* My private and work PGP keys for signing and SSH Keys for authentication are on my Yubikeys. The client SSH keys for signing and authentication are in a client-specific 1Password vault. While the keys being provided by different means (1PW, PGP, SSH) is not important, it's just a further complication.

Most folks only ever use a single top-level `~/.gitconfig`. However, git allows you to define multiple configuration files and load them conditionally based on the path of the repository you are working in. 

To get started, I created a default configuration file in `~/.gitconfig`:

```
[user]
    name = Felix Hammerl
    email = <my work email>
    signingkey = 7859E6520888D02E
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
[commit]
    gpgsign = true
[init]
	defaultBranch = main
```

Given that this is my work machine, by default I am using my work identity for all commits. However, I also have a personal configuration file at `~/.gitconfig.private`:

```
[user]
    name = Felix Hammerl
    email = felix.hammerl@gmail.com
    signingkey = 7859E6520888D02E
```

The keen reader will have noticed that I am using the same GPG key for work and private, and you are correct. But that's just coincidence. You can use different keys if you want to.

This I have a configuration for a client where I sign my commits with , at `~/.gitconfig.<client>`:

```
[user]
    name = <client idenity>
    email = <client email>
    signingkey = <client ssh key>

[gpg]
    format = ssh

[gpg "ssh"]
    program = "/Applications/1Password.app/Contents/MacOS/op-ssh-sign"

[commit]
    gpgsign = true
```

So now let's conditionally load this configuration:

* Create additional configuration files for each client or project you are working on.
* Split your projects into directories that match the client or project you are working on.
* Create empty git repositories in each of these directories. These are never actually used, but they allow you to load the correct configuration file.
* Add the `includeIf` lines to your `~/.gitconfig` file, matching the paths of the client directories containing the empty repositories. 
* Within the client directories we created per client, clone the actual repositories you are working on as you normally would.

So the directory structure looks like this:
```
~/Projects/
    private/
        .git/ <- initialized, but unused
        project-a/
            .git/
        project-b/
            .git/
    <work>/
        .git/ <- initialized, but unused
        project-c/
            .git/
        project-d/
            .git/
    <client>/
        .git/ <- initialized, but unused
        project-e/
            .git/
        project-f/
            .git/
```

Let's add the following parts to the `~/.gitconfig` file:

```
[includeIf "gitdir:~/Projects/private/"]
    path = ~/.gitconfig.private
[includeIf "gitdir:~/Projects/<client>/"]
    path = ~/.gitconfig.<client>
```

Please note that the angled brackets `<...>` are placeholders for the actual names, which I will not disclose here for obvious reasons. Also, please do not forget the trailing slash in the path!

Here is where it gets interesting. How do you differentiate which SSH key to use for the same host (Github), where some keys have access to the client Github Enterprise, while others do not?

```
Host github.com
    IdentityFile ~/.ssh/<yubikey 1>
    IdentityFile ~/.ssh/<yubikey 2>
    IdentityFile ~/.ssh/<yubikey 3>
    IdentitiesOnly yes
    IdentityAgent none

Host <client gitlab>
    IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"

Host githubclient
    HostName github.com
    IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"
```

When I `git clone` a repositoy from the client, I just have to replace the hostname `github.com` with `githubclient`, and the SSH agent will automatically use the 1Password agent with the proper key to authenticate me instead of my Yubikey-bound keys.

This way, you can use different SSH keys for different clients, on the same or different hosts. Please note that this is in no way bound to using 1Password. You can use any SSH agent you like, or even no agent at all, with any key you like.

Et voilà! You can now work on different projects with different identities, without having to worry about accidentally using the wrong identity for a commit. 
