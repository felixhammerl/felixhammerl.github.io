---
layout: post
title: Using gopass for Secrets Management, Infrastructure Automation, and Continuous Deployment
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: Handling secrets plagues many teams. Most fail to avoid plain-text repos and have to rely on Talisman and other faulty tools. gopass offers a better way.
---

Today we'll take a look at gopass (see: [Github](https://github.com/gopasspw/gopass)), a GnuPG-based secrets manager that makes handling secrets suck a little less.

Secrets management is a topic that plagues developers since the dawn of time. I strongly advocate for zero-secrets repositories, i.e. repositories that over their entire lifetime will never see any plaintext secret, not even in the uncommitted working copy on a developer machine. In this post, we'll expore ways to achieve this, going from handling secrets, to ways of injecting them in code and infrastructure. 

# Pre-Flight Checklist

First, you will need a working GnuPG setup. You can create a key with `gpg --generate-key` or `gpg --full-generate-key`, depending on how much you want to customize your key. There are tons of tutorials out there, so we'll not focus on this now. The important thing is that you know how to export and import PGP public keys with GnuPG. When you've generated the key, either grab the key ID from the key generation dialog, or use `gpg --list-keys` to figure out the ID. Here's mine, just remember that yours will look slightly different.

```
➜  ~ gpg --list-keys
/Users/fhammerl/.gnupg/pubring.kbx
----------------------------------
pub   rsa4096/0x7859E6520888D02E 2022-08-29 [C]
      Key fingerprint = 71CB 1FD6 6575 1F5F B702  95C0 7859 E652 0888 D02E
uid                   [ultimate] Felix Hammerl <felix.hammerl@gmail.com>
uid                   [ultimate] Felix Hammerl <fhammerl@thoughtworks.com>
sub   rsa4096/0x9217B39EA2E87593 2022-08-29 [S]
sub   rsa4096/0x2655082C1BB84D68 2022-08-29 [E]
sub   rsa4096/0x847F20CFE317902F 2022-08-29 [A]
```

You want the content next to `pub`, in my case it is `0x7859E6520888D02E`. Depending on your GnuPG config, your ID might be shorter and it might miss the `0x`. Now that we have the ID, here is how you export your key (or more precisely your PGP public key) from GnuPG in the ASCII-armored format:

```
gpg --export --armor <KEY ID> > mykey.pub.asc
```

You will need to export your public key if a teammate wants to add you to a secrets store. As a next step, let's assume someone on your team wants you to add them to the secrets store and so they sent you their public key. Here is how you add someone else's PGP key and make the key available for gopass:

```
gpg --import < otherkey.pub.asc
gpg --list-keys
```

That's it in terms of basics, now let's go(pass).

# Setting up gopass for yourself

First, you'll set up your root secrets store. This is your personal secrets store, typically used for anything you're not planning to share with others. I don't put into git, as I don't store anything in the root store. Should you actually want to use your root secrets store, you can add a git remote to it even at a later point. 

Whenever you set up a secrets store, gopass will ask you which email address it should use for commits. In this case, I will use my personal email address.

```
➜  ~ gopass setup

   __     _    _ _      _ _   ___   ___
 /'_ '\ /'_'\ ( '_'\  /'_' )/',__)/',__)
( (_) |( (_) )| (_) )( (_| |\__, \\__, \
'\__  |'\___/'| ,__/''\__,_)(____/(____/
( )_) |       | |
 \___/'       (_)

🌟 Welcome to gopass!
🌟 Initializing a new password store ...
🌟 Configuring your password store ...
🎮 Please select a private key for encrypting secrets:
[0] gpg - 0x7859E6520888D02E - Felix Hammerl <felix.hammerl@gmail.com>
[1] gpg - 0xF9CA7755347E6586 - gopass-terraform-example <gopass-terraform-example@github>
Please enter the number of a key (0-1, [q]uit) (q to abort) [0]: 0
Please enter an email address for password store git config []: felix.hammerl@gmail.com
❓ Do you want to add a git remote? [y/N/q]: n
✅ Configuration written
```
In my case, I have more than one PGP key in my keychain, hence gopass asks which one to choose. Cool, now we have something to work with. Let's see what's in there:

