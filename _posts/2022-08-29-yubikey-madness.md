---
layout: post
title: Yubikey Madness
authors:
  - name: Felix Hammerl
    link: https://twitter.com/felixhammerl
excerpt: How to take full advantage of your yubikey... all the way down the rabbit hole.
---

So this one is for the folks who bought a Yubikey based on slightly overenthusiastic recommendations of friends or colleagues. And most likely you've taken the key out of the enclosure and wondered: What am I supposed to do with this now?!

Assumptions for beginners:

* You're somewhat technical. Not full blown tin floil hat, but you're interested. 

That's it. *If* you wanna dive deeper as the post goes on, I will assume:

* You're on macOS on Apple Silicon architecture. Other operating systems have slightly different setups. Paths are different between Apple Silicon and Intel Macs.
* You use [homebrew](https://brew.sh/).
* You have at least two Yubikey 5.

At the end of this post, you can ...

* Log into websites with passwords and touching your Yubikey
* Log into websites with passwords and a six-digit passcode that changes every 30 seconds
* Log into websites without passwords using *only* your Yubikey
* Log into macOS with your Yubikey
* Lock your Mac when pulling off the Yubikey
* Control what happens when you touch the Yubikey
* Connect to remote servers with SSH keys stored in your Yubikey
* En-/Decrypt mail in Gmail with PGP keys stored in your Yubikey

The instructions get incrementally more challenging with each point, so if you wanna leave step off the ride somewhere in between, that's cool. Ok, let's go.

# Log into websites with passwords and touching your Yubikey

Here's what most of you will start their journey into the land of the Yubikey with: You use the Yubikey as a second factor to make your email account more secure. This is a great start, because using a Yubikey in this way makes it impossible for someone who does not physically possess the Yubikey to hack your account.

In a world without security tokens, you're relying on your password alone to keep you secure. The problem is that humans are notoriously bad at choosing *and remembering* strong passwords. Also, it does not help that there are deeply ingrained misconceptions and bad practices about what makes [a strong password a strong password](https://xkcd.com/936/), e.g. monthly password rotations, enforcing complicated characters. This resulted in most people either working around those rules or having passwords that are hard to remember, but easy to guess, where passwords instead should be easy to remember and hard to guess.

Some of you will wonder why it is called second-factor or multi-factor authentication. This is because in information security, we use different *factors* to *authenticate* your identity, i.e. to check if you are who you claim to be. These factors are:

* Something you know: A password, passphrase, PIN, or security question that exists only in your head because you have memorized it.
* Something you have: A single-use token you received by SMS, a keycard, an RSA token, or a smartcard that you physically possess.
* Something you are: Your fingerprint, retina scan, facial features, veins in your palm, your pulse patterns, or other biometric properties.
* Something you do: How you type, breathe, walk, look, as well as where you are, when you are where you are, or other patterns you exhibit.

Any combination of these factors is called *multi-factor authentication* (MFA). MFA helps keep your online identity safe from attackers, because it is hard to attack all of these factors simultaneously and even if one fails, the other factors can compensate. A strong, unique, memorable password is always a good basis, so is using a password manager to avoid having to remember them all. But a second factor provides you with the peace of mind that unless someone has hacked your password **and** is in possession of your Yubikey, they can't sign in. Quite hard to steal a Yubikey when it is in your hand.

This, however, throws up another challenge: To prove that you are who you are, *you* need to be in possession of the Yubikey *at all times*. Forgetting or losing the Yubikey at home is a good way to lock you out of your services. I personally solve this problem by having *three* Yubikeys:

* A Yubikey acting as a backup stored in a safe place.
* A Yubikey that permanently resides in a safe place in my office.
* A Yubikey that is on a chain around my neck when I am travelling.

It is easy to misplace your Yubikeys, especially when you are on the road. Many folks attach the Yubikey to their keyring for this reason, which I personally find impractical as I tend to not have the keyring on my person when I am on the road. A chain makes it easy to pull the Yubikey off the machine and having it around my neck solves the problem of where to put it adequately.

Either way, check whether the services you use in your daily life offer the option to enroll a security key. All mainstream browsers (Chrome, Safari, and Firefox) support security keys via USB and NFC, which makes it practical for mobile use, too.

# Log into websites with passwords and a six-digit passcode that changes every 30 seconds

Not all services offer the option to enroll security keys like the Yubikey, but many of them offer an option for *authenticators* like [Google Authenticator](https://googleauthenticator.net/) or [Authy](https://authy.com/). These authenticators create a 6-digit code that changes every 30 seconds. Upon login, a service will prompt you for the code your authenticator currently displays, also called *One-Time Passcode* (OTP). The workflow is that you're presented with a *seed* that is encoded in a QR code. Using the current time and a cryptographic function, the seed is transformed into the six-digit passcode. The seed is a *secret* that is shared between you and the service and once it is stored safely in the app, is being discarded. After the enrollment, the seed should not be recoverable. This way we ensure that the seed is not *something you know*, but *something you have*. 

Yubikeys support OTPs through the [Yubico Authenticator](https://www.yubico.com/products/yubico-authenticator/) application, which exists for your all mainstream operating systems (Windows, Linux, macOS, Android, iOS). Simply follow the instructions in the app to create accounts. The Yubico Authenticator works via USB and NFC, which makes it practical for most smartphones.

In order to avoid shooting yourself in the foot, *always keep the same seeds on both Yubikeys*. If you change a seed on one, change it on both. If you add a seed on one, add it on the other as well. Also note that the seed, once stored, *can not be retrieved from the Yubikey*. There is no physical way to read the seed from the Yubikey. You can *read the resulting OTP*, and you can *overwrite or delete the seed*, but you *can't extract* the original seed from the Yubikey. The way you can avoid having your Yubikeys go out of sync is to *always* enroll both Yubikeys before continuing the authenticator enrollment flow. These enrollment flows make sure that you've stored the seed correctly by prompting you to enter the current OTP. Get both Yubikeys, set them both up, make sure they display the same OTP, then enter the OTP to complete the enrollment. Should you not have the other key at hand, write down or store the seed until you're able to set the other Yubikey up and then discard the note safely.

# Log into websites without passwords using *only* your Yubikey

Some websites allow a *passwordless* login using only your Yubikey. Instead of a password, public-key cryptography is employed to assert your identity. Don't worry, it's quite straight forward: Plug in the key, tap it, and you're signed in.

This is made possible by the FIDO2 standard and the WebAuthn API in your browser. What happens is that a certificate will be generated *on your Yubikey* whose *public* portion is provided to the service you're signing up for, while the secret portion remains exclusively on your Yubikey. Upon signin, the service will ask your Yubikey for a cryptographic signature, which can only be *created* by the *secret portion* of the certificate, and can be *validated* using the *public portion* of the certificate, which has been shared to the service during enrollment.

At this point, not many websites support it. But it's quite practical on those websites that do. Just remember, as always: No signing in without the Yubikey.

# Log into macOS with your Yubikey

Most modern operating systems support login via smartcard, and so does macOS. Smartcards look like credit cards with a chip. They carry a certificate, which is unlocked through a PIN code that you enter when you sign into your account. The good news is that your Yubikey can act as a smartcard. Instead of asking you for your long and complex password, you can sign into your user account with a six-digit PIN when your Yubikey is connected. If you are frequently working with your Mac with the lid closed or TouchID being otherwise not available, this will make your life easier.

This is done through the PIV applet on your Yubikey. To access it, please download the [Yubikey Manager](https://www.yubico.com/support/download/yubikey-manager/). With the Yubikey connected, open the Yubikey Manager and navigate to Applications > PIV. There, you will have to set up the PIN and the PUK. The default PIN is `123456` and the default PUK is `12345678`. The certificate stored in the PIV applet is locked if you enter the wrong PIN three times. The PUK unlocks that. It is pretty similar to your SIM card, another type of smartcard. Anyway, once you have set up the PIN, hit `Back` and then click `Setup for macOS`, which will guide you through the rest of the process. 

Please note that your Yubikey has *three different PINs*, for PIV, FIDO2, and PGP, respectively. More on FIDO2 and PGP later.

If you're frequently working in the console, there is another really cool feature: You can use your Yubikey's PIV applet for `sudo`. To do that, edit `/etc/pam.d/sudo` to look like this:

```
> cat /etc/pam.d/sudo
# sudo: auth account password session
auth       sufficient     pam_tid.so
auth       sufficient     pam_smartcard.so
auth       required       pam_opendirectory.so
account    required       pam_permit.so
password   required       pam_deny.so
session    required       pam_permit.so
```

The `pam_smartcard.so` allows you to authenticate a `sudo` command with the PIN when your Yubikey is plugged in. If you're wondering what `pam_tid.so` is: It allows you to `sudo` via TouchID.

# Lock your Mac when pulling off the Yubikey

I have written a tiny [helper](https://github.com/felixhammerl/lockscreen) that helps enforce two good practices:

* Don't leave your computer unattended and unlocked.
* Don't leave your Yubikey lying around.

It does so by locking your computer when you pull off the Yubikey. Since I wear the Yubikey on a chain around my neck when I am on the road, this helps me maintain a good security posture on the road.

To set up my [lockscreen](https://github.com/felixhammerl/lockscreen) utility, just `git clone` the repository and then run `make install` on it. In case you need to install the development tools for macOS, you will see instructions in the terminal.

# Control what happens when you touch the Yubikey

If you're new to using the Yubikey, it is highly likely that you've touched it accidentally and then entered some weird combination of characters into a text field. The Yubikey's behavior when you touch the golden disk is controlled by the `OTP` applet. In the Yubikey Manager, go to Applications > OTP. You will see that your Yubikey has two triggers: A short press and a long press. The first thing we'll do is *delete* both settings to stop the annoying string of random characters pouring out of the Yubikey.

With that being done, we can choose four different things behaviors, but for me there is one favorite in terms of practicality: Static password. Let me explain why it is practical. I mostly use my Mac with the lid closed, which means TouchID is unavailable. I also use 1Password, which heavily leverages TouchID. I also have a looooong vault passphrase for 1Password. If I had to fully type that every time I open 1Password, I'd be quite thoroughly annoyed. Hence, my Yubikey contains a part of the passphrase to help me keep my sanity. Just don't put the *entire* passphrase into the static password slot. I typically leave short touch unassigned.

Please note: If you're thinking about using this function to enter the password of your Mac, you will be tricked. For some reason, macOS will not allow you to enter the password in this way in the pre-boot prompt when unlocking your FileVault. It will enter it, correctly even, but macOS won't accept it. It works on the post-boot login prompt, but not on the pre-boot prompt. No one knows why that is.

# Connect to remote servers with SSH keys stored in your Yubikey

Alright, way down into the rabbit hole we go. There used to be a time when using the Yubikey for SSH was quite cumbersome and involved using GPG as a cryptographic backend. Luckily, this time is behind us. Since version 8.2, OpenSSH supports FIDO2 keys, which means that you can a) secure the SSH key on your disk with the Yubikey and b) even store the *entire* SSH key on your Yubikey, making it portable. This is possible through FIDO2 resident key, which uses the same mechanism as a passwordless login to a website. 

Please note that Apple chose to compile the macOS-builtin OpenSSH *without support for security keys*, so you'll have to install the proper binary through homebrew: `brew install openssh`. Please make sure to set the `PATH` accordingly: `export PATH=$(brew --prefix)/bin:$PATH`.

Here's what you need to do:

* Set the FIDO2 PIN on the key in the Yubikey Manager in Applications > FIDO2 > Set PIN.
* Open the terminal and run `ssh-keygen -t ecdsa-sk -O resident`
* Use `id_ecdsa_sk.pub` as you would normally.

Yubico's [official instructions can be found here](https://www.yubico.com/blog/github-now-supports-ssh-security-keys/). What a `git pull` through `ssh` looks in practice is:

```
> git pull
Confirm user presence for key ECDSA-SK SHA256:<FINGERPRINT IS HERE>
User presence confirmed
Already up to date.
```

`Confirm user presence for key` prompts you to confirm that you hold the key by tapping the golden disk on your Yubikey.

If you move to a different computer, you need to regenerate the private key stub and the public key on the new computer:

```
> ssh-add -K
> ssh-keygen -K
> mv id_ecdsa_sk_rk ~/.ssh/id_ecdsa_sk
```

Now, there is *one* extra step you will need to do here. The problem is that by default, SSH will only select the keys with the default naming scheme, e.g. `id_ecdsa_sk`. But you can only have *one* of those and you can't have the *same* key on three Yubikeys, as the key is generated on the Yubikey and never leaves it.

So, for your backup Yubikey, here's what you do:

```
> ssh-keygen -t ecdsa-sk -O resident -f id_ecdsa_sk_backup
```

This will generate a second key stub for your backup Yubikey. Repeat for other keys you might have. Since SSH won't discover this by default, you'll have to put this into your SSH configuration:

```
~/.ssh/config

Host *
    IdentitiesOnly Yes #Optional
    IdentityFile ~/.ssh/id_ecdsa_sk
    IdentityFile ~/.ssh/id_ecdsa_sk_backup
```

This way, SSH knows which identities it should try. Here is an example with only the backup Yubikey connected:

```
> ssh -T git@github.com
Confirm user presence for key ECDSA-SK SHA256:CfVjTqE4nnPnycjFDcymwtK87949jkC1sy29XVLlYDA
sign_and_send_pubkey: signing failed for ECDSA-SK "/Users/fhammerl/.ssh/id_ecdsa_sk": device not found
Confirm user presence for key ECDSA-SK SHA256:lpNnp6lh+Pf3Y1D0otvvUyDKrefUbQOd89JyhHR+Mos
User presence confirmed
Hi felixhammerl! You've successfully authenticated, but GitHub does not provide shell access.
```

Again, please note that your Yubikey has *three different PINs*, for PIV, FIDO2, and PGP, respectively. More on PGP in the next section.

# En-/Decrypt mail in Gmail with PGP keys stored in your Yubikey

Let me prefix this entire section by saying that I think PGP needs to end. It is an outdated protocol from another time. That being said, like so many older protocols, it can still come in handy every once in a while.

The Yubikey 5 can hold a 4096 bit RSA key in its PGP applet. Interaction with the PGP applet is done through a smartcard-capable PGP implementation, in our case *GNU Privacy Guard* (GnuPG or GPG).Let me also say that using GPG manually has more rough edges than smooth ones, to put things mildly. Even after years of working with the PGP protocol, I avoid using it directly. But then when some software is using GPG, it is also not a library, but a standalone application! This means that interaction with GPG has to be shoehorned into its text-based interface. But GPG exists and works. So let's see where this dark path takes us.

[drduh](https://github.com/drduh) has built [the definitive guide of all things GPG with Yubikeys](https://github.com/drduh/YubiKey-Guide). You will likely not find a more complete guide for going all out tin foil hat around email encryption. I quote from this guide, but I'll not take it quite to the extreme length he goes to. Let's start by prepping our environment.

* Before going any further, please install GPG and a couple of related tools you will need: `brew install gnupg gpgme pinentry-mac`
* Let's set the `GNUPGHOME` environment variable in your shell (also add it to your shell's configuration, e.g. `.zshrc`): `export GNUPGHOME=~/.gnupg`
* Restart your terminal
* Pull a hardened GPG configuration: `wget -O $GNUPGHOME/gpg.conf https://raw.githubusercontent.com/drduh/config/master/gpg.conf`
* In `$GNUPGHOME/gpg.conf`, please add a `# ` to `throw-keyids` to comment out the line: `# throw-keyids`
* Pull a hardened GPG agent configuration: `wget -O $GNUPGHOME/gpg-agent.conf https://raw.githubusercontent.com/drduh/config/master/gpg-agent.conf`
* In `$GNUPGHOME/gpg-agent.conf`, please remove the `# ` before `pinentry-program /opt/homebrew/bin/pinentry-mac`

Now that we've prepped our environment, let's start by creating the PGP keys. Essentially, we want a "master" key that only serves to provide continuity to your identity, while so-called subkeys do the actual work. The only thing the master key ever does is certify that the subkeys were actually issued by you. Subkeys are rotated frequently, to provide some amount of [forward secrecy](https://en.wikipedia.org/wiki/Forward_secrecy), which is not baked into the PGP protocol. The subkeys are transferred to the Yubikey, the master key is *not*. PGP smartcards have 3 slots: One each for a signature key, an encryption key and an authentication key. This is what we'll use here.

So let's generate the master key:

```
> gpg --expert --full-generate-key
Please select what kind of key you want:
   (1) RSA and RSA
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
   (9) ECC (sign and encrypt) *default*
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (13) Existing key
  (14) Existing key from card
Your selection? 8
```

We're doing a fancy setup, so we're going the custom route.

```

Possible actions for this RSA key: Sign Certify Encrypt Authenticate
Current allowed actions: Sign Certify Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? S
```

We don't need the master key to be able to sign, let's toggle that off.

```

Possible actions for this RSA key: Sign Certify Encrypt Authenticate
Current allowed actions: Certify Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? E
```

We don't need the master key to be able to encrypt, either. Let's toggle that off.

```

Possible actions for this RSA key: Sign Certify Encrypt Authenticate
Current allowed actions: Certify

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? Q
```

That looks good, let's finish the setup.

```
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 0
```

The master key should *not* expire, hence select `0`

```
Key does not expire at all
Is this correct? (y/N) y
```

Yup, that looks right.

```

GnuPG needs to construct a user ID to identify your key.

Real name: Felix Hammerl
Email address: felix.hammerl@gmail.com
Comment:
You selected this USER-ID:
    "Felix Hammerl <felix.hammerl@gmail.com>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
```

Let's confirm. Next, you'll get asked whether you wanna set up a passphrase.

Whether or not you set a passphrase for this key is up to you, althought my recommendation is to set up a good passphrase. If you do, please note down the passphrase in a safe space and keep it handy, as you will need it for the rest of the setup process!

For daily use, you will not need the passphrase of the master key once the key is on your Yubikey.

```
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
gpg: revocation certificate stored as '/Users/fhammerl/.gnupg/openpgp-revocs.d/69B3C01A5E0F87BEBC181C741E2BD87C697C5DDD.rev'
public and secret key created and signed.

pub   rsa4096/0x1E2BD87C697C5DDD 2022-08-30 [C]
      Key fingerprint = 69B3 C01A 5E0F 87BE BC18  1C74 1E2B D87C 697C 5DDD
uid                              Felix Hammerl <felix.hammerl@gmail.com>

```

Cool, so we've created the master key!

```
> export KEYID=0x1E2BD87C697C5DDD
```

For convenience, let's remember the key ID of the master key in an environment variable.

Next, let's add the other email addresses we'd like to use for this key. First, open the master key in edit mode.

```
> gpg --expert --edit-key $KEYID
Secret key is available.

gpg: checking the trustdb
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   2  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 2u
sec  rsa4096/0x1E2BD87C697C5DDD
     created: 2022-08-30  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1). Felix Hammerl <felix.hammerl@gmail.com>

gpg> adduid
```

I have a second email address, so I'll add that.

```
Real name: Felix Hammerl
Email address: felix@example.org
Comment:
You selected this USER-ID:
    "Felix Hammerl <felix@example.org>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? O
```

You, looks good. let's confirm.

```

sec  rsa4096/0x1E2BD87C697C5DDD
     created: 2022-08-30  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1)  Felix Hammerl <felix.hammerl@gmail.com>
[ unknown] (2). Felix Hammerl <felix@example.org>

gpg> uid 1
```

Since the email address we just added is our *secondary* email, we need to tell GPG that we want `uid 1` to be the primary email. Let's select `uid 1` first.

```

sec  rsa4096/0x1E2BD87C697C5DDD
     created: 2022-08-30  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1)* Felix Hammerl <felix.hammerl@gmail.com>
[ unknown] (2). Felix Hammerl <felix@example.org>

gpg> primary

```

Now, let's make it the primary email address.

```
sec  rsa4096/0x1E2BD87C697C5DDD
     created: 2022-08-30  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1)* Felix Hammerl <felix.hammerl@gmail.com>
[ unknown] (2)  Felix Hammerl <felix@example.org>

gpg> save
```

You, looks good. let's save that.

For the remainder, I have the two `uid`s with my email addresses mixed up. Please don't let that confuse you as it has no bearing on what we're doing next.

Ok, so let's add the subkeys. First, open the key in edit mode.

```
> gpg --expert --edit-key $KEYID
Secret key is available.

gpg: checking the trustdb
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   2  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 2u
sec  rsa4096/0x1E2BD87C697C5DDD
     created: 2022-08-30  expires: never       usage: C
     trust: ultimate      validity: ultimate
[ultimate] (1). Felix Hammerl <felix@example.org>
[ultimate] (2)  Felix Hammerl <felix.hammerl@gmail.com>
```

Ok, let's add a key 

```
gpg> addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (12) ECC (encrypt only)
  (13) Existing key
  (14) Existing key from card
Your selection? 4
```

The first key we wanna add is the signing key.

```
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
```

We want all keys to be 4096 bits, so this goes here as well.

```
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0)
```

We don't want this key to expire. You can expire your subkeys, but I'm lazy and I'll only do that when necessary.

```
Key does not expire at all
Is this correct? (y/N) y
Really create? (y/N) y
```

Yup, looks about right. Let's confirm.

```
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  rsa4096/0x1E2BD87C697C5DDD
     created: 2022-08-30  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  rsa4096/0xB800E83563709867
     created: 2022-08-30  expires: never       usage: S
[ultimate] (1). Felix Hammerl <felix@example.org>
[ultimate] (2)  Felix Hammerl <felix.hammerl@gmail.com>
```

As you see, we have added a subkey for signing.

```
gpg> addkey
```

Let's add the subkey for encryption.

```
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (12) ECC (encrypt only)
  (13) Existing key
  (14) Existing key from card
Your selection? 6
```

Yes, an RSA key for encryption.

```
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
```

Again, 4096 bits.

```
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0)
```

Don't expire the key. See my comment regarding expiration above.

```
Key does not expire at all
Is this correct? (y/N) y
Really create? (y/N) y
```

Yup, looks about right. Let's confirm.

```
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  rsa4096/0x1E2BD87C697C5DDD
     created: 2022-08-30  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  rsa4096/0xB800E83563709867
     created: 2022-08-30  expires: never       usage: S
ssb  rsa4096/0x460AAFECD0F316C1
     created: 2022-08-30  expires: never       usage: E
[ultimate] (1). Felix Hammerl <felix@example.org>
[ultimate] (2)  Felix Hammerl <felix.hammerl@gmail.com>
```

And we've added a subkey for encryption.

```
gpg> addkey
```

Alright, one more time for authentivation.

```
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
   (7) DSA (set your own capabilities)
   (8) RSA (set your own capabilities)
  (10) ECC (sign only)
  (11) ECC (set your own capabilities)
  (12) ECC (encrypt only)
  (13) Existing key
  (14) Existing key from card
Your selection? 8
```

This time, we need to go the custom route again.

```

Possible actions for this RSA key: Sign Encrypt Authenticate
Current allowed actions: Sign Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? S

```

We don't need this key to sign.

```
Possible actions for this RSA key: Sign Encrypt Authenticate
Current allowed actions: Encrypt

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? E
```

We also don't need this key to sign.

```
Possible actions for this RSA key: Sign Encrypt Authenticate
Current allowed actions:

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? A
```

We *do* need this key to authenticate.

```

Possible actions for this RSA key: Sign Encrypt Authenticate
Current allowed actions: Authenticate

   (S) Toggle the sign capability
   (E) Toggle the encrypt capability
   (A) Toggle the authenticate capability
   (Q) Finished

Your selection? Q
```

We're done here, let's confirm.

```
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0)
```

Again, no expiration.

```
Key does not expire at all
Is this correct? (y/N) y
Really create? (y/N) y
```

Yup, looks about right. Let's confirm.

```
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  rsa4096/0x1E2BD87C697C5DDD
     created: 2022-08-30  expires: never       usage: C
     trust: ultimate      validity: ultimate
ssb  rsa4096/0xB800E83563709867
     created: 2022-08-30  expires: never       usage: S
ssb  rsa4096/0x460AAFECD0F316C1
     created: 2022-08-30  expires: never       usage: E
ssb  rsa4096/0x489C6E09BDDB455B
     created: 2022-08-30  expires: never       usage: A
[ultimate] (1). Felix Hammerl <felix@example.org>
[ultimate] (2)  Felix Hammerl <felix.hammerl@gmail.com>

gpg> save
```

We have added theree subkeys. Let's save this and we're done with the key creation.

```
> gpg --armor --export-secret-keys $KEYID > master.key
> gpg --armor --export $KEYID > master.pub
```

At this point, everything is set up and you must create a secure copy of `master.key`, `master.pub`, and the passphrase of the master key. Store it on a pendrive or any other appropriate space, but you must actually safely store it away now. You will need the master key in the future to rotate the subkeys!

Alright, now that we've backed up our master key, let's transfer the PGP key to our Yubikey.

First, we need to prepare our Yubikey. Let's connect to the Yubikey in edit mode.

```
> gpg --card-edit
...
Information about your Yubikey
...

gpg/card> admin
```

So we're connected and we're opening the Yubikey's administrative functions, because we need to change the passwords.

```
Admin commands are allowed

gpg/card> passwd
```

Cool, let's change the passwords.

```
gpg: OpenPGP card no. D2760001240102010006055532110000 detected

1 - change PIN
2 - unblock PIN
3 - change Admin PIN
4 - set the Reset Code
Q - quit

Your selection? 3
```

First, we want to set the Admin PIN. The default for the Yubikey is `12345678`. The Admin PIN can unlock the Yubikey when you've entered the wrong PIN thrice.

```
PIN changed.

1 - change PIN
2 - unblock PIN
3 - change Admin PIN
4 - set the Reset Code
Q - quit

Your selection? 1
```

Next, we want to set the regular PIN. The default for the Yubikey is `123456`.

```
PIN changed.

1 - change PIN
2 - unblock PIN
3 - change Admin PIN
4 - set the Reset Code
Q - quit

Your selection? q
```

With the PINs changed, let's leave the administrative area.

```

gpg/card> quit
```

And let's leave the Yubikey setup menu. We're now ready to transfer the key to the Yubikey. Please repeat the same PIN setup for all of your Yubikeys!

First, let's open the master key in edit mode, again. As I've done this before and I didn't want to re-initialize my Yubikey, please pardon that I've taken this section from [DrDuh's guide](https://github.com/drduh/YubiKey-Guide). The output might look a tad bit different, the commands are the same.

```
> gpg --edit-key $KEYID

Secret key is available.

sec  rsa4096/0xFF3E7D88647EBCDB
    created: 2017-10-09  expires: never       usage: C
    trust: ultimate      validity: ultimate
ssb  rsa4096/0xBECFA3C1AE191D15
    created: 2017-10-09  expires: 2018-10-09  usage: S
ssb  rsa4096/0x5912A795E90DD2CF
    created: 2017-10-09  expires: 2018-10-09  usage: E
ssb  rsa4096/0x3F29127E79649A3D
    created: 2017-10-09  expires: 2018-10-09  usage: A
[ultimate] (1). Dr Duh <doc@duh.to>

gpg> key 1
```

Alright, we've selected the first subkey to be sent to the Yubikey. 

```

sec  rsa4096/0xFF3E7D88647EBCDB
    created: 2017-10-09  expires: never       usage: C
    trust: ultimate      validity: ultimate
ssb* rsa4096/0xBECFA3C1AE191D15
    created: 2017-10-09  expires: 2018-10-09  usage: S
ssb  rsa4096/0x5912A795E90DD2CF
    created: 2017-10-09  expires: 2018-10-09  usage: E
ssb  rsa4096/0x3F29127E79649A3D
    created: 2017-10-09  expires: 2018-10-09  usage: A
[ultimate] (1). Dr Duh <doc@duh.to>

gpg> keytocard
```

Let's send it!

```
Please select where to store the key:
   (1) Signature key
   (3) Authentication key
Your selection? 1
```

We want the signing key to end up in the signing slot.

```

You need a passphrase to unlock the secret key for
user: "Dr Duh <doc@duh.to>"
4096-bit RSA key, ID 0xBECFA3C1AE191D15, created 2016-05-24

gpg> key 1
```

Alright! We need to deselect the first subkey to proceed.

```

gpg> key 2
```

Same procedure with the second key. Select it ...

```

sec  rsa4096/0xFF3E7D88647EBCDB
    created: 2017-10-09  expires: never       usage: C
    trust: ultimate      validity: ultimate
ssb  rsa4096/0xBECFA3C1AE191D15
    created: 2017-10-09  expires: 2018-10-09  usage: S
ssb* rsa4096/0x5912A795E90DD2CF
    created: 2017-10-09  expires: 2018-10-09  usage: E
ssb  rsa4096/0x3F29127E79649A3D
    created: 2017-10-09  expires: 2018-10-09  usage: A
[ultimate] (1). Dr Duh <doc@duh.to>

gpg> keytocard
```

... then send it ...

```
Please select where to store the key:
   (2) Encryption key
Your selection? 2
```

... to the Yubikey's encryption slot ...

```

gpg> key 2
```

... and then deselect it.

```

gpg> key 3
```

Same procedure with the third key used for authentication.

```

sec  rsa4096/0xFF3E7D88647EBCDB
    created: 2017-10-09  expires: never       usage: C
    trust: ultimate      validity: ultimate
ssb  rsa4096/0xBECFA3C1AE191D15
    created: 2017-10-09  expires: 2018-10-09  usage: S
ssb  rsa4096/0x5912A795E90DD2CF
    created: 2017-10-09  expires: 2018-10-09  usage: E
ssb* rsa4096/0x3F29127E79649A3D
    created: 2017-10-09  expires: 2018-10-09  usage: A
[ultimate] (1). Dr Duh <doc@duh.to>

gpg> keytocard
Please select where to store the key:
   (3) Authentication key
Your selection? 3
```

... And we're done!

```
gpg> save
```

Let's save our changes.

Ok, let's clean up for now. Since the keys have not been copied, but actually moved, we'll need to start fresh to set up the second key. Let's delete

```
> gpg --delete-secret-keys $KEYID
gpg (GnuPG) 2.3.7; Copyright (C) 2021 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.


sec  rsa4096/1E2BD87C697C5DDD 2022-08-30 Felix Hammerl <felix@example.org>

Delete this key from the keyring? (y/N) y
This is a secret key! - really delete? (y/N) y
```

We've deleted the secret key, now let's clean up the public keys for good measure, as well.

```
[30/08/22 18:49:53] ~
> gpg --delete-keys $KEYID
gpg (GnuPG) 2.3.7; Copyright (C) 2021 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.


pub  rsa4096/1E2BD87C697C5DDD 2022-08-30 Felix Hammerl <felix@example.org>

Delete this key from the keyring? (y/N) y
```

Alright, our keychain is clean again.

```
> gpg -K
```

The output should be empty. We're back to a clean keychain. Now, we'll restore the backup and put the same keys onto our backup Yubikey. 

```
> gpg --import master.key
gpg: key 1E2BD87C697C5DDD: public key "Felix Hammerl <felix@example.org>" imported
gpg: key 1E2BD87C697C5DDD: secret key imported
gpg: Total number processed: 1
gpg:               imported: 1
gpg:       secret keys read: 1
gpg:   secret keys imported: 1
[30/08/22 18:52:36] ~
> gpg -K
/Users/fhammerl/.gnupg/pubring.kbx
----------------------------------
sec   rsa4096 2022-08-30 [C]
      69B3C01A5E0F87BEBC181C741E2BD87C697C5DDD
uid           [ unknown] Felix Hammerl <felix@example.org>
uid           [ unknown] Felix Hammerl <felix.hammerl@gmail.com>
ssb   rsa4096 2022-08-30 [S]
ssb   rsa4096 2022-08-30 [E]
ssb   rsa4096 2022-08-30 [A]
```
With the backup restored, we'll repeat the process involving `keytocard` we did above. Only this time, don't nuke your keychain, yet.

We've set up all our keys, so let's announce ourselves to the world:

```
$ gpg --send-key $KEYID

$ gpg --keyserver pgp.mit.edu --send-key $KEYID

$ gpg --keyserver keys.gnupg.net --send-key $KEYID

$ gpg --keyserver hkps://keyserver.ubuntu.com:443 --send-key $KEYID
```

Now that everything is done, let's kill the master key and behave as if we were on a new machine:

```
> gpg --delete-secret-keys $KEYID

> gpg --delete-keys $KEYID

> gpg --keyserver pgp.mit.edu --recv-keys $KEYID

> gpg-connect-agent "scd serialno" "learn --force" /bye
```

We've re-import the public key from the public source, so now let's reinitialize GPG's smartcard utility: `gpg-connect-agent "scd serialno" "learn --force" /bye`.

Now, I promised we'd be able to use PGP in Gmail. For this, we'll use Mailvelope, which works amazingly well in Firefox or Chrome. Please go ahead and install the Mailvelope extension for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/mailvelope/) or [Chrome](https://chrome.google.com/webstore/detail/mailvelope/kajibbejlbohfaggdiogboambcijhkke). We already have `gpgme` installed. Please note that you **must have commented out** `throw-keyids` in your `gpg.conf`, otherwise this will not work.

Mailvelope uses native messaging, which enables an extension to exchange messages with a native application, installed on the user's computer. The native messaging serves the extensions without additional accesses over the web. For this, please add these JSON files on the paths indicated:

**Firefox**

```
> cat ~/Library/Application\ Support/Mozilla/NativeMessagingHosts/gpgmejson.json
{
    "name": "gpgmejson",
    "description": "Integration with GnuPG",
    "path": "/opt/homebrew/bin/gpgme-json",
    "type": "stdio",
    "allowed_extensions": [
        "jid1-AQqSMBYb0a8ADg@jetpack"
    ]
}
```

**Chrome**

```
> cat ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/gpgmejson.json
{
    "name": "gpgmejson",
    "description": "Integration with GnuPG",
    "path": "/opt/homebrew/bin/gpgme-json",
    "type": "stdio",
    "allowed_origins": [
        "chrome-extension://kajibbejlbohfaggdiogboambcijhkke/"
    ]
}
```

Please note that the files *must* be named `gpgmejson.json`, in accordance with the name property of the JSON file.

You also need to add /opt/homebrew/bin to launchd.

> sudo launchctl config system path /opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
> sudo launchctl config user path /opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin

Please restart the macOS for the changes to `launchd` to take effect.

Let's check if everything worked out. In the Mailvelope settings, in the General > OpenPGP Preferences, you should see "Which encryption backend do you prefer?", which indicates that GnuPG is available as an encryption backend. If yes, please select it. 

If we head over to the Key Management section in Mailvelope, we should see the key we just generated.

Now, let's decrypt stuff. The good people over at Mailvelope have taken up a refreshing new take on GPG key management, which means that before they show your key, they require you to validate it, proving that you have access to the key. 

* Let's copy our *public* key: `gpg --armor --export $KEYID | pbcopy`
* Paste your public key in the [key management section of Mailvelope's key server](https://keys.mailvelope.com/manage.html) in the section "OpenPGP key upload".
* You will receive a confirmation email from Mailvelope in your Gmail inbox.
* You should see the Mailvelope overlay where otherwise you'd only see PGP-encrypted ciphertext.
* Click "Show message"
* You should be prompted for PIN you've set for your Yubikey's PGP applet.
* You should be able to decrypt the message and confirm your ownership of the PGP key.

Congratulations, you've decrypted your first PGP message in the Gmail web interface, with the PGP key stored in your Yubikey!

Should you want to rotate your subkeys, please refer to [DrDuh's fantastic documentation](https://github.com/drduh/YubiKey-Guide#rotating-keys)!

Notes on GPG and Yubikeys:

Caveats: Of all the many funtions of your Yubikey, you can only ever use one at a time. The GPG agent has the unfortunate tendency to not "release" the Yubikey after use for other applications to use. Which means that you might need to kill the GPG agent via `gpgconf --kill gpg-agent`, if you see GPG being a bit possessive, e.g. when you can't read the OTP secrets as your Yubico Authenticator says "Failed to connect to Yubikey". It's annoying, but thanks to the popularity of PGP in modern email exchange, this problem should not arise all too often. In fact, I've added this bit to my `.zshrc` to make things a tad bit simpler when I change keys:

```
export GNUPGHOME=~/.gnupg
function reset_gpg() {
  gpg-connect-agent "scd serialno" "learn --force" /bye
}
function kill_gpg() {
  gpgconf --kill gpg-agent
}
```