```
➜  ~ gopass ls
gopass
```

As you can see, and to no one's surprise, the store is empty. If you have any questions about how to use the tool, use the `-h` or `--help` CLI flag. `gopass -h` will tell you about the general usage and `gopass <COMMAND> -h` will help you with the specific command. 

Now that we have gopass initialized, let's go into our first scenario.


# Adding your team's existing secrets store to your gopass

Assume you've joined a team that is using gopass, and you want to add the team's shared secrets store on your machine. You'll have to instruct gopass to clone a secrets store from a git remote and give it some name locally. In my case, the secrets store is called `test-gopass-1`, with a git remote of the same name. Please note that the git remote and the secrets store can be named differently.

```
➜  ~ gopass clone git@github.com:felixhammerl/test-gopass-1.git test-gopass-1

   __     _    _ _      _ _   ___   ___
 /'_ '\ /'_'\ ( '_'\  /'_' )/',__)/',__)
( (_) |( (_) )| (_) )( (_| |\__, \\__, \
'\__  |'\___/'| ,__/''\__,_)(____/(____/
( )_) |       | |
 \___/'       (_)

🌟 Welcome to gopass!
🌟 Cloning an existing password store from "git@github.com:felixhammerl/test-gopass-1.git" ...
⚠ Cloning gitfs repository "git@github.com:felixhammerl/test-gopass-1.git" to "/Users/fhammerl/.local/share/gopass/stores/test-gopass-1" ...
Git Email not set
⚠ Failed to commit .gitattributes to git
git configured at /Users/fhammerl/.local/share/gopass/stores/test-gopass-1
Mounted password store /Users/fhammerl/.local/share/gopass/stores/test-gopass-1 at mount point `test-gopass-1` ...
⚠ Configuring gitfs repository ...
🎩 Gathering information for the git repository ...
🚶 What is your name? [fhammerl]: Felix Hammerl
📧 What is your email? []: felix.hammerl@gmail.com
⚠ Failed to commit .gitattributes to git
Your password store is ready to use! Have a look around: `gopass list test-gopass-1`

⚠ Found valid decryption keys. You can now decrypt your passwords.
```

Alright, let's see what we have:

```
➜  ~ gopass ls
gopass
└── test-gopass-1 (/Users/fhammerl/.local/share/gopass/stores/test-gopass-1)
    └── dev/
        └── asdasd
```

We can see that we have a secret in there called `dev/asdasd`, so let's see if we can access it. When accessing secrets, always remember to prepend the store's name:

```
➜  ~ gopass show test-gopass-1/dev/asdasd
Secret: test-gopass-1/dev/asdasd

asdasd
```

Please keep in mind that the gopass documentation offers [an alternative way to achieve this](https://github.com/gopasspw/gopass/blob/master/docs/setup.md#batch-bootstrapping) via `gopass setuo`. This setup will fail if you wish to work with multiple stores, but it is a viable option for your CD pipeline, as we'll see later.


Sweet! We're all set here! For the next part, let's assume that you want to create a secrets store for your team and share it with them.

# Creating a new secrets store for your team

Here we'll start with a blank git repository which we would like to use for our store called `test-gopass-2`. In gopass, you need to create the store first and then add a remote to it. Here's how you create the store:

```
➜  ~ gopass init --store test-gopass-2
🍭 Initializing a new password store ...
❌ Store is already initialized!
🔑 Searching for usable private Keys ...
⚠ Hint: Use 'gopass init <subkey> to use subkeys!'
✅ Wrote recipients to .gpg-id
Please enter an email address for password store git config []: felix.hammerl@gmail.com
git initialized at /Users/fhammerl/.local/share/gopass/stores/test-gopass-2
git configured at /Users/fhammerl/.local/share/gopass/stores/test-gopass-2
Initialized gitfs repository (gitfs) for fhammerl / ...
🏁 Password store /Users/fhammerl/.local/share/gopass/stores/test-gopass-2 initialized for:
📩 0x7859E6520888D02E - Felix Hammerl <felix.hammerl@gmail.com>
```

Alright, we now have a secrets store, let's add the empty git repository to it.

```
➜  ~ gopass git --store test-gopass-2 remote add origin git@github.com:felixhammerl/test-gopass-2.git
⚠ Running 'git remote add origin git@github.com:felixhammerl/test-gopass-2.git' in /Users/fhammerl/.local/share/gopass/stores/test-gopass-2...
```

Let's check what is happening in git in the background:

```
➜  ~ gopass git --store test-gopass-2 status
⚠ Running 'git status' in /Users/fhammerl/.local/share/gopass/stores/test-gopass-2...
On branch master
nothing to commit, working tree clean
```

As we can see, gopass has created a `master` branch and done its basic configuration. `master` is still the default behavior in `git` and gopass, but if you'd like to use `main` instead, you can do that. Please keep in mind that this is completely optional! If you plan on leaving git with `master`, please skip the next three commands. Here's how you move to `main`:

```
➜  ~ gopass git --store test-gopass-2 branch -M main
⚠ Running 'git branch -M main' in /Users/fhammerl/.local/share/gopass/stores/test-gopass-2...
```

Nice! What you can see here is that gopass is using `git` quite transparently. This also means that you can leverage git branches, if you feel so adventurous. I'd stay away from it, but I'm not your supervisor.

```
➜  ~ gopass git --store test-gopass-2 status
⚠ Running 'git status' in /Users/fhammerl/.local/share/gopass/stores/test-gopass-2...
On branch main
nothing to commit, working tree clean
```

And that's how you move to `main`. 

Now let's add someone to our secrets store. The first step is to import your coworker's key into your GnuPG keyring, as I've mentioned in the beginning of the article. You can only add folks to your secrets store if you have import their key to GnuPG, so do that first. In order to make sure everyone in your team can import the necessary PGP keys for a secrets store, make sure to set `core.exportkeys` to `true` *on the store*. This way, you won't have to worry about keeping the public keys around elsewhere. Any setting on the store level is shared through git with your coworkers.

```
➜  ~ gopass config --store test-gopass-2 core.exportkeys true
true
```

With that out of the way, I'll add Fred Foo to our gopass secrets store:

```
➜  ~ gopass recipients add --store test-gopass-2 0xCAFECAFECAFECAFE
Do you want to add "0xCAFECAFECAFECAFE - Fred Foo <fred.foo@example.com>" (key "0xCAFECAFECAFECAFE") as a recipient to the store "test-gopass-2"? [y/N/q]: y
Reencrypting existing secrets. This may take some time ...
Starting reencrypt


Added 1 recipients
You need to run 'gopass sync' to push these changes
```

Alright, now Fred has been added to the secrets store. At the moment, there is nothing in there. Had there been something in there, gopass would have re-encrypted every item in the `test-gopass-2` store in order to make it accessible to Fred.

But now let's add a secret called `prod/asdasd`:

```
➜  ~ gopass insert test-gopass-2/prod/asdasd
Enter password for test-gopass-2/prod/asdasd:
Retype password for test-gopass-2/prod/asdasd:
```

As we can see, this is how our secrets stored look now:

```
➜  ~ gopass ls
gopass
├── test-gopass-1 (/Users/fhammerl/.local/share/gopass/stores/test-gopass-1)
│   └── dev/
│       └── asdasd
└── test-gopass-2 (/Users/fhammerl/.local/share/gopass/stores/test-gopass-2)
    └── prod/
        └── asdasd
```

Let's sync everything so that our team can see our changes.

```
➜  ~ gopass sync
🚥 Syncing with all remotes ...
[<root>]
   gitfs pull and push ... Skipped (no remote)
[test-gopass-1]
   gitfs pull and push ... OK (no changes)
   done
[test-gopass-2]
   gitfs pull and push ... ⚠ Failed to pull before git push: exit status 1: fatal: couldn't find remote ref main
OK (no changes)
   done
✅ All done
```

Something interesting happens when you have a fresh git repository like `test-gopass-2` in our case. As usual when using git, gopass pulls first, before pushing your changes. Since there is no `main` on the repository yet, it can't pull. `main` will only be created after you'll push. This is expected and not an error. As we can see, this does not happen on the second sync:

```
➜  ~ gopass sync
🚥 Syncing with all remotes ...
[<root>]
   gitfs pull and push ... Skipped (no remote)
[test-gopass-1]
   gitfs pull and push ... OK (no changes)
   done
[test-gopass-2]
   gitfs pull and push ... OK (no changes)
   done
✅ All done
```

Alright, now we have the basic usage down. 

For anything more advanced, e.g. adding binary files, using gopass for 2FA, etc., I recommend reading through [the official feature documentation](https://github.com/gopasspw/gopass/blob/master/docs/features.md). 

# Infrastructure Automation

The most practical use of gopass is the ability to create secrets in Terraform without the plaintext ever touching your disk. To this end, I use the `external` provider, but there are other options like [terraform-provider-pass](https://github.com/camptocamp/terraform-provider-pass). The charm in using `external` is that it does not require an additional build step. Here's how you can use the `external` provider to create a secret: We need to put our secrets into a JSON object and pipe it into the `external` provider. We used `jq` to create a JSON object and fill it with values from gopass. It is important to note that the `external` provider reads *all of the data passed to it via stdin*, and parses it as a *JSON object*. The JSON object *must* contain the contents of the query arguments and its values *must* be strings.

```
#!/usr/bin/env bash

jq -n \
    --arg asd "$(gopass show -o "test-gopass-1/dev/asd")" \
    '{
        "asd": $asd
    }'

```

When using `jq` in this way, please make sure the `--arg` arguments only use underscores, as dashes or other special characters will cause `jq` to go haywire. Also, you can obviously retrieve more than just a single secret from gopass, just add `--arg` and properties to the JSON object accordingly. 

Let's call the script `fetch-secrets.sh` and place it alongside our Terraform code. We'll invoke it from Terraform and put the contents into encrypted AWS SSM parameters:

```
provider "aws" {
  region = "us-east-1"
}

data "external" "secrets" {
  program = ["${path.module}/fetch-secrets.sh"]
}

resource "aws_ssm_parameter" "asd" {
  name  = "asd"
  type  = "SecureString"
  value = data.external.secrets.result.asd
}
```

That's it, no additional overhead necessary! Now configure your AWS credentials and run `terraform plan` to see what the script generates. You can also parameterize the gopass secrets path as you see fit.

Please note that **this is not foolproof** and that there is a **big gotcha** to this. Any value that gets ingested through `external` provider will become part of the Terraform state. [Sensitive Data in Terraform state makes the state as sensitive as the secret itself](https://developer.hashicorp.com/terraform/language/state/sensitive-data). Local state is stored in plain-text JSON files, hence you need to be careful how this state is handled, especially in a git repository. Remote state, however, may be encrypted at rest. Please make sure that your backend is configured to this end. The documentation suggests to use the S3 backend, which supports encryption at rest through the `aws_s3_bucket_server_side_encryption_configuration` resource together with appropriate IAM policies and logging to block encryption key access or identify any invalid access. It is wise to not use the default S3 KMS key for this bucket.

# Continuous Deployment via Github Actions

To wrap this up, let's have a look at how we would use this in a CD pipeline. We'll use Github Actions for this purpose. First, we need to create a dedicated PGP key for Github that needs to be added as a secret to Github Actions. Then, we need to install GnuPG and gopass in the workflow. Lastly, we need to configure gopass and add the secrets store.

Generate a GPG key as you're used to and give it a distinctive name for your pipeline. In my case, I have used the name `gopass-terraform-example` and the email address `gopass-terraform-example@github`. We will use these later.

Furthermore, as gopass will be retrieving the secrets store via `git clone` from another repository, you will need to provide a [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) to the pipeline. Please consult the [Github Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) for how to generate such a token.

I usually choose to have a secrets store *per service*. This means that I will only ever use a single secrets store in a pipeline. For this reason, I can use shortcut in `gopass setup`, as described [in the gopass documentation](https://github.com/gopasspw/gopass/blob/master/docs/setup.md#batch-bootstrapping). If you need to use multiple stores, you need to fall back to doing a single `gopass setup` and multiple `gopass clone` operations for each store.

Once this is done, create two Github Actions secrets:

- `PERSONAL_ACCESS_TOKEN`: As mentioned above, this will be used to check out the secrets store repository.
- `PGP_KEY`: This is the ASCII armored PGP key, exported via `gpg --export-secret-keys --armor <KEY ID>`.

If you feel like it, you can also read the contents of the `--name` and `--email` arguments from environment variables, which is particularly useful if you plan to share this pipeline with other services.

```
name: Pipeline
on: [push, workflow_dispatch]

jobs:
  deploy-dev:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    env:
      STAGE: dev

    steps:
      - name: Check out repository code
        uses: actions/checkout@v2

      - name: Import GPG key
        run: echo "${{ secrets.PGP_KEY }}" | gpg --import

      - name: Install gopass
        run: wget https://github.com/gopasspw/gopass/releases/download/v1.15.8/gopass_1.15.8_linux_amd64.deb && sudo dpkg -i gopass_1.15.8_linux_amd64.deb

      - name: Initialize gopass
        run: |
          gopass --yes setup \
          --remote https://${{ secrets.PERSONAL_ACCESS_TOKEN }}@github.com/felixhammerl/test-gopass-1.git \
          --alias test-gopass-1 \
          --name "gopass-terraform-example" \
          --email "gopass-terraform-example@github"
```

Unfortunately, this is not fire-and-forget, so it would be wise to regularly update the gopass version you are using in the pipeline.

That's it, now you can use gopass in the Terraform setup above and create secrets in AWS without ever having to deal with plaintext secrets!

# Gotchas

gopass handles all secrets stores in your home folder, as opposed to your current directory. The two folders relevant here are `~/.config/gopass` and `~/.local/share/gopass`. Any secrets stores are here:

```
➜  ~ ls ~/.local/share/gopass/stores
total 0
drwx------  6 fhammerl  staff   192B Apr 24 18:26 root/
drwx------  6 fhammerl  staff   192B Apr 24 18:28 test-gopass-1/
drwx------  6 fhammerl  staff   192B Apr 24 18:31 test-gopass-2/
```

In this case, I have the `root` secrets store, as well as `test-gopass-1` and `test-gopass-2`. You can change the location with `PASSWORD_STORE_DIR`, but I would not advise to do that, here's why: Once any gopass command has been run, the store location configuration has been written to `~/.config/gopass/config`. Changing the `PASSWORD_STORE_DIR` variable after this will have *no effect*. The default behavior is good enough.

When using gopass in Github Actions, I noticed a strange behavior: Despite having the key imported in `gpg`, it would claim to not be able to find the key in the keyring and generate an ad hoc PGP key for you. A `gopass show` still works and it does not impact anything, it's just strange behavior. As I do not understand whay causes this, [I have opened an issue with the maintainer](https://github.com/gopasspw/gopass/issues/2872). Please note that `gopass clone` in these cases will fail to generate a key if it does not have a name and an email address, which it usually pulls from your git configuration. In order to allow `gopass clone` to generate a throwaway key as a workaround, you can ...

- Set `GIT_AUTHOR_NAME` and `GIT_AUTHOR_EMAIL`, or
- Run `git config --global user.name "Your Name"` and `git config --global user.email "youremail@yourdomain.com"`

... before you run `gopass clone`.

If there are any new developments in [the issue](https://github.com/gopasspw/gopass/issues/2872), I will update this post.
